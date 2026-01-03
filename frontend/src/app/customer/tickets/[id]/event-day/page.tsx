'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode.react';
import { getTicketNFT, generateTicketQRCode } from '@/lib/suiTicket';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function EventDayTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const currentAccount = useCurrentAccount();
  
  const [mounted, setMounted] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [fullScreen, setFullScreen] = useState(false);
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

  // Auto brightness adjustment
  useEffect(() => {
    if (typeof window !== 'undefined' && 'screen' in window) {
      const adjustBrightness = () => {
        const screen = (window as any).screen;
        if (screen && screen.brightness !== undefined) {
          // Try to set max brightness (may not work on all devices)
          try {
            screen.brightness = 1.0;
          } catch (e) {
            // Ignore
          }
        }
      };
      adjustBrightness();
    }
  }, []);

  // Keep screen awake
  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      let wakeLock: any = null;
      const requestWakeLock = async () => {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock not supported');
        }
      };
      requestWakeLock();
      return () => {
        if (wakeLock) {
          wakeLock.release();
        }
      };
    }
  }, []);

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
      {/* Header - Minimal for event day */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/customer/tickets" className="text-lg font-semibold text-gray-900">
            ← Back
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {fullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Event Day Mode - Full Screen QR Code */}
        {fullScreen ? (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
            <div className="text-center">
              <div
                className={`inline-block p-8 rounded-2xl ${
                  isUsed ? 'grayscale opacity-50' : ''
                }`}
                style={{ filter: `brightness(${brightness}%)` }}
              >
                <QRCode value={qrData} size={400} />
              </div>
              {isUsed && (
                <div className="mt-6 text-center">
                  <div className="inline-block px-6 py-3 bg-red-100 text-red-800 rounded-xl font-bold text-xl">
                    USED
                  </div>
                </div>
              )}
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => setBrightness(Math.max(50, brightness - 10))}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  −
                </button>
                <span className="text-sm text-gray-700">Brightness: {brightness}%</span>
                <button
                  onClick={() => setBrightness(Math.min(150, brightness + 10))}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setFullScreen(false)}
                className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Exit Fullscreen
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Ticket Display */}
            <div className={`card p-8 mb-6 ${isUsed ? 'grayscale opacity-75' : ''}`}>
              {isUsed && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                  USED
                </div>
              )}
              
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.eventName}</h1>
                <p className="text-gray-700">{ticket.venueName}</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div
                  className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setFullScreen(true)}
                  style={{ filter: `brightness(${brightness}%)` }}
                >
                  <QRCode value={qrData} size={300} />
                </div>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ticket Type</p>
                  <p className="font-semibold text-gray-900">{ticket.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ticket Number</p>
                  <p className="font-semibold text-gray-900">{ticket.ticketNumber}</p>
                </div>
                {ticket.seatZone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Seat Zone</p>
                    <p className="font-semibold text-gray-900">{ticket.seatZone}</p>
                  </div>
                )}
                {ticket.seatNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Seat Number</p>
                    <p className="font-semibold text-gray-900">{ticket.seatNumber}</p>
                  </div>
                )}
              </div>

              {/* Event Time */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Event Time</p>
                <p className="font-semibold text-gray-900">
                  {new Date(ticket.eventStartTime).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Entry Guidance */}
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Entry Guidance</h3>
              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Recommended entry time: 30 minutes before event</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Please have your QR code ready for scanning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Keep your screen brightness at maximum</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Prohibited items: Large bags, food, drinks</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setFullScreen(true)}
                className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
              >
                Show Fullscreen QR Code
              </button>
              <button
                onClick={() => setBrightness(Math.min(150, brightness + 10))}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
              >
                Brightness +
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

