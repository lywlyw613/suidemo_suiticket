'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { verificationAPI } from '@/lib/api';

export default function VerifierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ticketId, setTicketId] = useState('');
  const [eventId, setEventId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    authAPI.me()
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          router.push('/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleVerify = async () => {
    if (!ticketId || !eventId) {
      setResult({
        success: false,
        message: 'Please enter ticket ID and event ID',
      });
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await verificationAPI.verify({
        ticketId,
        eventId,
        verifierId: user?.id || 'unknown',
      });

      if (response.data.success) {
        setResult({
          success: true,
          message: 'Verification successful!',
          data: response.data,
        });
        setTicketId('');
        setEventId('');
      } else {
        setResult({
          success: false,
          message: response.data.error || 'Verification failed',
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Verification failed, please try again',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
            NFT Ticketing System - Verification
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-700">Verifier</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ticket Verification</h1>
          <p className="text-lg text-gray-800">Scan QR code or enter ticket ID to verify</p>
        </div>

        {/* Verification Form */}
        <div className="card p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ticket ID (Sui Object ID)
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event ID
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Event ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying || !ticketId || !eventId}
              className="w-full btn-primary bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 flex items-center justify-center gap-3"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Verify Ticket</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`mt-6 p-6 rounded-xl border-2 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-3xl ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.success ? '✅' : '❌'}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-lg font-semibold mb-2 ${
                      result.success ? 'text-emerald-800' : 'text-red-800'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && result.data && (
                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      {result.data.ownerAddress && (
                        <p>Owner Address: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{result.data.ownerAddress}</code></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Instructions
          </h3>
          <ul className="text-sm text-gray-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent-600 mt-1">•</span>
              <span>Scan ticket QR code to get ticket ID</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-600 mt-1">•</span>
              <span>Enter or select event ID</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-600 mt-1">•</span>
              <span>Click "Verify Ticket" to verify</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-600 mt-1">•</span>
              <span>After successful verification, the ticket will be marked as used</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
