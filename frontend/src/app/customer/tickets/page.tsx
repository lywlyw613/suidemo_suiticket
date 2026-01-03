'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getUserTickets, type TicketNFT } from '@/lib/suiTicket';

type TicketCategory = 'all' | 'upcoming' | 'used' | 'expired';

export default function MyTicketsPage() {
  // Early return for SSR
  if (typeof window === 'undefined') {
    return null;
  }
  
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<TicketCategory>('all');
  const [tickets, setTickets] = useState<TicketNFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadTickets = async () => {
      if (!currentAccount?.address) {
        setLoading(false);
        return;
      }

      try {
        const userTickets = await getUserTickets(currentAccount.address);
        setTickets(userTickets);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [mounted, currentAccount, category]);

  // Filter tickets by category
  const filteredTickets = tickets.filter(ticket => {
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
    { id: 'all' as TicketCategory, label: 'All Tickets', count: tickets.length },
    { id: 'upcoming' as TicketCategory, label: 'Upcoming', count: tickets.filter(t => t.eventStartTime > Date.now() && !t.isUsed).length },
    { id: 'used' as TicketCategory, label: 'Used', count: tickets.filter(t => t.isUsed).length },
    { id: 'expired' as TicketCategory, label: 'Expired', count: tickets.filter(t => t.eventStartTime < Date.now() && !t.isUsed).length },
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
            suiTicket
          </Link>
          <Link
            href="/customer/dashboard"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Back
          </Link>
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : !currentAccount ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-800 mb-2 text-lg font-medium">Please connect your wallet</p>
            <p className="text-gray-600 mb-6 text-sm">Connect your Sui wallet to view your tickets</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Connect Wallet
            </Link>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-800 mb-2 text-lg font-medium">No tickets found</p>
            <p className="text-gray-600 mb-6 text-sm">Start exploring amazing events!</p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.objectId}
                href={`/customer/tickets/${ticket.objectId}`}
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

