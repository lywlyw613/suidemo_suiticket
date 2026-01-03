'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTicketNFT, generateTicketQRCode } from '@/lib/suiTicket';
import QRCode from 'qrcode.react';

export default function TicketComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('id');
  
  const [mounted, setMounted] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUsed, setShowUsed] = useState(false);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ticketId) return;

    const loadTicket = async () => {
      try {
        const ticketData = await getTicketNFT(ticketId);
        if (ticketData) {
          setTicket(ticketData);
          const qr = generateTicketQRCode(ticketData.objectId, ticketData.eventId);
          setQrData(qr);
        } else {
          setTicket(null);
        }
      } catch (error) {
        console.error('Failed to load ticket:', error);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [mounted, ticketId]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 mb-4">Ticket not found</p>
          <Link href="/verifier/dashboard" className="btn-primary">
            Back to Verifier Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/verifier/dashboard" className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
            Ticket Comparison
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUsed(!showUsed)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {showUsed ? 'Show Before Verification' : 'Show After Verification'}
            </button>
            <Link
              href="/verifier/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ticket Verification Comparison
          </h1>
          <p className="text-lg text-gray-700">
            Compare ticket appearance before and after verification
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before Verification */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Before Verification</h2>
              <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                VALID
              </span>
            </div>
            <div className="bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 text-white relative">
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm z-10">
                VALID
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-3xl font-bold mb-4">{ticket.eventName}</h3>
                <div className="space-y-3 mb-6">
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(ticket.eventStartTime).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ticket.venueName}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {ticket.ticketType}
                  </p>
                </div>
                <div className="border-t border-white/30 pt-4">
                  <p className="text-sm opacity-90">Ticket Number</p>
                  <p className="font-mono text-lg">{ticket.ticketNumber}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-4">QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrData || ticketId || ''} size={200} />
              </div>
            </div>
          </div>

          {/* After Verification */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">After Verification</h2>
              <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                USED
              </span>
            </div>
            <div className="bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 text-white relative grayscale opacity-60">
              <div className="absolute inset-0 bg-black/30 rounded-2xl z-10"></div>
              <div className="absolute top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl z-20 shadow-lg">
                USED
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/90 text-gray-900 px-8 py-4 rounded-xl font-bold text-2xl transform rotate-[-15deg] shadow-2xl">
                  VERIFIED
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 relative z-0">
                <h3 className="text-3xl font-bold mb-4">{ticket.eventName}</h3>
                <div className="space-y-3 mb-6">
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(ticket.eventStartTime).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ticket.venueName}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {ticket.ticketType}
                  </p>
                </div>
                <div className="border-t border-white/30 pt-4">
                  <p className="text-sm opacity-90">Ticket Number</p>
                  <p className="font-mono text-lg">{ticket.ticketNumber}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center grayscale opacity-60">
              <h3 className="font-semibold text-gray-900 mb-4">QR Code (Used)</h3>
              <div className="bg-white p-4 rounded-lg inline-block relative">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                    USED
                  </div>
                </div>
                <QRCode value={qrData || ticketId || ''} size={200} />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="mt-12 card p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Ticket Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-700 mb-1">Event Name</p>
              <p className="font-semibold text-gray-900">{ticket.eventName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Ticket Type</p>
              <p className="font-semibold text-gray-900">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Ticket Number</p>
              <p className="font-mono text-sm text-gray-900">{ticket.ticketNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Seat Zone</p>
              <p className="font-semibold text-gray-900">{ticket.seatZone || 'General Admission'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Seat Number</p>
              <p className="font-semibold text-gray-900">{ticket.seatNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Status</p>
              <p className="font-semibold text-gray-900">
                {ticket.isUsed ? (
                  <span className="text-red-600">Used (Verified)</span>
                ) : (
                  <span className="text-green-600">Valid (Not Verified)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Token ID</p>
              <p className="font-mono text-xs text-gray-900 break-all">{ticket.objectId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-1">Owner Address</p>
              <p className="font-mono text-xs text-gray-900 break-all">{ticket.owner}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

