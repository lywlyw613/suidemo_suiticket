// 純前端 Sui 票券工具函數 - 直接查詢鏈上數據，無需後端
'use client';

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// 創建 Sui Client (devnet)
const suiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

// 合約配置
const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0';
const TICKET_MODULE = 'ticket_nft';

export interface TicketNFT {
  objectId: string;
  eventId: string;
  ticketType: string;
  ticketNumber: string;
  seatZone?: string;
  seatNumber?: string;
  purchaseTime: number;
  purchasePrice: number;
  organizerId: string;
  isUsed: boolean;
  eventName: string;
  eventStartTime: number;
  venueName: string;
  owner: string;
}

/**
 * 從鏈上查詢票券 NFT 數據
 */
export async function getTicketNFT(ticketId: string): Promise<TicketNFT | null> {
  try {
    const object = await suiClient.getObject({
      id: ticketId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    });

    if (object.error || !object.data) {
      return null;
    }

    const content = object.data.content;
    if (content?.dataType !== 'moveObject') {
      return null;
    }

    const fields = (content as any).fields;
    const owner = object.data.owner;
    let ownerAddress = '';
    
    if (typeof owner === 'object') {
      if ('AddressOwner' in owner) {
        ownerAddress = (owner as any).AddressOwner || '';
      } else if ('ObjectOwner' in owner) {
        ownerAddress = (owner as any).ObjectOwner || '';
      }
    } else if (typeof owner === 'string') {
      ownerAddress = owner;
    }

    return {
      objectId: ticketId,
      eventId: fields.event_id || '',
      ticketType: fields.ticket_type || '',
      ticketNumber: fields.ticket_number || '',
      seatZone: fields.seat_zone || undefined,
      seatNumber: fields.seat_number || undefined,
      purchaseTime: Number(fields.purchase_time || 0),
      purchasePrice: Number(fields.purchase_price || 0),
      organizerId: fields.organizer_id || '',
      isUsed: fields.is_used || false,
      eventName: fields.event_name || '',
      eventStartTime: Number(fields.event_start_time || 0),
      venueName: fields.venue_name || '',
      owner: ownerAddress,
    };
  } catch (error) {
    console.error('Failed to get ticket NFT:', error);
    return null;
  }
}

/**
 * 查詢用戶擁有的所有票券 NFT
 */
export async function getUserTickets(address: string): Promise<TicketNFT[]> {
  try {
    // 查詢用戶擁有的所有 TicketNFT 對象
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::${TICKET_MODULE}::TicketNFT`,
      },
      options: {
        showContent: true,
        showOwner: true,
      },
    });

    const tickets: TicketNFT[] = [];

    for (const obj of objects.data) {
      if (obj.data) {
        const content = obj.data.content;
        if (content?.dataType === 'moveObject') {
          const fields = (content as any).fields;
          const owner = obj.data.owner;
          let ownerAddress = '';
          
          if (typeof owner === 'object') {
            if ('AddressOwner' in owner) {
              ownerAddress = (owner as any).AddressOwner || '';
            } else if ('ObjectOwner' in owner) {
              ownerAddress = (owner as any).ObjectOwner || '';
            }
          } else if (typeof owner === 'string') {
            ownerAddress = owner;
          }

          tickets.push({
            objectId: obj.data.objectId,
            eventId: fields.event_id || '',
            ticketType: fields.ticket_type || '',
            ticketNumber: fields.ticket_number || '',
            seatZone: fields.seat_zone || undefined,
            seatNumber: fields.seat_number || undefined,
            purchaseTime: Number(fields.purchase_time || 0),
            purchasePrice: Number(fields.purchase_price || 0),
            organizerId: fields.organizer_id || '',
            isUsed: fields.is_used || false,
            eventName: fields.event_name || '',
            eventStartTime: Number(fields.event_start_time || 0),
            venueName: fields.venue_name || '',
            owner: ownerAddress,
          });
        }
      }
    }

    return tickets;
  } catch (error) {
    console.error('Failed to get user tickets:', error);
    return [];
  }
}

/**
 * 驗證票券（直接調用鏈上合約）
 */
export async function verifyTicket(
  ticketId: string,
  gateCapId: string,
  signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<{ success: boolean; error?: string; digest?: string }> {
  try {
    const ticket = await getTicketNFT(ticketId);
    
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    if (ticket.isUsed) {
      return { success: false, error: 'Ticket already used' };
    }

    // 創建交易來調用 redeem 函數
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${TICKET_MODULE}::redeem`,
      arguments: [
        tx.object(ticketId),
        tx.object(gateCapId),
      ],
    });

    const result = await signAndExecute(tx);
    
    return {
      success: true,
      digest: result.digest,
    };
  } catch (error: any) {
    console.error('Verify ticket error:', error);
    return {
      success: false,
      error: error.message || 'Verification failed',
    };
  }
}

/**
 * 生成票券 QR Code 數據
 */
export function generateTicketQRCode(ticketId: string, eventId: string): string {
  return JSON.stringify({
    ticketId,
    eventId,
    timestamp: Date.now(),
  });
}

/**
 * 解析 QR Code 數據
 */
export function parseTicketQRCode(qrData: string): { ticketId: string; eventId: string } | null {
  try {
    const data = JSON.parse(qrData);
    if (data.ticketId && data.eventId) {
      return {
        ticketId: data.ticketId,
        eventId: data.eventId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

