'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getDemoEvent, type DemoEvent } from '@/lib/demoEvents';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const currentAccount = useCurrentAccount();
  
  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<DemoEvent | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !eventId) return;
    const eventData = getDemoEvent(eventId);
    setEvent(eventData);
  }, [mounted, eventId]);

  if (!mounted) {
    return null;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 mb-4">Event not found</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const availableTicketTypes = event.ticketTypes.filter(t => t.isListed);
  const totalPrice = selectedTicketType
    ? event.ticketTypes.find(t => t.id === selectedTicketType)!.price * quantity
    : 0;

  const handlePurchase = () => {
    if (!currentAccount?.address) {
      alert('Please connect wallet first');
      return;
    }
    if (!selectedTicketType) {
      alert('Please select a ticket type');
      return;
    }
    // Navigate to purchase page
    router.push(`/events/${eventId}/purchase?ticketType=${selectedTicketType}&quantity=${quantity}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-12 text-white mb-8">
            <div className="max-w-3xl">
              <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
                {event.category}
              </div>
              <h1 className="text-5xl font-bold mb-4">{event.name}</h1>
              <p className="text-xl opacity-90">{event.description}</p>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Event Time</p>
                    <p className="text-gray-700">
                      {new Date(event.startTime).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - {new Date(event.endTime).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Venue</p>
                    <p className="text-gray-700">{event.venueName}</p>
                    <p className="text-sm text-gray-600 mt-1">{event.venueAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sale Period</p>
                    <p className="text-gray-700">
                      {new Date(event.saleStartTime).toLocaleDateString()} - {new Date(event.saleEndTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Types */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticket Types</h2>
              <div className="space-y-4">
                {availableTicketTypes.map((ticketType) => (
                  <div
                    key={ticketType.id}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedTicketType === ticketType.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTicketType(ticketType.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{ticketType.name}</h3>
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                            {ticketType.price} SUI
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{ticketType.description}</p>
                        {ticketType.seatRange && (
                          <p className="text-sm text-gray-600">Seat Range: {ticketType.seatRange}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          Available: {ticketType.quantity} tickets
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedTicketType === ticketType.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedTicketType === ticketType.id && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Purchase</h3>
              
              {selectedTicketType && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity (Max: {event.maxTicketsPerBuyer})
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={event.maxTicketsPerBuyer}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(event.maxTicketsPerBuyer, Math.max(1, val)));
                        }}
                        className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(event.maxTicketsPerBuyer, quantity + 1))}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Price per ticket</span>
                      <span className="font-semibold text-gray-900">
                        {event.ticketTypes.find(t => t.id === selectedTicketType)!.price} SUI
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700">Quantity</span>
                      <span className="font-semibold text-gray-900">{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">{totalPrice} SUI</span>
                    </div>
                  </div>
                </div>
              )}

              {!selectedTicketType && (
                <p className="text-gray-600 text-sm mb-6">Please select a ticket type</p>
              )}

              <button
                onClick={handlePurchase}
                disabled={!selectedTicketType || !currentAccount}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {!currentAccount ? 'Connect Wallet' : 'Purchase Tickets'}
              </button>

              {!currentAccount && (
                <p className="text-sm text-gray-600 text-center mt-4">
                  Please connect your wallet to purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

