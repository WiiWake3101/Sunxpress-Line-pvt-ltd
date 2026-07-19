'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import Footer from '@/components/footer';

const CALL_STATUS_OPTIONS = [
  { value: 'not_called', label: 'Not Called Yet', badge: 'bg-gray-100 text-gray-700' },
  { value: 'called_answered', label: 'Called - Answered', badge: 'bg-green-100 text-green-800' },
  { value: 'called_no_answer', label: 'Called - No Answer', badge: 'bg-yellow-100 text-yellow-800' },
  { value: 'left_voicemail', label: 'Left Voicemail', badge: 'bg-blue-100 text-blue-800' },
  { value: 'follow_up_scheduled', label: 'Follow-up Scheduled', badge: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', badge: 'bg-teal-100 text-teal-800' },
];

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [assignedQuotes, setAssignedQuotes] = useState([]);
  const [assignedContacts, setAssignedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState({ call_status: 'not_called', notes: '', follow_up_date: '' });

  // Check authentication and fetch staff info
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        router.push('/staff/login');
        return;
      }

      // Fetch staff info
      const { data: staffData, error } = await supabaseClient
        .from('office_staff')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (error || !staffData) {
        await supabaseClient.auth.signOut();
        router.push('/staff/login');
        return;
      }

      setUser(session.user);
      setStaffInfo(staffData);
      fetchAssignedItems(staffData.id);
    };

    checkAuth();
  }, [router]);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch assigned items
  const fetchAssignedItems = async (staffId, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [quotesRes, contactsRes] = await Promise.all([
        supabaseClient
          .from('quote_requests')
          .select('*')
          .eq('assigned_to', staffId)
          .order('created_at', { ascending: false }),
        supabaseClient
          .from('contact_messages')
          .select('*')
          .eq('assigned_to', staffId)
          .order('created_at', { ascending: false }),
      ]);

      if (!quotesRes.error) setAssignedQuotes(quotesRes.data || []);
      if (!contactsRes.error) setAssignedContacts(contactsRes.data || []);

      const quoteIds = (quotesRes.data || []).map(q => q.id);
      const contactIds = (contactsRes.data || []).map(c => c.id);
      await fetchFollowUps(quoteIds, contactIds);
    } catch (err) {
      console.error('Error fetching assigned items:', err);
      if (!silent) showToast('Failed to fetch data', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch call/follow-up tracking history for assigned items
  const fetchFollowUps = async (quoteIds = [], contactIds = []) => {
    try {
      const [qRes, cRes] = await Promise.all([
        quoteIds.length
          ? supabaseClient.from('follow_ups').select('*').eq('reference_type', 'quote').in('reference_id', quoteIds).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] }),
        contactIds.length
          ? supabaseClient.from('follow_ups').select('*').eq('reference_type', 'contact').in('reference_id', contactIds).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);
      setFollowUps([...(qRes.data || []), ...(cRes.data || [])]);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    }
  };

  // Manual refresh (data only, no page reload)
  const handleRefresh = async () => {
    if (!staffInfo) return;
    setIsRefreshing(true);
    await fetchAssignedItems(staffInfo.id, true);
    showToast('Data refreshed successfully');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Silent refresh every 30 seconds
  useEffect(() => {
    if (!staffInfo) return;
    const interval = setInterval(() => {
      fetchAssignedItems(staffInfo.id, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [staffInfo]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter data
  const filterData = (data) => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesUnread = !showUnreadOnly || !item.is_read;
      
      return matchesSearch && matchesStatus && matchesUnread;
    });
  };

  // Sort data
  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(','));
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast('Export successful');
  };

  const updateStatus = async (table, id, newStatus) => {
    const { error } = await supabaseClient
      .from(table)
      .update({ status: newStatus, handled_by: staffInfo?.name })
      .eq('id', id);

    if (error) {
      showToast('Failed to update status', 'error');
    } else {
      showToast('Status updated successfully');
      fetchAssignedItems(staffInfo.id);
    }
  };

  const markAsRead = async (table, id) => {
    await supabaseClient
      .from(table)
      .update({ is_read: true })
      .eq('id', id);
    fetchAssignedItems(staffInfo.id);
  };

  // Log a call/follow-up update for the selected item
  const addFollowUp = async () => {
    if (!selectedItem || !staffInfo) return;
    try {
      const { error } = await supabaseClient.from('follow_ups').insert([{
        reference_type: selectedItem.type,
        reference_id: selectedItem.id,
        call_status: newFollowUp.call_status,
        notes: newFollowUp.notes || null,
        follow_up_date: newFollowUp.follow_up_date || null,
        created_by: user?.email || 'unknown',
        created_by_name: staffInfo?.name || user?.email || 'Staff',
      }]);
      if (error) throw error;
      showToast('Follow-up logged successfully');
      setNewFollowUp({ call_status: 'not_called', notes: '', follow_up_date: '' });
      fetchAssignedItems(staffInfo.id, true);
    } catch (err) {
      showToast('Failed to log follow-up', 'error');
      console.error('Error adding follow-up:', err);
    }
  };

  // Get follow-up history for a specific item (newest first)
  const getItemFollowUps = (type, id) => {
    return followUps
      .filter(f => f.reference_type === type && f.reference_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Get the latest follow-up entry for a specific item (for table badges)
  const getLatestFollowUp = (type, id) => {
    const items = getItemFollowUps(type, id);
    return items.length > 0 ? items[0] : null;
  };

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

  // Apply filters and sorting
  const filteredQuotes = sortData(filterData(assignedQuotes));
  const filteredContacts = sortData(filterData(assignedContacts));

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
            <h1 className="hidden sm:block text-lg sm:text-xl font-bold bg-gradient-to-r from-[#0D1F3C] to-[#437A96] bg-clip-text text-transparent">
              Staff Portal
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-2 sm:px-4 py-2 bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white rounded-lg text-xs sm:text-sm font-semibold transition transform hover:scale-105 hover:shadow-xl shadow-md animate-pulse disabled:opacity-50"
              style={{
                animation: 'gradient-shift 3s ease-in-out infinite, pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                backgroundSize: '200% 200%'
              }}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
                Quotes ({assignedQuotes.length})
                {assignedQuotes.filter(q => !q.is_read).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {assignedQuotes.filter(q => !q.is_read).length}
                  </span>
                )}
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
                Messages ({assignedContacts.length})
                {assignedContacts.filter(c => !c.is_read).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {assignedContacts.filter(c => !c.is_read).length}
                  </span>
                )}
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
            {/* Logout Button at Bottom */}
            <button
              onClick={async () => {
                await supabaseClient.auth.signOut();
                setMobileMenuOpen(false);
                router.push('/staff/login');
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
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 pb-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Quotes</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">{assignedQuotes.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Messages</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">{assignedContacts.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Pending</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {assignedQuotes.filter(q => q.status === 'pending' || q.status === 'new').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Unread</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {assignedQuotes.filter(q => !q.is_read).length + assignedContacts.filter(c => !c.is_read).length}
                  </p>
                </div>
              </div>

              {/* Quick Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotes */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4">Recent Quote Requests</h3>
                  <div className="space-y-3">
                    {assignedQuotes.slice(0, 5).map(quote => (
                      <div key={quote.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => { setActiveTab('quotes'); }}>
                        <div className={`w-2 h-2 mt-2 rounded-full ${quote.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="font-semibold text-[#0D1F3C]">{quote.name}</p>
                          <p className="text-sm text-gray-600">{quote.port_of_loading} → {quote.port_of_discharge}</p>
                          <p className="text-xs text-gray-400 mt-1">{getRelativeDate(quote.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    {assignedQuotes.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No quotes assigned yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4">Recent Messages</h3>
                  <div className="space-y-3">
                    {assignedContacts.slice(0, 5).map(contact => (
                      <div key={contact.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => { setActiveTab('contacts'); }}>
                        <div className={`w-2 h-2 mt-2 rounded-full ${contact.is_read ? 'bg-gray-300' : 'bg-green-500'}`} />
                        <div className="flex-1">
                          <p className="font-semibold text-[#0D1F3C]">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.subject || 'General Inquiry'}</p>
                          <p className="text-xs text-gray-400 mt-1">{getRelativeDate(contact.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    {assignedContacts.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No messages assigned yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quotes Table */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              {/* Filters & Search */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Search quotes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0D1F3C] focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-[#0D1F3C] focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="quoted">Quoted</option>
                    <option value="converted">Converted</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                        showUnreadOnly ? 'bg-[#0D1F3C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showUnreadOnly ? 'Show All' : 'Unread Only'}
                    </button>
                    <button
                      onClick={() => exportToCSV(filteredQuotes, 'quotes.csv')}
                      className="px-4 py-2 bg-[#0D1F3C] text-white rounded-lg font-semibold hover:bg-[#1a365d] transition"
                      title="Export to CSV"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotes Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0D1F3C] text-white">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Name</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Email</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Route</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Status</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Call Status</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuotes.map((quote, idx) => (
                        <tr
                          key={quote.id}
                          onClick={() => { setSelectedItem({ ...quote, type: 'quote' }); setShowModal(true); setNewFollowUp({ call_status: 'not_called', notes: '', follow_up_date: '' }); markAsRead('quote_requests', quote.id); }}
                          className={`border-b transition hover:bg-blue-50 cursor-pointer ${
                            !quote.is_read ? 'bg-blue-50/50' : ''
                          } ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                              {!quote.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                              <span className="text-sm font-semibold text-[#0D1F3C]">{quote.name}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{quote.email}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{quote.port_of_loading} → {quote.port_of_discharge}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <select
                              onClick={(e) => e.stopPropagation()}
                              value={quote.status}
                              onChange={(e) => updateStatus('quote_requests', quote.id, e.target.value)}
                              className={`px-2 sm:px-3 py-1 text-xs font-bold border-2 rounded-lg ${
                                quote.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                quote.status === 'quoted' ? 'bg-green-100 text-green-800 border-green-300' :
                                'bg-purple-100 text-purple-800 border-purple-300'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="pending">Pending</option>
                              <option value="quoted">Quoted</option>
                              <option value="converted">Converted</option>
                            </select>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {(() => {
                              const latest = getLatestFollowUp('quote', quote.id);
                              const opt = CALL_STATUS_OPTIONS.find(o => o.value === (latest?.call_status || 'not_called'));
                              return (
                                <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${opt?.badge || 'bg-gray-100 text-gray-700'}`}>
                                  {opt?.label || 'Not Called Yet'}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{getRelativeDate(quote.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredQuotes.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-semibold">No quote requests found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {/* Filters & Search */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0D1F3C] focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-[#0D1F3C] focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                        showUnreadOnly ? 'bg-[#0D1F3C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showUnreadOnly ? 'Show All' : 'Unread Only'}
                    </button>
                    <button
                      onClick={() => exportToCSV(filteredContacts, 'messages.csv')}
                      className="px-4 py-2 bg-[#0D1F3C] text-white rounded-lg font-semibold hover:bg-[#1a365d] transition"
                      title="Export to CSV"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Contacts Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0D1F3C] text-white">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Name</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Email</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Subject</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Status</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Call Status</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact, idx) => (
                        <tr
                          key={contact.id}
                          onClick={() => { setSelectedItem({ ...contact, type: 'contact' }); setShowModal(true); setNewFollowUp({ call_status: 'not_called', notes: '', follow_up_date: '' }); markAsRead('contact_messages', contact.id); }}
                          className={`border-b transition hover:bg-green-50 cursor-pointer ${
                            !contact.is_read ? 'bg-green-50/50' : ''
                          } ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                              {!contact.is_read && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                              <span className="text-sm font-semibold text-[#0D1F3C]">{contact.name}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{contact.email}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{contact.subject || 'General Inquiry'}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <select
                              onClick={(e) => e.stopPropagation()}
                              value={contact.status}
                              onChange={(e) => updateStatus('contact_messages', contact.id, e.target.value)}
                              className={`px-2 sm:px-3 py-1 text-xs font-bold border-2 rounded-lg ${
                                contact.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                contact.status === 'contacted' ? 'bg-green-100 text-green-800 border-green-300' :
                                'bg-purple-100 text-purple-800 border-purple-300'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {(() => {
                              const latest = getLatestFollowUp('contact', contact.id);
                              const opt = CALL_STATUS_OPTIONS.find(o => o.value === (latest?.call_status || 'not_called'));
                              return (
                                <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${opt?.badge || 'bg-gray-100 text-gray-700'}`}>
                                  {opt?.label || 'Not Called Yet'}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{getRelativeDate(contact.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-semibold">No messages found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && staffInfo && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#0D1F3C] to-[#437A96] rounded-lg shadow-lg p-4 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white rounded-full flex flex-shrink-0 items-center justify-center text-2xl sm:text-3xl font-bold text-[#0D1F3C]">
                    {staffInfo?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold truncate">{staffInfo?.name || 'Staff Member'}</h2>
                    <p className="text-gray-100 mt-2">👤 Office Staff</p>
                    <p className="text-gray-100 text-xs sm:text-sm mt-1">{user?.email}</p>
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
                      <p className="text-gray-600 text-sm font-semibold">Name</p>
                      <p className="text-gray-900 font-medium">{staffInfo?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Email</p>
                      <p className="text-gray-900 font-medium">{staffInfo?.email || user?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Role</p>
                      <p className="text-gray-900 font-medium">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Staff</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Status</p>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${staffInfo?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {staffInfo?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    {staffInfo?.created_at && (
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Joined</p>
                        <p className="text-gray-900 font-medium">{new Date(staffInfo.created_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">Your Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Assigned Quotes</p>
                      <p className="text-2xl font-bold text-blue-600">{assignedQuotes.length}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Assigned Messages</p>
                      <p className="text-2xl font-bold text-green-600">{assignedContacts.length}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Unread Items</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {assignedQuotes.filter(q => !q.is_read).length + assignedContacts.filter(c => !c.is_read).length}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm font-semibold">Follow-Ups Logged</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {followUps.filter(f => f.created_by === user?.email).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">📋 Your Recent Activity</h3>
                <div className="space-y-3">
                  {[...assignedQuotes, ...assignedContacts]
                    .filter(item => item.handled_by === staffInfo?.name)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10)
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.port_of_loading ? '📦 Quote' : '💬 Message'} - {item.name || item.email}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{getRelativeDate(item.created_at)}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          item.status === 'resolved' || item.status === 'converted'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'contacted' || item.status === 'quoted'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  {[...assignedQuotes, ...assignedContacts].filter(item => item.handled_by === staffInfo?.name).length === 0 && (
                    <p className="text-gray-500 text-sm italic">No activity yet. Start managing your assigned items to see them here.</p>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#0D1F3C] mb-4 border-b pb-3">🔒 Security</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">Keep your account secure with strong authentication.</p>
                  <button className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-black" style={{ color: '#0D1F3C' }}>
                  {selectedItem.type === 'quote' ? 'Quote Request Details' : 'Message Details'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Name</p>
                <p className="text-lg font-bold" style={{ color: '#0D1F3C' }}>{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-gray-900">{selectedItem.email}</p>
              </div>
              {selectedItem.type === 'quote' ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Company</p>
                    <p className="text-gray-900">{selectedItem.company || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Phone</p>
                    <p className="text-gray-900">{selectedItem.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Service</p>
                    <p className="text-gray-900">{selectedItem.service}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Route</p>
                    <p className="text-gray-900">{selectedItem.port_of_loading} → {selectedItem.port_of_discharge}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Container Type</p>
                    <p className="text-gray-900">{selectedItem.container_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Cargo Details</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.cargo_details}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Phone</p>
                    <p className="text-gray-900">{selectedItem.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Subject</p>
                    <p className="text-gray-900">{selectedItem.subject || 'General Inquiry'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Message</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.message}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-600">Submitted</p>
                <p className="text-gray-900">{new Date(selectedItem.created_at).toLocaleString()}</p>
              </div>

              {/* Call & Follow-Up Tracking */}
              <div className="pt-4 border-t">
                <h3 className="text-base font-bold mb-3" style={{ color: '#0D1F3C' }}>Call & Follow-Up Tracking</h3>

                {/* History */}
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {getItemFollowUps(selectedItem.type, selectedItem.id).length > 0 ? (
                    getItemFollowUps(selectedItem.type, selectedItem.id).map((entry) => {
                      const opt = CALL_STATUS_OPTIONS.find(o => o.value === entry.call_status);
                      return (
                        <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${opt?.badge || 'bg-gray-100 text-gray-700'}`}>
                              {opt?.label || entry.call_status}
                            </span>
                            <span className="text-xs text-gray-400">{getRelativeDate(entry.created_at)}</span>
                          </div>
                          {entry.notes && <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>}
                          {entry.follow_up_date && (
                            <p className="text-xs text-gray-500 mt-1">Follow-up on: {new Date(entry.follow_up_date).toLocaleDateString()}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">by {entry.created_by_name || entry.created_by}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-400 italic">No follow-up history yet</p>
                  )}
                </div>

                {/* Add New Entry */}
                <div className="bg-blue-50/50 rounded-lg p-4 space-y-3">
                  <select
                    value={newFollowUp.call_status}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, call_status: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:border-[#0D1F3C] focus:outline-none"
                  >
                    {CALL_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={newFollowUp.notes}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                    placeholder="Add notes about the call or follow-up..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm resize-none bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0D1F3C] focus:outline-none"
                    rows={2}
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      value={newFollowUp.follow_up_date}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, follow_up_date: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:border-[#0D1F3C] focus:outline-none"
                    />
                    <button
                      onClick={addFollowUp}
                      className="px-4 py-2 bg-[#0D1F3C] text-white rounded-lg text-sm font-semibold hover:bg-[#1a365d] transition"
                    >
                      Log Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
