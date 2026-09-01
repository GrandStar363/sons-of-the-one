import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BarChart3, Users, MessageSquare, 
  FileText, Mail, LogOut, Menu, X, Shield, ChevronRight, Inbox, Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminPrayerRequests from '@/components/admin/AdminPrayerRequests';
import AdminContent from '@/components/admin/AdminContent';
import AdminEmailStatus from '@/components/admin/AdminEmailStatus';
import AdminContactMessages from '@/components/admin/AdminContactMessages';
import AdminActivityMonitor from '@/components/admin/AdminActivityMonitor';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

type Tab = 'analytics' | 'activity' | 'users' | 'prayers' | 'content' | 'emails' | 'contact';


export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');

    if (storedToken && storedAdmin) {
      verifyToken(storedToken, JSON.parse(storedAdmin));
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (storedToken: string, storedAdmin: Admin) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'verify', token: storedToken }
      });

      if (error || !data?.success) {
        // Token invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } else {
        setAdmin(data.admin);
        setToken(storedToken);
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (adminData: Admin, tokenData: string) => {
    setAdmin(adminData);
    setToken(tokenData);
  };

  const handleLogout = async () => {
    try {
      await supabase.functions.invoke('admin-auth', {
        body: { action: 'logout', token }
      });
    } catch (err) {
      // Ignore logout errors
    }
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'activity' as Tab, label: 'Activity Monitor', icon: Activity },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'prayers' as Tab, label: 'Prayer Requests', icon: MessageSquare },
    { id: 'contact' as Tab, label: 'Contact Messages', icon: Inbox },
    { id: 'content' as Tab, label: 'Content', icon: FileText },
    { id: 'emails' as Tab, label: 'Email Status', icon: Mail },
  ];


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{admin.name}</p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}>
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="font-semibold text-gray-900">Bible App</p>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {admin.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{admin.name}</p>
                  <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {admin.name[0]}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                !sidebarOpen ? 'justify-center' : ''
              }`}
              title={!sidebarOpen ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
          >
            <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h1>
                <p className="text-gray-500 text-sm">
                  Welcome back, {admin.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'activity' && <AdminActivityMonitor />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'prayers' && <AdminPrayerRequests adminId={admin.id} />}
            {activeTab === 'contact' && <AdminContactMessages adminId={admin.id} />}
            {activeTab === 'content' && <AdminContent adminId={admin.id} />}
            {activeTab === 'emails' && <AdminEmailStatus />}
          </div>


        </main>
      </div>
    </div>
  );
}
