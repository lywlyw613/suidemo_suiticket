'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/frontendAuth';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [stats, setStats] = useState({ totalEvents: 0, publishedEvents: 0, draftEvents: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 純前端：從 localStorage 讀取用戶數據
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

  // Load events - Demo 模式：從 localStorage 讀取或使用 demo 數據
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // 從 localStorage 讀取保存的活動
        const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
        
        // 如果沒有保存的活動，使用 demo 數據
        const demoEvents = savedEvents.length > 0 ? savedEvents : [
          {
            id: 'demo-taipei-jazz-2026',
            name: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
            status: 'published',
            startTime: '2026-02-01T19:30:00+08:00',
            createdAt: new Date().toISOString(),
          },
        ];
        
        setEvents(demoEvents);
        setStats({
          totalEvents: demoEvents.length,
          publishedEvents: demoEvents.filter((e: any) => e.status === 'published').length,
          draftEvents: demoEvents.filter((e: any) => e.status === 'draft').length,
        });
      } catch (error: any) {
        console.error('Failed to load events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    if (!loading) {
      loadEvents();
    }
  }, [loading]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
            suiTicket - Organizer Dashboard
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-700">Organizer</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p className="text-lg text-gray-800">Create and manage your events and tickets</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/organizer/events/create" className="card-hover group text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Create Event</h3>
                <p className="text-sm text-gray-700">Publish a new event</p>
              </div>
            </div>
          </Link>

          <Link href="/organizer/dashboard#events" className="card-hover">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">My Events</h3>
                <p className="text-sm text-gray-700">{stats.totalEvents} {stats.totalEvents === 1 ? 'event' : 'events'}</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Sales Statistics</h3>
                <p className="text-sm text-gray-700">View data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="card p-8" id="events">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Event List</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                All ({stats.totalEvents})
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Published ({stats.publishedEvents})
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Drafts ({stats.draftEvents})
              </button>
            </div>
          </div>

          {eventsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto mb-4"></div>
              <p className="text-gray-800">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-secondary-100 to-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-900 mb-2 text-lg font-medium">You haven't created any events yet</p>
              <p className="text-gray-700 mb-6 text-sm">Start creating your first event!</p>
              <Link href="/organizer/events/create" className="btn-primary bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 inline-block">
                Create First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="card p-6">
                  <Link
                    href={`/events/${event.id}`}
                    className="block mb-4"
                  >
                    <div className="flex items-start gap-6">
                      {event.heroImageUrl && (
                        <img
                          src={event.heroImageUrl}
                          alt={event.name}
                          className="w-32 h-32 object-cover rounded-xl"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{event.name}</h3>
                            <p className="text-sm text-gray-800 mb-2">{event.category || 'Uncategorized'}</p>
                            <p className="text-sm text-gray-700">
                              {new Date(event.startTime).toLocaleDateString()} - {new Date(event.endTime).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.status === 'published' ? 'bg-green-100 text-green-700' :
                            event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            event.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        {event.venueName && (
                          <p className="text-sm text-gray-800">📍 {event.venueName}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/organizer/events/${event.id}/manage`}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Manage Listings
                    </Link>
                    <Link
                      href={`/events/${event.id}`}
                      className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-semibold transition-colors"
                    >
                      View Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
