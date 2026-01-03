'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Html5Qrcode } from 'html5-qrcode';
import { getTicketNFT, verifyTicket, parseTicketQRCode } from '@/lib/suiTicket';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export default function OrganizerCheckInPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [mounted, setMounted] = useState(false);
  const [eventId, setEventId] = useState('');
  const [gateCapId, setGateCapId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticketInfo?: any;
  } | null>(null);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [manualTicketId, setManualTicketId] = useState('');
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved event config from localStorage
    const savedEventId = localStorage.getItem('checkin_eventId');
    const savedGateCapId = localStorage.getItem('checkin_gateCapId');
    if (savedEventId) setEventId(savedEventId);
    if (savedGateCapId) setGateCapId(savedGateCapId);
  }, []);

  // Start QR scanner
  const startScanner = async () => {
    if (!eventId || !gateCapId) {
      alert('Please set Event ID and Gate Cap ID first');
      return;
    }

    if (scanner) {
      scanner.stop();
      setScanner(null);
      setScanning(false);
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanResult(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );
      setScanner(html5QrCode);
      setScanning(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      alert('Failed to start camera. Please check permissions.');
    }
  };

  // Handle scan result
  const handleScanResult = async (qrData: string) => {
    try {
      const parsed = parseTicketQRCode(qrData);
      if (parsed) {
        await verifyTicketOnChain(parsed.ticketId, parsed.eventId);
      } else {
        // Try direct ticket ID
        await verifyTicketOnChain(qrData, eventId);
      }
    } catch (error) {
      console.error('Failed to parse QR code:', error);
    }
  };

  // Verify ticket on chain
  const verifyTicketOnChain = async (ticketId: string, ticketEventId: string) => {
    if (!currentAccount?.address) {
      setResult({
        success: false,
        message: 'Please connect wallet first',
      });
      return;
    }

    if (!gateCapId) {
      setResult({
        success: false,
        message: 'Please set Gate Cap ID',
      });
      return;
    }

    // Check if ticket exists and get info
    const ticket = await getTicketNFT(ticketId);
    
    if (!ticket) {
      setResult({
        success: false,
        message: 'Ticket not found on chain',
      });
      return;
    }

    if (ticket.eventId !== ticketEventId && ticket.eventId !== eventId) {
      setResult({
        success: false,
        message: 'Ticket not for this event',
      });
      return;
    }

    if (ticket.isUsed) {
      setResult({
        success: false,
        message: 'Ticket already used',
        ticketInfo: ticket,
      });
      return;
    }

    // Create transaction to verify
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0'}::ticket_nft::redeem`,
        arguments: [
          tx.object(ticketId),
          tx.object(gateCapId),
        ],
      });

      signAndExecuteTransaction(
        {
          transaction: tx as any, // Type assertion for TransactionBlock compatibility
        },
        {
          onSuccess: (result) => {
            setResult({
              success: true,
              message: 'Check-in successful!',
              ticketInfo: ticket,
            });
            setStats((prev) => ({
              total: prev.total,
              checkedIn: prev.checkedIn + 1,
            }));
            // Play success sound
            playSound('success');
          },
          onError: (error) => {
            setResult({
              success: false,
              message: error.message || 'Verification failed',
            });
            playSound('error');
          },
        }
      );
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to verify ticket',
      });
      playSound('error');
    }
  };

  // Play sound feedback
  const playSound = (type: 'success' | 'error') => {
    const audio = new Audio();
    if (type === 'success') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKfk8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknE4MDlCn5PC2YxwGOJHX8sx5LAUkd8fw3ZBAC';
    } else {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKfk8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknE4MDlCn5PC2YxwGOJHX8sx5LAUkd8fw3ZBAC';
    }
    audio.play().catch(() => {});
  };

  // Manual verify
  const handleManualVerify = () => {
    if (!manualTicketId) {
      setResult({
        success: false,
        message: 'Please enter ticket ID',
      });
      return;
    }
    verifyTicketOnChain(manualTicketId, eventId);
  };

  // Save config
  const saveConfig = () => {
    localStorage.setItem('checkin_eventId', eventId);
    localStorage.setItem('checkin_gateCapId', gateCapId);
    alert('Configuration saved!');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/organizer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
            Check-in System
          </Link>
          <div className="flex items-center gap-4">
            {currentAccount && (
              <div className="text-sm text-gray-700">
                {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
              </div>
            )}
            <Link
              href="/organizer/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Event Configuration */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Event Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event ID
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Event ID"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gate Cap ID (Verification Permission)
              </label>
              <input
                type="text"
                value={gateCapId}
                onChange={(e) => setGateCapId(e.target.value)}
                placeholder="0x..."
                className="input"
              />
            </div>
          </div>
          <button
            onClick={saveConfig}
            className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-700 mt-1">Total Tickets</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600">{stats.checkedIn}</div>
            <div className="text-sm text-gray-700 mt-1">Checked In</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-primary-600">
              {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-700 mt-1">Admission Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Scanner */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">QR Code Scanner</h3>
            <div id="qr-reader" className="w-full mb-4" style={{ minHeight: '300px' }}></div>
            <button
              onClick={startScanner}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                scanning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white'
              }`}
            >
              {scanning ? 'Stop Scanner' : 'Start Scanner'}
            </button>
          </div>

          {/* Manual Entry */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Manual Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                  placeholder="0x..."
                  className="input"
                />
              </div>
              <button
                onClick={handleManualVerify}
                className="w-full py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white rounded-xl font-semibold transition-all"
              >
                Verify Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`mt-6 card p-6 border-2 ${
              result.success
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`text-4xl ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.success ? '✅' : '❌'}
              </div>
              <div className="flex-1">
                <h4
                  className={`text-xl font-bold mb-2 ${
                    result.success ? 'text-emerald-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
                </h4>
                {result.ticketInfo && (
                  <div className="mt-4 space-y-2 text-sm text-gray-800">
                    <p><strong>Type:</strong> {result.ticketInfo.ticketType}</p>
                    {result.ticketInfo.seatZone && (
                      <p><strong>Seat Zone:</strong> {result.ticketInfo.seatZone}</p>
                    )}
                    {result.ticketInfo.seatNumber && (
                      <p><strong>Seat Number:</strong> {result.ticketInfo.seatNumber}</p>
                    )}
                    <p><strong>Ticket Number:</strong> {result.ticketInfo.ticketNumber}</p>
                    <p><strong>NFT ID:</strong> <code className="text-xs">{result.ticketInfo.objectId.slice(0, 20)}...</code></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

