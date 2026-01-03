'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllDemoEvents, type DemoEvent } from '@/lib/demoEvents';

export default function EventsPage() {
  const [events, setEvents] = useState<DemoEvent[]>([]);

  useEffect(() => {
    // 從 localStorage 讀取 organizer 創建的活動
    const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
    
    // 合併 demo event 和保存的活動
    const demoEvents = getAllDemoEvents();
    const allEvents = [...demoEvents, ...savedEvents];
    
    // 過濾掉重複的（如果有相同的 ID）
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex((e) => e.id === event.id)
    );
    
    setEvents(uniqueEvents);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
          <Link
            href="/login?role=customer"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Events</h1>
          <p className="text-gray-600">Explore all available events and tickets</p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 mb-4">No events available at the moment</p>
            <p className="text-sm text-gray-400">Events will be displayed here after creation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{event.date}</span>
                    <Link
                      href={`/events/${event.id}`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

