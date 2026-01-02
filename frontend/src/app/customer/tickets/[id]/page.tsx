'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ticketAPI } from '@/lib/api';
import QRCode from 'qrcode.react';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    ticketAPI.detail(ticketId)
      .then((res) => {
        if (res.data.success) {
          setTicket(res.data.ticket);
        }
      })
      .catch((err) => {
        console.error('Failed to load ticket:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ticketId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">票券不存在</p>
          <Link
            href="/customer/tickets"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            返回票券列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/customer/tickets" className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            NFT 票務系統
          </Link>
          <Link
            href="/customer/tickets"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            返回
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NFT Ticket Display */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 rounded-2xl p-8 text-white">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-3xl font-bold mb-4">{ticket.eventName || '活動名稱'}</h2>
                <div className="space-y-3 mb-6">
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {ticket.eventDate || '日期'}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ticket.venue || '場地'}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {ticket.ticketType || '票種'}
                  </p>
                </div>
                <div className="border-t border-white/30 pt-4">
                  <p className="text-sm opacity-90">票券編號</p>
                  <p className="font-mono text-lg">{ticket.ticketNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-4">入場 QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={ticket.id || ticketId} size={200} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                下載票券
              </button>
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                分享
              </button>
              {!ticket.isUsed && (
                <button className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                  申請退款
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">票券詳情</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">活動名稱</p>
              <p className="font-semibold text-gray-900">{ticket.eventName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">票種</p>
              <p className="font-semibold text-gray-900">{ticket.ticketType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">座位區域</p>
              <p className="font-semibold text-gray-900">{ticket.seatZone || '無指定座位'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">座位號碼</p>
              <p className="font-semibold text-gray-900">{ticket.seatNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">購買時間</p>
              <p className="font-semibold text-gray-900">
                {ticket.purchaseTime ? new Date(ticket.purchaseTime).toLocaleString('zh-TW') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">購買價格</p>
              <p className="font-semibold text-gray-900">{ticket.purchasePrice ? `${ticket.purchasePrice} SUI` : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">區塊鏈資訊</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Token ID</p>
                <p className="font-mono text-sm text-gray-900 break-all">{ticket.id || ticketId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">合約地址</p>
                <p className="font-mono text-sm text-gray-900 break-all">{ticket.contractAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">區塊鏈</p>
                <p className="font-semibold text-gray-900">Sui Devnet</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

