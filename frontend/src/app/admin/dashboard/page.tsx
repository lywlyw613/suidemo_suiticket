'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'financial' | 'settings' | 'review' | 'analytics'>('overview');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check admin access
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    // Only redirect if not admin and not already on login page to avoid infinite loop
    if ((!isAdmin || userRole !== 'admin') && window.location.pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [mounted, router]);

  if (!mounted) {
    return null;
  }

  // Additional check before rendering content
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('is_admin') === 'true';
  const userRole = typeof window !== 'undefined' && localStorage.getItem('userRole') === 'admin';

  if (!isAdmin || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 mb-4">Please login as admin first</p>
          <Link
            href="/admin/login"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  // Demo data
  const stats = {
    totalEvents: 24,
    totalUsers: 1234,
    totalRevenue: 45678,
    ticketsSold: 5678,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'events', label: 'Event Management', icon: '🎫' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'review', label: 'Review System', icon: '✅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            SuiTicket - Admin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Platform Operator</span>
            <button
              onClick={() => {
                localStorage.removeItem('is_admin');
                localStorage.removeItem('userRole');
                router.push('/');
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} SUI</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Tickets Sold</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.ticketsSold.toLocaleString()}</p>
                </div>
              </div>

              {/* Sales Trends Chart Placeholder */}
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-600 mb-4">Sales Trends Chart</p>
                <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <p className="text-gray-400">Chart visualization would go here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Paused</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Event {i}</h3>
                      <p className="text-sm text-gray-600">Organizer • Created on 2026-01-15</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Edit</button>
                      <button className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-sm">Pause</button>
                      <button className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm">Delete</button>
                      <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm">View Report</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
              <div className="space-y-4">
                {[
                  { type: 'Regular User', count: 1000 },
                  { type: 'Organizer', count: 200 },
                  { type: 'Admin', count: 2 },
                ].map((userType, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{userType.type}</h3>
                      <p className="text-sm text-gray-600">{userType.count} users</p>
                    </div>
                    <button className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg text-sm">View List</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Revenue Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-semibold">45,678 SUI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">12,345 SUI</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Source Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Sales</span>
                      <span className="font-semibold">80%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fees</span>
                      <span className="font-semibold">20%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Transaction Records</h3>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  Export Reports
                </button>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review System</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Pending Events</h3>
                  <p className="text-sm text-gray-600 mb-4">3 events waiting for review</p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm">Event {i} - Submitted on 2026-01-15</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-sm">Approve</button>
                          <button className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm">Reject</button>
                          <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm">Request Info</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Review History</h3>
                  <p className="text-sm text-gray-600">View past reviews and decisions</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Platform Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Platform Name</label>
                      <input type="text" defaultValue="SuiTicket" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tagline</label>
                      <input type="text" defaultValue="SuiTicket on Sui blockchain for smart ticketing" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Platform Fee Rate</label>
                      <input type="number" defaultValue="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Payment Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Supported Currencies</label>
                      <div className="flex gap-2">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <span>SUI</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>USDC</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Traffic</span>
                      <span className="font-semibold">12,345 visits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">3.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-semibold">150 SUI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Repeat Rate</span>
                      <span className="font-semibold">25%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Direct</span>
                      <span className="font-semibold">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Search</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Social</span>
                      <span className="font-semibold">25%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <p className="text-sm text-gray-600">User behavior and geographic analysis would be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

