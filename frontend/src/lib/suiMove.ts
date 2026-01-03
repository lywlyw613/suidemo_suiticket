// 純前端 Move 合約調用 - 使用 Sui SDK 直接調用 Move 函數
'use client';

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const suiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0';
const TICKET_MODULE = 'ticket_nft';

/**
 * 鑄造票券 NFT（主辦方使用）
 */
export async function mintTicket(
  adminId: string, // TicketAdmin shared object ID
  params: {
    eventId: string;
    ticketType: string;
    ticketNumber: string;
    seatZone?: string;
    seatNumber?: string;
    purchasePrice: number; // in SUI
    organizerId: string;
    eventName: string;
    eventStartTime: number; // Unix timestamp in ms
    venueName: string;
    recipient: string; // recipient address
  },
  signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<{ success: boolean; digest?: string; ticketId?: string; error?: string }> {
  try {
    const tx = new TransactionBlock();
    
    // Convert price from SUI to MIST (1 SUI = 10^9 MIST)
    const priceMist = BigInt(Math.floor(params.purchasePrice * 1_000_000_000));

    // Prepare optional arguments for Option<String>
    // In Sui SDK, Option types need to be constructed manually
    // For Option<String>, we use pure with the value or null
    const seatZoneArg = params.seatZone 
      ? tx.pure.string(params.seatZone)
      : tx.pure(null);
    
    const seatNumberArg = params.seatNumber
      ? tx.pure.string(params.seatNumber)
      : tx.pure(null);

    tx.moveCall({
      target: `${PACKAGE_ID}::${TICKET_MODULE}::mint_ticket`,
      arguments: [
        tx.object(adminId), // admin
        tx.pure.string(params.eventId),
        tx.pure.string(params.ticketType),
        tx.pure.string(params.ticketNumber),
        seatZoneArg,
        seatNumberArg,
        tx.pure.u64(priceMist),
        tx.pure.string(params.organizerId),
        tx.pure.string(params.eventName),
        tx.pure.u64(params.eventStartTime),
        tx.pure.string(params.venueName),
        tx.pure.address(params.recipient),
      ],
    });

    const result = await signAndExecute(tx);

    // Extract ticket ID from transaction result
    // The minted ticket will be in the created objects
    let ticketId: string | undefined;
    if (result.objectChanges) {
      const createdTicket = result.objectChanges.find(
        (change: any) => change.type === 'created' && change.objectType?.includes('TicketNFT')
      );
      if (createdTicket) {
        ticketId = createdTicket.objectId;
      }
    }

    return {
      success: true,
      digest: result.digest,
      ticketId,
    };
  } catch (error: any) {
    console.error('Mint ticket error:', error);
    return {
      success: false,
      error: error.message || 'Failed to mint ticket',
    };
  }
}

/**
 * 創建票券類型（主辦方使用）
 */
export async function createTicketType(
  adminId: string,
  params: {
    eventId: string;
    ticketTypeName: string;
    price: number; // in SUI
    totalQuantity: number;
    organizerId: string;
  },
  signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<{ success: boolean; digest?: string; ticketTypeId?: string; error?: string }> {
  try {
    const tx = new TransactionBlock();
    
    // Convert price from SUI to MIST (1 SUI = 10^9 MIST)
    const priceMist = BigInt(Math.floor(params.price * 1_000_000_000));

    tx.moveCall({
      target: `${PACKAGE_ID}::${TICKET_MODULE}::create_ticket_type`,
      arguments: [
        tx.object(adminId), // admin
        tx.pure.string(params.eventId),
        tx.pure.string(params.ticketTypeName),
        tx.pure.u64(priceMist),
        tx.pure.u64(params.totalQuantity),
        tx.pure.string(params.organizerId),
      ],
    });

    const result = await signAndExecute(tx);

    // Extract ticket type ID from transaction result
    let ticketTypeId: string | undefined;
    if (result.objectChanges) {
      const createdTicketType = result.objectChanges.find(
        (change: any) => change.type === 'created' && change.objectType?.includes('TicketType')
      );
      if (createdTicketType) {
        ticketTypeId = createdTicketType.objectId;
      }
    }

    return {
      success: true,
      digest: result.digest,
      ticketTypeId,
    };
  } catch (error: any) {
    console.error('Create ticket type error:', error);
    // 安全地提取錯誤訊息
    let errorMessage = 'Failed to create ticket type';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 發布票券類型（設置為可銷售）
 */
export async function publishTicketType(
  ticketTypeId: string,
  signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<{ success: boolean; digest?: string; error?: string }> {
  try {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${PACKAGE_ID}::${TICKET_MODULE}::publish_ticket_type`,
      arguments: [
        tx.object(ticketTypeId),
      ],
    });

    const result = await signAndExecute(tx);

    return {
      success: true,
      digest: result.digest,
    };
  } catch (error: any) {
    console.error('Publish ticket type error:', error);
    // 安全地提取錯誤訊息
    let errorMessage = 'Failed to publish ticket type';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 創建 GateCap（驗票權限）
 */
export async function createGateCap(
  adminId: string,
  eventId: string,
  recipient: string,
  signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<{ success: boolean; digest?: string; gateCapId?: string; error?: string }> {
  try {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${PACKAGE_ID}::${TICKET_MODULE}::create_gate_cap`,
      arguments: [
        tx.object(adminId), // admin
        tx.pure.string(eventId),
        tx.pure.address(recipient),
      ],
    });

    const result = await signAndExecute(tx);

    // Extract GateCap ID from transaction result
    let gateCapId: string | undefined;
    if (result.objectChanges) {
      const createdCap = result.objectChanges.find(
        (change: any) => change.type === 'created' && change.objectType?.includes('GateCap')
      );
      if (createdCap) {
        gateCapId = createdCap.objectId;
      }
    }

    return {
      success: true,
      digest: result.digest,
      gateCapId,
    };
  } catch (error: any) {
    console.error('Create gate cap error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create gate cap',
    };
  }
}

/**
 * 轉移票券 NFT
 */
export async function transferTicket(
  ticketId: string,
  recipient: string,
  signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<{ success: boolean; digest?: string; error?: string }> {
  try {
    const tx = new TransactionBlock();

    // Transfer the ticket NFT
    tx.transferObjects(
      [tx.object(ticketId)],
      recipient
    );

    const result = await signAndExecute(tx);

    return {
      success: true,
      digest: result.digest,
    };
  } catch (error: any) {
    console.error('Transfer ticket error:', error);
    return {
      success: false,
      error: error.message || 'Failed to transfer ticket',
    };
  }
}

/**
 * 查詢 TicketAdmin shared object
 */
export async function getTicketAdmin(): Promise<string | null> {
  try {
    // Query for TicketAdmin shared object
    // Note: Shared objects cannot be queried using getOwnedObjects
    // The admin ID should be stored in environment variables or passed as parameter
    // For demo purposes, we return null and expect the admin ID to be provided
    // In production, store the admin ID after contract deployment
    
    // TODO: In production, store TicketAdmin object ID after contract initialization
    // For now, return null and let user provide admin ID from demoData
    return null;
  } catch (error) {
    console.error('Failed to get ticket admin:', error);
    return null;
  }
}

// Kiosk functionality removed for demo - not needed for core ticketing features

