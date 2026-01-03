'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/frontendAuth';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 純前端：從 localStorage 讀取用戶數據
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const user = getCurrentUser();
    if (user) {
      setUser(user);
    } else {
      // 用戶數據不存在，清除並跳轉
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            SuiTicket
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-700">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-lg text-gray-800">View and manage your purchased NFT tickets</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link
            href="/events"
            className="card-hover group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Browse Events</h3>
                <p className="text-sm text-gray-700">Explore all available events</p>
              </div>
            </div>
          </Link>

          <Link
            href="/customer/tickets"
            className="card-hover group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">My Tickets</h3>
                <p className="text-sm text-gray-700">View all tickets</p>
              </div>
            </div>
          </Link>

          <Link
            href="/customer/ai"
            className="card-hover group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">AI Assistant</h3>
                <p className="text-sm text-gray-700">Smart recommendations and chat</p>
              </div>
            </div>
          </Link>

          <Link
            href="/customer/profile"
            className="card-hover group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Profile</h3>
                <p className="text-sm text-gray-700">Manage account settings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tickets List */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticket List</h2>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-900 mb-2 text-lg font-medium">You haven't purchased any tickets yet</p>
            <p className="text-gray-700 mb-6 text-sm">Start exploring amazing events!</p>
            <Link
              href="/events"
              className="btn-primary inline-block"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
