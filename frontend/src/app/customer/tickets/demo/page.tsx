'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TicketCategory = 'all' | 'upcoming' | 'used' | 'expired';

// Demo tickets data for screenshots
const demoTickets = [
  {
    objectId: 'demo-ticket-1',
    eventId: 'demo-taipei-jazz-2026',
    eventName: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
    ticketType: 'VVIP - Prestige',
    ticketNumber: 'VVIP-2026-001234',
    seatZone: 'A',
    seatNumber: '15',
    purchaseTime: Date.now() - 86400000, // 1 day ago
    purchasePrice: 150 * 1e9, // 150 SUI in MIST
    organizerId: '0xorganizer123',
    isUsed: false,
    eventStartTime: new Date('2026-02-01T19:30:00+08:00').getTime(),
    venueName: 'National Concert Hall, Taipei',
    owner: '0xbuyer123',
  },
  {
    objectId: 'demo-ticket-2',
    eventId: 'demo-taipei-jazz-2026',
    eventName: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
    ticketType: 'VVIP - Prestige',
    ticketNumber: 'VVIP-2026-001235',
    seatZone: 'A',
    seatNumber: '16',
    purchaseTime: Date.now() - 86400000,
    purchasePrice: 150 * 1e9,
    organizerId: '0xorganizer123',
    isUsed: false,
    eventStartTime: new Date('2026-02-01T19:30:00+08:00').getTime(),
    venueName: 'National Concert Hall, Taipei',
    owner: '0xbuyer123',
  },
  {
    objectId: 'demo-ticket-3',
    eventId: 'demo-taipei-jazz-2026',
    eventName: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
    ticketType: 'Grand Tier - Standard',
    ticketNumber: 'GT-2026-005678',
    seatZone: 'K',
    seatNumber: '25',
    purchaseTime: Date.now() - 172800000, // 2 days ago
    purchasePrice: 80 * 1e9,
    organizerId: '0xorganizer123',
    isUsed: true, // This one is used
    eventStartTime: new Date('2026-01-15T20:00:00+08:00').getTime(),
    venueName: 'National Concert Hall, Taipei',
    owner: '0xbuyer123',
  },
];

export default function DemoMyTicketsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<TicketCategory>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter tickets by category
  const filteredTickets = demoTickets.filter(ticket => {
    const now = Date.now();
    const eventTime = ticket.eventStartTime;
    const isUpcoming = eventTime > now && !ticket.isUsed;
    const isUsed = ticket.isUsed;
    const isExpired = eventTime < now && !ticket.isUsed;

    switch (category) {
      case 'upcoming':
        return isUpcoming;
      case 'used':
        return isUsed;
      case 'expired':
        return isExpired;
      default:
        return true;
    }
  });

  const categories = [
    { id: 'all' as TicketCategory, label: 'All Tickets', count: demoTickets.length },
    { id: 'upcoming' as TicketCategory, label: 'Upcoming', count: demoTickets.filter(t => t.eventStartTime > Date.now() && !t.isUsed).length },
    { id: 'used' as TicketCategory, label: 'Used', count: demoTickets.filter(t => t.isUsed).length },
    { id: 'expired' as TicketCategory, label: 'Expired', count: demoTickets.filter(t => t.eventStartTime < Date.now() && !t.isUsed).length },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/customer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            SuiTicket
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">DEMO</span>
            <Link
              href="/customer/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Tickets</h1>

        {/* Categories */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} {cat.count > 0 && `(${cat.count})`}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.objectId}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-all group ${
                ticket.isUsed ? 'opacity-75 border-gray-300' : 'border-gray-200'
              }`}
            >
              <div className={`h-48 bg-gradient-to-br ${
                ticket.isUsed 
                  ? 'from-gray-400 to-gray-500 grayscale' 
                  : 'from-primary-400 to-secondary-500'
              }`}>
                {ticket.isUsed && (
                  <div className="h-full flex items-center justify-center">
                    <div className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-xl">
                      USED
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors ${
                  ticket.isUsed ? 'text-gray-600' : 'text-gray-900'
                }`}>
                  {ticket.eventName}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className={`flex items-center gap-2 ${ticket.isUsed ? 'text-gray-600' : 'text-gray-800'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(ticket.eventStartTime).toLocaleDateString()}
                  </p>
                  <p className={`flex items-center gap-2 ${ticket.isUsed ? 'text-gray-600' : 'text-gray-800'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ticket.venueName}
                  </p>
                  <p className={`text-xs mt-3 ${ticket.isUsed ? 'text-gray-600' : 'text-gray-700'}`}>
                    {ticket.ticketType} • {ticket.ticketNumber}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/customer/tickets/${ticket.objectId}`}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/customer/tickets/${ticket.objectId}/event-day`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-sm text-center hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
                  >
                    Show QR Code
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Demo Mode:</strong> This page shows sample tickets for demonstration purposes. In the actual application, tickets would be loaded from your connected wallet.
          </p>
        </div>
      </main>
    </div>
  );
}

