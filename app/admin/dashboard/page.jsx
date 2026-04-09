'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import Footer from '@/components/footer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [toast, setToast] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [statsView, setStatsView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        router.push('/admin/login');
      } else {
        setUser(session.user);
        fetchData();
      }
    };

    checkAuth();
  }, [router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch quotes & contacts
  const fetchData = async () => {
    setLoading(true);
    try {
      const [quotesRes, contactsRes] = await Promise.all([
        supabaseClient
          .from('quote_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabaseClient
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (quotesRes.error) {
        console.error('Error fetching quotes:', quotesRes.error);
      } else {
        console.log('Quotes fetched:', quotesRes.data?.length || 0);
        setQuotes(quotesRes.data || []);
      }

      if (contactsRes.error) {
        console.error('Error fetching contacts:', contactsRes.error);
      } else {
        console.log('Contacts fetched:', contactsRes.data?.length || 0);
        setContacts(contactsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Format relative date
  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Update status
  const updateStatus = async (table, id, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        handled_by: user?.email || 'unknown',
        handled_at: new Date().toISOString()
      };
      await supabaseClient
        .from(table)
        .update(updateData)
        .eq('id', id);
      showToast(`Status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating status', 'error');
      console.error('Error updating status:', err);
    }
  };

  // Toggle read status
  const toggleRead = async (table, id, isRead) => {
    try {
      const updateData = {
        is_read: !isRead,
        handled_by: user?.email || 'unknown',
        handled_at: new Date().toISOString()
      };
      await supabaseClient
        .from(table)
        .update(updateData)
        .eq('id', id);
      showToast(isRead ? 'Marked as unread' : 'Marked as read', 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating read status', 'error');
      console.error('Error updating read status:', err);
    }
  };

  // Save admin notes
  const saveAdminNotes = async (table, id, notes) => {
    try {
      const updateData = {
        admin_notes: notes,
        handled_by: user?.email || 'unknown',
        handled_at: new Date().toISOString()
      };
      await supabaseClient
        .from(table)
        .update(updateData)
        .eq('id', id);
      showToast('Notes saved', 'success');
    } catch (err) {
      showToast('Error saving notes', 'error');
      console.error('Error saving notes:', err);
    }
  };

  // Calculate stats by time period
  const getStatsByDay = () => {
    const days = {};
    [...quotes, ...contacts].forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      days[date] = (days[date] || 0) + 1;
    });
    return Object.entries(days).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const getStatsByMonth = () => {
    const months = {};
    [...quotes, ...contacts].forEach(item => {
      const date = new Date(item.created_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).sort();
  };

  const getStatsByYear = () => {
    const years = {};
    [...quotes, ...contacts].forEach(item => {
      const year = new Date(item.created_at).getFullYear();
      years[year] = (years[year] || 0) + 1;
    });
    return Object.entries(years).sort();
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row =>
        Object.values(row)
          .map(val => `"${String(val || '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Filter data
  const filterData = (data) => {
    return data.filter(item => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesUnread = !showUnreadOnly || !item.is_read;
      return matchesSearch && matchesStatus && matchesUnread;
    });
  };

  // Sort data
  const sortData = (data) => {
    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const filteredQuotes = sortData(filterData(quotes));
  const filteredContacts = sortData(filterData(contacts));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A0E9E5]"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#f0fffe] to-gray-50 flex flex-col">
      <style>{`
        @keyframes gradient-shift {
          0% { box-shadow: 0 0 20px rgba(160, 233, 229, 0.3), 0 0 40px rgba(67, 122, 150, 0.2); }
          50% { box-shadow: 0 0 30px rgba(160, 233, 229, 0.5), 0 0 60px rgba(67, 122, 150, 0.4); }
          100% { box-shadow: 0 0 20px rgba(160, 233, 229, 0.3), 0 0 40px rgba(67, 122, 150, 0.2); }
        }
        @keyframes fadeInScale {
          0% { 
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
            background-color: rgba(26, 54, 93, 0);
          }
          50% {
            background-color: rgba(26, 54, 93, 0.3);
          }
          100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
            background-color: rgba(26, 54, 93, 0.6);
          }
        }
        @keyframes modalSlideIn {
          0% { 
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pageSlideIn {
          0% {
            opacity: 0;
            transform: translateX(10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes navButtonActive {
          0% {
            box-shadow: inset 0 0 0px rgba(160, 233, 229, 0);
          }
          50% {
            box-shadow: inset 0 0 10px rgba(160, 233, 229, 0.3);
          }
          100% {
            box-shadow: inset 0 0 15px rgba(160, 233, 229, 0.2);
          }
        }
        @keyframes navButtonHover {
          0% {
            background-color: #f3f4f6;
          }
          100% {
            background-color: #e5e7eb;
          }
        }
        @media (min-width: 768px) {
          .sidebar-desktop {
            transform: translateX(0) !important;
            position: relative !important;
            right: auto !important;
            left: auto !important;
          }
        }
      `}</style>
      {/* Header */}
      <div className="bg-white shadow-md border-b-2 border-[#A0E9E5]">
        <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <img
              src="/logo/logo.png"
              alt="Sun Xpress Logo"
              className="h-10 sm:h-12 w-auto drop-shadow-lg"
            />
            <h1 className="hidden sm:block text-lg sm:text-xl font-bold bg-gradient-to-r from-[#0D1F3C] to-[#437A96] bg-clip-text text-transparent">Admin Panel</h1>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            <button
              onClick={fetchData}
              className="px-2 sm:px-4 py-2 bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white rounded-lg text-xs sm:text-sm font-semibold transition transform hover:scale-105 hover:shadow-xl shadow-md animate-pulse"
              style={{
                animation: 'gradient-shift 3s ease-in-out infinite, pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                backgroundSize: '200% 200%'
              }}
            >
              Refresh
            </button>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="#0D1F3C" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Menu - Slides from right to left on mobile */}
        <div className="sidebar-desktop fixed inset-y-0 right-0 w-64 bg-white shadow-lg border-l-2 border-[#A0E9E5] z-40 md:relative md:inset-auto md:translate-x-0 md:border-l-0 md:border-r-2 transition-transform duration-300" style={{
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)') : 'translateX(0)'
        }}>
          <nav className="p-6 space-y-2 flex flex-col h-full">
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden self-end p-2 hover:bg-gray-100 rounded-lg transition mb-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="#0D1F3C" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-2 flex-1">
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === 'dashboard' ? { animation: 'navButtonActive 0.6s ease-out' } : {}}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('quotes'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                  activeTab === 'quotes'
                    ? 'bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === 'quotes' ? { animation: 'navButtonActive 0.6s ease-out' } : {}}
              >
                Quotes ({quotes.length})
              </button>
              <button
                onClick={() => { setActiveTab('contacts'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                  activeTab === 'contacts'
                    ? 'bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === 'contacts' ? { animation: 'navButtonActive 0.6s ease-out' } : {}}
              >
                Messages ({contacts.length})
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === 'profile' ? { animation: 'navButtonActive 0.6s ease-out' } : {}}
              >
                Profile
              </button>
            </div>
            {/* Logout Button at Bottom of Mobile Menu */}
            <button
              onClick={async () => {
                await supabaseClient.auth.signOut();
                setMobileMenuOpen(false);
                router.push('/admin/login');
              }}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg text-white font-semibold shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Main Content */}
        <div key={activeTab} className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-y-auto pb-12" style={{ animation: 'pageSlideIn 0.4s ease-out' }}>

          {/* Dashboard Tab - Stats & Analytics */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 pb-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">New Quotes</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {quotes.filter(q => q.status === 'new').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">New Messages</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {contacts.filter(c => c.status === 'new').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Unread</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {quotes.filter(q => !q.is_read).length + contacts.filter(c => !c.is_read).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Submissions</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {quotes.length + contacts.length}
                  </p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-8 w-full">
                <div className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto">
                  <button
                    onClick={() => setStatsView('overview')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statsView === 'overview'
                        ? 'bg-[#0D1F3C] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setStatsView('daily')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statsView === 'daily'
                        ? 'bg-[#0D1F3C] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setStatsView('monthly')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statsView === 'monthly'
                        ? 'bg-[#0D1F3C] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setStatsView('yearly')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      statsView === 'yearly'
                        ? 'bg-[#0D1F3C] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Yearly
                  </button>
                </div>

                {/* Chart Display */}
                <div className="flex flex-col space-y-4 mt-6 min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] w-full min-w-0">
                  {statsView === 'overview' && (
                    <div className="text-center py-12">
                      <p className="text-gray-600 font-medium mb-8 text-lg">Submission Overview</p>
                      <div className="flex gap-8 justify-center">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-blue-600">{quotes.length}</p>
                          <p className="text-sm text-gray-600 mt-2">Total Quotes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-green-600">{contacts.length}</p>
                          <p className="text-sm text-gray-600 mt-2">Total Messages</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {statsView === 'daily' && (
                    <div className="w-full">
                      <p className="text-gray-600 font-medium mb-4">Submissions Per Day</p>
                      <div className="w-full h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getStatsByDay().map(([date, count]) => ({ date: new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), count }))} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip contentStyle={{ backgroundColor: '#1A365D', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(160, 233, 229, 0.1)' }} />
                          <Legend />
                          <Bar dataKey="count" fill="#0D1F3C" radius={[8, 8, 0, 0]} name="Submissions" />
                        </BarChart>
                      </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {statsView === 'monthly' && (
                    <div className="w-full">
                      <p className="text-gray-600 font-medium mb-4">Submissions Per Month</p>
                      <div className="w-full h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getStatsByMonth().map(([month, count]) => ({ month, count }))} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="month" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip contentStyle={{ backgroundColor: '#1A365D', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(160, 233, 229, 0.1)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="#319795" strokeWidth={3} dot={{ fill: '#0D1F3C', r: 6 }} activeDot={{ r: 8 }} name="Submissions" />
                        </LineChart>
                      </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {statsView === 'yearly' && (
                    <div className="w-full">
                      <p className="text-gray-600 font-medium mb-4">Submissions Per Year</p>
                      <div className="w-full h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                          <Pie
                            data={getStatsByYear().map(([year, count]) => ({ name: year, value: count }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#0D1F3C" />
                            <Cell fill="#437A96" />
                            <Cell fill="#319795" />
                            <Cell fill="#A0E9E5" />
                            <Cell fill="#267472" />
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1A365D', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quotes & Contacts Tabs */}
          {(activeTab === 'quotes' || activeTab === 'contacts') && (
            <div>
              {/* Search & Filter */}
              <div className="bg-white rounded-xl shadow-md mb-6 p-4 sm:p-6 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Search by name, email, subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0E9E5] transition bg-gray-50/50 hover:bg-white text-black placeholder:text-gray-500 text-sm"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A0E9E5] transition bg-gray-50/50 hover:bg-white text-black text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => {
                      setShowUnreadOnly(!showUnreadOnly);
                      setSortBy('created_at');
                    }}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
                      showUnreadOnly
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showUnreadOnly ? 'Unread Only' : 'Show All'}
                  </button>
                  <button
                    onClick={() =>
                      exportToCSV(
                        activeTab === 'quotes' ? filteredQuotes : filteredContacts,
                        `${activeTab}-${new Date().getTime()}.csv`
                      )
                    }
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#319795] to-[#267472] text-white rounded-lg hover:from-[#2a8680] hover:to-[#1f5c5a] text-xs sm:text-sm font-semibold transition shadow-md"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Tables */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50/50 text-xs sm:text-base">
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-semibold text-center transition relative ${
                      activeTab === 'quotes'
                        ? 'text-[#0D1F3C]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Quotes ({quotes.length})
                    {activeTab === 'quotes' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A0E9E5] to-[#437A96]"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 font-semibold text-center transition relative ${
                      activeTab === 'contacts'
                        ? 'text-[#0D1F3C]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Messages ({contacts.length})
                    {activeTab === 'contacts' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A0E9E5] to-[#437A96]"></div>
                    )}
                  </button>
                </div>

                {/* Quotes Table */}
                {activeTab === 'quotes' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th
                            onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            onClick={() => { setSortBy('email'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Route</th>
                          <th
                            onClick={() => { setSortBy('status'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            onClick={() => { setSortBy('created_at'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Handled By</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuotes.length > 0 ? (
                          filteredQuotes.map((quote) => (
                            <tr
                              key={quote.id}
                              onClick={() => { setSelectedItem({ ...quote, type: 'quote' }); setShowModal(true); }}
                              className={`border-b transition hover:bg-blue-50/50 cursor-pointer ${
                                !quote.is_read ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-l-[#437A96]' : ''
                              }`}
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{quote.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{quote.email}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {quote.port_of_loading} → {quote.port_of_discharge}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <select
                                  onClick={(e) => e.stopPropagation()}
                                  value={quote.status}
                                  onChange={(e) => updateStatus('quote_requests', quote.id, e.target.value)}
                                  className="px-3 py-1 text-xs font-semibold border-2 border-gray-200 rounded bg-white text-[#0D1F3C] hover:border-[#A0E9E5] transition"
                                >
                                  <option value="new">New</option>
                                  <option value="pending">Pending</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {getRelativeDate(quote.created_at)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {quote.handled_by ? (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                    {quote.handled_by}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => toggleRead('quote_requests', quote.id, quote.is_read)}
                                  className="px-3 py-1 text-xs font-bold rounded text-white bg-gradient-to-r from-[#319795] to-[#267472] hover:from-[#2a8680] hover:to-[#1f5c5a] transition"
                                >
                                  {quote.is_read ? 'Read' : 'Mark Read'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center">
                              <p className="text-gray-500 font-medium">No quotes found</p>
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setFilterStatus('all');
                                  setShowUnreadOnly(false);
                                }}
                                className="mt-2 text-xs text-[#319795] hover:text-[#267472] font-semibold"
                              >
                                Clear filters
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Contacts Table */}
                {activeTab === 'contacts' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th
                            onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            onClick={() => { setSortBy('email'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Subject</th>
                          <th
                            onClick={() => { setSortBy('status'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th
                            onClick={() => { setSortBy('created_at'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                            className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                          >
                            Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Handled By</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact) => (
                            <tr
                              key={contact.id}
                              onClick={() => { setSelectedItem({ ...contact, type: 'contact' }); setShowModal(true); }}
                              className={`border-b transition hover:bg-green-50/50 cursor-pointer ${
                                !contact.is_read ? 'bg-gradient-to-r from-green-50 to-transparent border-l-4 border-l-[#319795]' : ''
                              }`}
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{contact.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{contact.subject || 'General Inquiry'}</td>
                              <td className="px-6 py-4 text-sm">
                                <select
                                  onClick={(e) => e.stopPropagation()}
                                  value={contact.status}
                                  onChange={(e) => updateStatus('contact_messages', contact.id, e.target.value)}
                                  className="px-3 py-1 text-xs font-semibold border-2 border-gray-200 rounded bg-white text-[#0D1F3C] hover:border-[#A0E9E5] transition"
                                >
                                  <option value="new">New</option>
                                  <option value="pending">Pending</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {getRelativeDate(contact.created_at)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {contact.handled_by ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                    {contact.handled_by}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => toggleRead('contact_messages', contact.id, contact.is_read)}
                                  className="px-3 py-1 text-xs font-bold rounded text-white bg-gradient-to-r from-[#319795] to-[#267472] hover:from-[#2a8680] hover:to-[#1f5c5a] transition"
                                >
                                  {contact.is_read ? 'Read' : 'Mark Read'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center">
                              <p className="text-gray-500 font-medium">No messages found</p>
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setFilterStatus('all');
                                  setShowUnreadOnly(false);
                                }}
                                className="mt-2 text-xs text-[#319795] hover:text-[#267472] font-semibold"
                              >
                                Clear filters
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && user && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#0D1F3C] to-[#437A96] rounded-lg shadow-lg p-4 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white rounded-full flex flex-shrink-0 items-center justify-center text-2xl sm:text-3xl font-bold text-[#0D1F3C]">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold truncate">{user?.email || 'Admin User'}</h2>
                    <p className="text-gray-100 mt-2">👤 Administrator</p>
                    <p className="text-gray-100 text-xs sm:text-sm mt-1">User ID: {user?.id}</p>
                  </div>
                </div>
              </div>

              {/* Profile Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Information */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Email</p>
                      <p className="text-gray-900 font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">User ID</p>
                      <p className="text-gray-900 font-medium text-xs truncate bg-gray-50 p-2 rounded">{user?.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Role</p>
                      <p className="text-gray-900 font-medium">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Admin</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Account Created</p>
                      <p className="text-gray-900 font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">Dashboard Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Total Quotes</p>
                      <p className="text-2xl font-bold text-blue-600">{quotes.length}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Total Messages</p>
                      <p className="text-2xl font-bold text-green-600">{contacts.length}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Unread Items</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {quotes.filter(q => !q.is_read).length + contacts.filter(c => !c.is_read).length}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">New Submissions</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {quotes.filter(q => q.status === 'new').length + contacts.filter(c => c.status === 'new').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Activity */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">👨‍💼 Your Recent Activity</h3>
                <div className="space-y-3">
                  {[...quotes, ...contacts]
                    .filter(item => item.handled_by === user?.email)
                    .slice(0, 10)
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.port_of_loading ? '📦 Quote' : '💬 Message'} - {item.name || item.email}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{getRelativeDate(item.handled_at || item.updated_at)}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          item.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  {[...quotes, ...contacts].filter(item => item.handled_by === user?.email).length === 0 && (
                    <p className="text-gray-500 text-sm italic">No activity yet. Start managing submissions to see them here.</p>
                  )}
                </div>
              </div>

              {/* Security & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">🔒 Security</h3>
                  <div className="space-y-3">
                    <p className="text-gray-700 text-sm">Keep your account secure with strong authentication.</p>
                    <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition">
                      Change Password
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">⚙️ Preferences</h3>
                  <div className="space-y-3">
                    <p className="text-gray-700 text-sm">Customize your admin dashboard experience.</p>
                    <button className="w-full px-4 py-2 bg-[#319795] hover:bg-[#267472] text-white rounded-lg font-semibold transition">
                      View Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          style={{ animation: 'fadeInScale 0.4s ease-out', backgroundColor: 'rgba(26, 54, 93, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-2xl sm:max-w-4xl max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ animation: 'modalSlideIn 0.5s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #437A96 0%, #1A365D 100%)' }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-wide truncate">
                  {selectedItem.type === 'quote' ? 'Quote Request Details' : 'Message Details'}
                </h2>
                <p className="text-xs mt-1 truncate" style={{ color: '#A0E9E5' }}>
                  ID: {selectedItem.id} • {getRelativeDate(selectedItem.updated_at || selectedItem.created_at)}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/20 text-white flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Accent Line */}
            <div className="h-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #B2F5EA 0%, #319795 50%, #2C5282 100%)' }} />

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#1A365D' }}>Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Name</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base truncate">{selectedItem.email}</p>
                  </div>
                  {selectedItem.phone && (
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedItem.phone}</p>
                    </div>
                  )}
                  {selectedItem.company && (
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Company</p>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedItem.company}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Quote Specific Fields */}
              {selectedItem.type === 'quote' && (
                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#1A365D' }}>Shipping Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">From Port (Loading)</p>
                      <p className="text-gray-900 font-medium text-base">{selectedItem.port_of_loading}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">To Port (Discharge)</p>
                      <p className="text-gray-900 font-medium text-base">{selectedItem.port_of_discharge}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Container Type</p>
                      <p className="text-gray-900 font-medium text-base">{selectedItem.container_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Weight</p>
                      <p className="text-gray-900 font-medium text-base">{selectedItem.weight || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Specific Fields */}
              {selectedItem.type === 'contact' && (
                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#1A365D' }}>Message Content</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Subject</p>
                      <p className="text-gray-900 font-medium text-base">{selectedItem.subject || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Message</p>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: '#319795' }}>
                        <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{selectedItem.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Status & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Status</p>
                  <select
                    value={selectedItem.status}
                    onChange={(e) => {
                      const table = selectedItem.type === 'quote' ? 'quote_requests' : 'contact_messages';
                      updateStatus(table, selectedItem.id, e.target.value);
                      setSelectedItem({ ...selectedItem, status: e.target.value });
                    }}
                    className="w-full px-3 py-2 border-2 rounded-lg font-semibold transition text-sm"
                    style={{ borderColor: '#A0E9E5', color: '#1A365D' }}
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Read Status</p>
                  <button
                    onClick={() => {
                      const table = selectedItem.type === 'quote' ? 'quote_requests' : 'contact_messages';
                      toggleRead(table, selectedItem.id, selectedItem.is_read);
                      setSelectedItem({ ...selectedItem, is_read: !selectedItem.is_read });
                    }}
                    className="w-full px-3 py-2 text-white rounded-lg font-semibold transition text-sm"
                    style={{ background: selectedItem.is_read ? '#CBD5E0' : 'linear-gradient(135deg, #319795 0%, #267472 100%)' }}
                  >
                    {selectedItem.is_read ? '✓ Read' : 'Mark as Read'}
                  </button>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Handled By</p>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    <p className="font-medium text-sm truncate" style={{ color: selectedItem.handled_by ? '#1A365D' : '#9CA3AF' }}>
                      {selectedItem.handled_by || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Admin Notes */}
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Admin Notes</p>
                <textarea
                  value={adminNotes[selectedItem.id] || selectedItem.admin_notes || ''}
                  onChange={(e) => setAdminNotes({ ...adminNotes, [selectedItem.id]: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg text-sm resize-none focus:outline-none transition"
                  style={{ borderColor: '#A0E9E5', minHeight: '120px' }}
                  placeholder="Add internal notes, follow-up items, or important observations..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 border-t"
              style={{ borderColor: '#E2E8F0', background: '#F0FAFA' }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-gray-200 order-2 sm:order-1"
                style={{ background: '#E2E8F0', color: '#1A365D' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const table = selectedItem.type === 'quote' ? 'quote_requests' : 'contact_messages';
                  saveAdminNotes(table, selectedItem.id, adminNotes[selectedItem.id] || '');
                  setShowModal(false);
                }}
                className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md order-1 sm:order-2"
                style={{ background: 'linear-gradient(135deg, #437A96 0%, #1A365D 100%)' }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}