'use client';

import { useState } from 'react';
import { verificationAPI } from '@/lib/api';

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
        message: '請輸入票券 ID 和活動 ID',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await verificationAPI.verify({
        ticketId,
        eventId,
      });

      if (response.data.success) {
        setResult({
          success: true,
          message: '驗票成功！',
          data: response.data.data,
        });
      } else {
        setResult({
          success: false,
          message: response.data.error || '驗票失敗',
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error || '驗票失敗，請稍後再試',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">驗票系統</h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                票券 ID (Sui Object ID)
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
                活動 ID
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
              {loading ? '驗證中...' : '驗證票券'}
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
                      <p>票券編號: {result.data.ticketNumber}</p>
                      <p>票種: {result.data.ticketType}</p>
                      {result.data.seatZone && (
                        <p>座位區域: {result.data.seatZone}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">使用說明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 掃描票券 QR Code 獲取票券 ID</li>
            <li>• 輸入或選擇活動 ID</li>
            <li>• 點擊「驗證票券」進行驗證</li>
            <li>• 驗證成功後，票券將被標記為已使用</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

