'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import Footer from '@/components/footer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CALL_STATUS_OPTIONS = [
  { value: 'not_called', label: 'Not Called Yet', badge: 'bg-gray-100 text-gray-700' },
  { value: 'called_answered', label: 'Called - Answered', badge: 'bg-green-100 text-green-800' },
  { value: 'called_no_answer', label: 'Called - No Answer', badge: 'bg-yellow-100 text-yellow-800' },
  { value: 'left_voicemail', label: 'Left Voicemail', badge: 'bg-blue-100 text-blue-800' },
  { value: 'follow_up_scheduled', label: 'Follow-up Scheduled', badge: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', badge: 'bg-teal-100 text-teal-800' },
];

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
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    tableRowsPerPage: 20,
    showEmailInList: true,
    compactView: false,
  });
  const [staff, setStaff] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState({ call_status: 'not_called', notes: '', follow_up_date: '' });

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('adminPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);

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
        fetchStaff();
        fetchFollowUps();
      }
    };

    checkAuth();
  }, [router]);

  // Silent refresh function (no loading screen)
  const silentRefresh = async () => {
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

      if (!quotesRes.error) {
        setQuotes(quotesRes.data || []);
      }
      if (!contactsRes.error) {
        setContacts(contactsRes.data || []);
      }
    } catch (err) {
      console.error('Silent refresh error:', err);
    }
  };

  // Auto-refresh every 30 seconds (silent, no loading screen)
  useEffect(() => {
    if (!preferences.autoRefresh) return;
    const interval = setInterval(() => { silentRefresh(); fetchFollowUps(); }, 30000);
    return () => clearInterval(interval);
  }, [preferences.autoRefresh]);

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

  // Fetch call/follow-up tracking history (admin sees all)
  const fetchFollowUps = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('follow_ups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowUps(data || []);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    }
  };

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('office_staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Add new staff member
  const addStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      showToast('Please fill all fields', 'error');
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: newStaff.email,
        password: newStaff.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Add to office_staff table
      const { error: staffError } = await supabaseClient
        .from('office_staff')
        .insert([{
          name: newStaff.name,
          email: newStaff.email,
          is_active: true,
        }]);

      if (staffError) throw staffError;

      showToast('Staff member added successfully');
      setNewStaff({ name: '', email: '', password: '' });
      setShowAddStaffModal(false);
      fetchStaff();
    } catch (err) {
      showToast(err.message || 'Failed to add staff member', 'error');
    }
  };

  // Toggle staff active status
  const toggleStaffStatus = async (staffId, currentStatus) => {
    try {
      const { error } = await supabaseClient
        .from('office_staff')
        .update({ is_active: !currentStatus })
        .eq('id', staffId);

      if (error) throw error;

      showToast('Staff status updated');
      fetchStaff();
    } catch (err) {
      showToast('Failed to update staff status', 'error');
    }
  };

  // Delete staff member
  const deleteStaff = async (staffId, staffEmail) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      // Delete from office_staff table
      const { error } = await supabaseClient
        .from('office_staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      showToast('Staff member deleted');
      fetchStaff();
    } catch (err) {
      showToast('Failed to delete staff member', 'error');
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
    
    // Browser notification if enabled
    if (preferences.notifications && type === 'success' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Sun Xpress Admin', { body: message, icon: '/logo/logo.png' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Sun Xpress Admin', { body: message, icon: '/logo/logo.png' });
          }
        });
      }
    }
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

  // Assign item to a staff member
  const assignItem = async (table, id, staffId) => {
    try {
      const { error } = await supabaseClient
        .from(table)
        .update({ assigned_to: staffId || null })
        .eq('id', id);

      if (error) throw error;

      const staffMember = staff.find((s) => s.id === staffId);
      showToast(staffId ? `Assigned to ${staffMember?.name || 'staff'}` : 'Unassigned', 'success');
      fetchData();
    } catch (err) {
      showToast('Error assigning item', 'error');
      console.error('Error assigning item:', err);
    }
  };

  // Log a call/follow-up update for the selected item
  const addFollowUp = async () => {
    if (!selectedItem) return;
    try {
      const { error } = await supabaseClient.from('follow_ups').insert([{
        reference_type: selectedItem.type,
        reference_id: selectedItem.id,
        call_status: newFollowUp.call_status,
        notes: newFollowUp.notes || null,
        follow_up_date: newFollowUp.follow_up_date || null,
        created_by: user?.email || 'unknown',
        created_by_name: user?.email || 'Admin',
      }]);
      if (error) throw error;
      showToast('Follow-up logged successfully');
      setNewFollowUp({ call_status: 'not_called', notes: '', follow_up_date: '' });
      fetchFollowUps();
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

  const filteredQuotes = sortData(filterData(quotes)).slice(0, preferences.tableRowsPerPage);
  const filteredContacts = sortData(filterData(contacts)).slice(0, preferences.tableRowsPerPage);

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
              <button
                onClick={() => { setActiveTab('staff'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                  activeTab === 'staff'
                    ? 'bg-gradient-to-r from-[#0D1F3C] to-[#437A96] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={activeTab === 'staff' ? { animation: 'navButtonActive 0.6s ease-out' } : {}}
              >
                Office Staff ({staff.length})
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
                <div className={`bg-white rounded-lg shadow-md ${preferences.compactView ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition`}>
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">New Quotes</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {quotes.filter(q => q.status === 'new').length}
                  </p>
                </div>
                <div className={`bg-white rounded-lg shadow-md ${preferences.compactView ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition`}>
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">New Messages</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {contacts.filter(c => c.status === 'new').length}
                  </p>
                </div>
                <div className={`bg-white rounded-lg shadow-md ${preferences.compactView ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition`}>
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Unread</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#0D1F3C] mt-2">
                    {quotes.filter(q => !q.is_read).length + contacts.filter(c => !c.is_read).length}
                  </p>
                </div>
                <div className={`bg-white rounded-lg shadow-md ${preferences.compactView ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg transition`}>
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
                          {preferences.showEmailInList && (
                            <th
                              onClick={() => { setSortBy('email'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                              className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                            >
                              Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                          )}
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
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Assigned To</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Call Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Handled By</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuotes.length > 0 ? (
                          filteredQuotes.map((quote) => (
                            <tr
                              key={quote.id}
                              onClick={() => { setSelectedItem({ ...quote, type: 'quote' }); setShowModal(true); setNewFollowUp({ call_status: 'not_called', notes: '', follow_up_date: '' }); }}
                              className={`border-b transition hover:bg-blue-50/50 cursor-pointer ${
                                !quote.is_read ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-l-[#437A96]' : ''
                              }`}
                            >
                              <td className={`${preferences.compactView ? 'px-4 py-2' : 'px-6 py-4'} text-sm text-gray-900 font-semibold`}>{quote.name}</td>
                              {preferences.showEmailInList && (
                                <td className={`${preferences.compactView ? 'px-4 py-2' : 'px-6 py-4'} text-sm text-gray-600`}>{quote.email}</td>
                              )}
                              <td className={`${preferences.compactView ? 'px-4 py-2' : 'px-6 py-4'} text-sm text-gray-600`}>
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
                              <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={quote.assigned_to || ''}
                                  onChange={(e) => assignItem('quote_requests', quote.id, e.target.value || null)}
                                  className="px-3 py-1 text-xs font-semibold border-2 border-gray-200 rounded bg-white text-[#0D1F3C] hover:border-[#A0E9E5] transition"
                                >
                                  <option value="">Unassigned</option>
                                  {staff.filter(s => s.is_active).map((member) => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {(() => {
                                  const latest = getLatestFollowUp('quote', quote.id);
                                  const opt = CALL_STATUS_OPTIONS.find(o => o.value === (latest?.call_status || 'not_called'));
                                  return (
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${opt?.badge || 'bg-gray-100 text-gray-700'}`}>
                                      {opt?.label || 'Not Called Yet'}
                                    </span>
                                  );
                                })()}
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
                            <td colSpan={preferences.showEmailInList ? "9" : "8"} className="px-6 py-8 text-center">
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
                          {preferences.showEmailInList && (
                            <th
                              onClick={() => { setSortBy('email'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                              className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C] cursor-pointer hover:bg-gray-200 transition"
                            >
                              Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                          )}
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
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Assigned To</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Call Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Handled By</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#0D1F3C]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact) => (
                            <tr
                              key={contact.id}
                              onClick={() => { setSelectedItem({ ...contact, type: 'contact' }); setShowModal(true); setNewFollowUp({ call_status: 'not_called', notes: '', follow_up_date: '' }); }}
                              className={`border-b transition hover:bg-green-50/50 cursor-pointer ${
                                !contact.is_read ? 'bg-gradient-to-r from-green-50 to-transparent border-l-4 border-l-[#319795]' : ''
                              }`}
                            >
                              <td className={`${preferences.compactView ? 'px-4 py-2' : 'px-6 py-4'} text-sm text-gray-900 font-semibold`}>{contact.name}</td>
                              {preferences.showEmailInList && (
                                <td className={`${preferences.compactView ? 'px-4 py-2' : 'px-6 py-4'} text-sm text-gray-600`}>{contact.email}</td>
                              )}
                              <td className={`${preferences.compactView ? 'px-4 py-2' : 'px-6 py-4'} text-sm text-gray-600`}>{contact.subject || 'General Inquiry'}</td>
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
                              <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={contact.assigned_to || ''}
                                  onChange={(e) => assignItem('contact_messages', contact.id, e.target.value || null)}
                                  className="px-3 py-1 text-xs font-semibold border-2 border-gray-200 rounded bg-white text-[#0D1F3C] hover:border-[#A0E9E5] transition"
                                >
                                  <option value="">Unassigned</option>
                                  {staff.filter(s => s.is_active).map((member) => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {(() => {
                                  const latest = getLatestFollowUp('contact', contact.id);
                                  const opt = CALL_STATUS_OPTIONS.find(o => o.value === (latest?.call_status || 'not_called'));
                                  return (
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${opt?.badge || 'bg-gray-100 text-gray-700'}`}>
                                      {opt?.label || 'Not Called Yet'}
                                    </span>
                                  );
                                })()}
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
                            <td colSpan={preferences.showEmailInList ? "9" : "8"} className="px-6 py-8 text-center">
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Auto-refresh</span>
                        <span className="font-semibold text-[#319795]">{preferences.autoRefresh ? 'ON' : 'OFF'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Notifications</span>
                        <span className="font-semibold text-[#319795]">{preferences.notifications ? 'ON' : 'OFF'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">View Mode</span>
                        <span className="font-semibold text-[#319795]">{preferences.compactView ? 'Compact' : 'Normal'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPreferencesModal(true)}
                      className="w-full px-4 py-2 bg-[#319795] hover:bg-[#267472] text-white rounded-lg font-semibold transition"
                    >
                      Manage Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Office Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Header with Add Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black" style={{ color: '#0D1F3C' }}>Office Staff Management</h2>
                  <p className="text-gray-600 text-sm mt-1">Manage staff members and their assignments</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-4 py-2 rounded-lg font-bold text-white transition-all duration-200 hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #A0E9E5, #71D5D0)' }}
                >
                  + Add Staff
                </button>
              </div>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A0E9E5] to-[#71D5D0] rounded-full flex items-center justify-center text-xl font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{member.name}</h3>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold ${member.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assigned Quotes:</span>
                        <span className="font-semibold text-blue-600">
                          {quotes.filter(q => q.assigned_to === member.id).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assigned Messages:</span>
                        <span className="font-semibold text-green-600">
                          {contacts.filter(c => c.assigned_to === member.id).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Joined:</span>
                        <span className="text-gray-900">{new Date(member.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStaffStatus(member.id, member.is_active)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                          member.is_active
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id, member.email)}
                        className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {staff.length === 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No staff members yet</h3>
                  <p className="text-gray-600 mb-6">Add your first office staff member to start assigning queries</p>
                  <button
                    onClick={() => setShowAddStaffModal(true)}
                    className="px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #A0E9E5, #71D5D0)' }}
                  >
                    + Add First Staff Member
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(26, 54, 93, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowAddStaffModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black" style={{ color: '#0D1F3C' }}>Add Office Staff</h2>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#319795] focus:outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#319795] focus:outline-none transition"
                  placeholder="john@sunxpressline.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#319795] focus:outline-none transition"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addStaff}
                  className="flex-1 px-4 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #A0E9E5, #71D5D0)' }}
                >
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeInScale 0.4s ease-out', backgroundColor: 'rgba(26, 54, 93, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPreferencesModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ animation: 'modalSlideIn 0.5s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex-shrink-0 px-6 py-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #437A96 0%, #1A365D 100%)' }}
            >
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">⚙️ Dashboard Preferences</h2>
                <p className="text-xs mt-1" style={{ color: '#A0E9E5' }}>Customize your admin experience</p>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/20 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Accent Line */}
            <div className="h-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #B2F5EA 0%, #319795 50%, #2C5282 100%)' }} />

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
              
              {/* Display Preferences */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1A365D' }}>🎨 Display Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Compact View</p>
                      <p className="text-xs text-gray-600 mt-1">Show more items with reduced spacing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.compactView}
                        onChange={(e) => setPreferences({...preferences, compactView: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A0E9E5]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#319795]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Show Email in Lists</p>
                      <p className="text-xs text-gray-600 mt-1">Display email addresses in table view</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showEmailInList}
                        onChange={(e) => setPreferences({...preferences, showEmailInList: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A0E9E5]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#319795]"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block">
                      <p className="font-semibold text-gray-900 text-sm mb-2">Table Rows Per Page</p>
                      <p className="text-xs text-gray-600 mb-3">Number of items to display: {preferences.tableRowsPerPage}</p>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={preferences.tableRowsPerPage}
                        onChange={(e) => setPreferences({...preferences, tableRowsPerPage: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#319795]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10</span>
                        <span>50</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Notification Preferences */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1A365D' }}>🔔 Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Enable Notifications</p>
                      <p className="text-xs text-gray-600 mt-1">Get alerts for new submissions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A0E9E5]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#319795]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Auto-refresh Preferences */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1A365D' }}>🔄 Auto-Refresh</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Enable Auto-Refresh</p>
                      <p className="text-xs text-gray-600 mt-1">Automatically refresh data periodically</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoRefresh}
                        onChange={(e) => setPreferences({...preferences, autoRefresh: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A0E9E5]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#319795]"></div>
                    </label>
                  </div>

                  {preferences.autoRefresh && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#319795]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Data refreshes silently every 30 seconds in the background
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Info Banner */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Preferences are saved locally</p>
                    <p className="text-xs text-blue-700 mt-1">Your settings are stored in your browser and will persist across sessions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex-shrink-0 px-6 py-4 flex justify-between gap-3 border-t"
              style={{ borderColor: '#E2E8F0', background: '#F0FAFA' }}
            >
              <button
                onClick={() => {
                  // Reset to defaults
                  setPreferences({
                    theme: 'light',
                    notifications: true,
                    autoRefresh: true,
                    tableRowsPerPage: 20,
                    showEmailInList: true,
                    compactView: false,
                  });
                  showToast('Preferences reset to default', 'success');
                }}
                className="px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-gray-200"
                style={{ background: '#E2E8F0', color: '#1A365D' }}
              >
                Reset to Default
              </button>
              <button
                onClick={() => {
                  // Save preferences to localStorage
                  localStorage.setItem('adminPreferences', JSON.stringify(preferences));
                  showToast('Preferences saved successfully', 'success');
                  setShowPreferencesModal(false);
                }}
                className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #437A96 0%, #1A365D 100%)' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Assigned To</p>
                  <select
                    value={selectedItem.assigned_to || ''}
                    onChange={(e) => {
                      const table = selectedItem.type === 'quote' ? 'quote_requests' : 'contact_messages';
                      assignItem(table, selectedItem.id, e.target.value || null);
                      setSelectedItem({ ...selectedItem, assigned_to: e.target.value || null });
                    }}
                    className="w-full px-3 py-2 border-2 rounded-lg font-semibold transition text-sm"
                    style={{ borderColor: '#A0E9E5', color: '#1A365D' }}
                  >
                    <option value="">Unassigned</option>
                    {staff.filter(s => s.is_active).map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
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
                  className="w-full px-4 py-3 border-2 rounded-lg text-sm resize-none focus:outline-none transition bg-white"
                  style={{ borderColor: '#A0E9E5', minHeight: '120px', color: '#1A365D' }}
                  placeholder="Add internal notes, follow-up items, or important observations..."
                />
              </div>

              <div className="h-px" style={{ background: '#EBF8FF' }} />

              {/* Call & Follow-Up Tracking */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1A365D' }}>Call & Follow-Up Tracking</h3>

                {/* History */}
                <div className="space-y-2 max-h-56 overflow-y-auto mb-4">
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
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <select
                    value={newFollowUp.call_status}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, call_status: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:border-[#A0E9E5] focus:outline-none"
                  >
                    {CALL_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={newFollowUp.notes}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                    placeholder="Add notes about the call or follow-up..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm resize-none bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#A0E9E5] focus:outline-none"
                    rows={2}
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      value={newFollowUp.follow_up_date}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, follow_up_date: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:border-[#A0E9E5] focus:outline-none"
                    />
                    <button
                      onClick={addFollowUp}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                      style={{ background: 'linear-gradient(135deg, #319795 0%, #267472 100%)' }}
                    >
                      Log Update
                    </button>
                  </div>
                </div>
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