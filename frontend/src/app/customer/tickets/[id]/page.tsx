'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getTicketNFT, generateTicketQRCode } from '@/lib/suiTicket';
import { useCurrentAccount } from '@mysten/dapp-kit';
import QRCode from 'qrcode.react';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const currentAccount = useCurrentAccount();
  const [mounted, setMounted] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
          <Link
            href="/customer/tickets"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isUsed = ticket.isUsed;
  const isEventDay = new Date(ticket.eventStartTime).toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/customer/tickets" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
          <Link
            href="/customer/tickets"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Back
          </Link>
          {isEventDay && !isUsed && (
            <Link
              href={`/customer/tickets/${ticketId}/event-day`}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Event Day Mode
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Ticket Display */}
          <div className="lg:col-span-2">
            <div className={`bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 text-white ${
              isUsed ? 'grayscale opacity-75' : ''
            }`}>
              {isUsed && (
                <div className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-xl">
                  USED
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-3xl font-bold mb-4">{ticket.eventName}</h2>
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
          </div>

          {/* QR Code & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-4">Entry QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrData || ticketId} size={200} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              {isEventDay && !isUsed && (
                <Link
                  href={`/customer/tickets/${ticketId}/event-day`}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Event Day Mode
                </Link>
              )}
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Share
              </button>
              {!isUsed && (
                <button className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                  Request Refund
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Ticket Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Event Name</p>
              <p className="font-semibold text-gray-900">{ticket.eventName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ticket Type</p>
              <p className="font-semibold text-gray-900">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Seat Zone</p>
              <p className="font-semibold text-gray-900">{ticket.seatZone || 'General Admission'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Seat Number</p>
              <p className="font-semibold text-gray-900">{ticket.seatNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Purchase Time</p>
              <p className="font-semibold text-gray-900">
                {new Date(ticket.purchaseTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Purchase Price</p>
              <p className="font-semibold text-gray-900">{ticket.purchasePrice / 1e9} SUI</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Blockchain Info</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Token ID</p>
                <p className="font-mono text-sm text-gray-900 break-all">{ticket.objectId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Owner Address</p>
                <p className="font-mono text-sm text-gray-900 break-all">{ticket.owner}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-gray-900">{isUsed ? 'Used' : 'Valid'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Blockchain</p>
                <p className="font-semibold text-gray-900">Sui Devnet</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

