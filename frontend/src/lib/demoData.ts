// Demo 數據 - 用於展示功能，無需後端
'use client';

import { getDemoEvent } from './demoEvents';

/**
 * Demo 模式：模擬主辦方創建的活動
 */
export function getDemoOrganizerEvents(organizerAddress: string) {
  return [
    {
      id: 'demo-taipei-jazz-2026',
      name: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
      status: 'published',
      startTime: '2026-02-01T19:30:00+08:00',
      endTime: '2026-02-01T22:00:00+08:00',
      createdAt: new Date().toISOString(),
      ticketTypes: [
        { id: 'vvip', name: 'VVIP - Prestige', price: 150, quantity: 300, sold: 45 },
        { id: 'grand', name: 'Grand Tier - Standard', price: 80, quantity: 919, sold: 234 },
        { id: 'balcony', name: 'Balcony - Experience', price: 35, quantity: 500, sold: 156 },
      ],
    },
  ];
}

/**
 * Demo 模式：模擬用戶的訂單
 */
export function getDemoOrders(userAddress: string) {
  return [
    {
      id: 'demo-order-1',
      eventId: 'demo-taipei-jazz-2026',
      eventName: 'Taipei Neo-Jazz Night 2026: Rhythms of the City',
      total: 80,
      status: 'completed',
      createdAt: new Date().toISOString(),
      tickets: [
        {
          id: 'demo-ticket-1',
          ticketType: 'Grand Tier - Standard',
          ticketNumber: 'GT-001234',
          seatZone: 'K',
          seatNumber: '15',
        },
      ],
    },
  ];
}

/**
 * Demo 模式：獲取 TicketAdmin ID（用於 demo）
 * 實際部署後，這個 ID 應該從鏈上查詢
 */
export const DEMO_TICKET_ADMIN_ID = process.env.NEXT_PUBLIC_DEMO_TICKET_ADMIN_ID || '0x0';

/**
 * Demo 模式：檢查是否為 demo 模式
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || process.env.NEXT_PUBLIC_SUI_PACKAGE_ID === '0x0';
}

