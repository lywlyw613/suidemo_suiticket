'use client';

import { useState } from 'react';
import { getTicketNFT } from '@/lib/suiTicket';

export default function VerifyPage() {
  const [ticketId, setTicketId] = useState('');
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleVerify = async () => {
    if (!ticketId || !eventId) {
      setResult({
        success: false,
        message: 'Please enter ticket ID and event ID',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 純前端：直接從鏈上查詢票券
      const ticket = await getTicketNFT(ticketId);
      
      if (!ticket) {
        setResult({
          success: false,
          message: 'Ticket not found on chain',
        });
        setLoading(false);
        return;
      }

      if (ticket.eventId !== eventId) {
        setResult({
          success: false,
          message: 'Ticket not for this event',
        });
        setLoading(false);
        return;
      }

      if (ticket.isUsed) {
        setResult({
          success: false,
          message: 'Ticket already used',
        });
        setLoading(false);
        return;
      }

      // Demo 模式：顯示驗證成功（實際驗證需要調用 Move 合約的 redeem 函數）
      setResult({
        success: true,
        message: 'Ticket is valid (Demo mode - requires GateCap for actual verification)',
        data: {
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType,
          seatZone: ticket.seatZone,
          seatNumber: ticket.seatNumber,
          owner: ticket.owner,
        },
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Verification failed, please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Ticket Verification</h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket ID (Sui Object ID)
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event ID
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="活動 ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Ticket'}
            </button>
          </div>

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {result.success ? '✅' : '❌'}
                </span>
                <div>
                  <p
                    className={`font-semibold ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && result.data && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Ticket Number: {result.data.ticketNumber}</p>
                      <p>Ticket Type: {result.data.ticketType}</p>
                      {result.data.seatZone && (
                        <p>Seat Zone: {result.data.seatZone}</p>
                      )}
                      {result.data.seatNumber && (
                        <p>Seat Number: {result.data.seatNumber}</p>
                      )}
                      <p>Owner: <code className="text-xs">{result.data.owner.slice(0, 20)}...</code></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Scan ticket QR code to get ticket ID</li>
            <li>• Enter or select event ID</li>
            <li>• Click "Verify Ticket" to verify</li>
            <li>• After successful verification, the ticket will be marked as used</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

