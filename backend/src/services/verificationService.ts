import { suiClient } from '../config/sui.js';
import { TicketVerification, NFTTicket } from '../config/database.js';
import { logger } from '../utils/logger';

export interface VerificationResult {
  valid: boolean;
  ticketInfo?: {
    ticketNumber: string;
    ticketType: string;
    seatZone?: string;
    owner: string;
  };
  error?: string;
}

/**
 * 驗證票券（鏈上查詢 + 數據庫記錄）
 */
export async function verifyTicket(
  ticketId: string, // Sui Object ID
  eventId: string,
  verifierId?: string
): Promise<VerificationResult> {
  try {
    // 1. 查詢鏈上 NFT
    const nft = await suiClient.getObject({
      id: ticketId,
      options: {
        showContent: true,
        showOwner: true,
      },
    });

    if (nft.error || !nft.data) {
      return {
        valid: false,
        error: 'Ticket not found on chain',
      };
    }

    // 2. 讀取 NFT metadata
    const content = nft.data.content;
    if (content?.dataType !== 'moveObject') {
      return {
        valid: false,
        error: 'Invalid ticket object type',
      };
    }

    const fields = (content as any).fields;
    const ticketNumber = fields?.ticket_number || '';
    const eventIdFromNFT = fields?.event_id || '';
    const isUsed = fields?.is_used || false;

    // 3. 驗證活動 ID 匹配
    if (eventIdFromNFT !== eventId) {
      return {
        valid: false,
        error: 'Ticket not for this event',
      };
    }

    // 4. 檢查是否已使用（鏈上狀態）
    if (isUsed) {
      return {
        valid: false,
        error: 'Ticket already used',
      };
    }

    // 5. 檢查數據庫記錄（防重複驗證）
    const existingVerification = await TicketVerification.findOne({
      suiObjectId: ticketId,
      verificationResult: 'success',
    });

    if (existingVerification) {
      return {
        valid: false,
        error: 'Ticket already verified',
      };
    }

    // 6. 獲取擁有者地址
    const owner = nft.data.owner;
    let ownerAddress = '';
    if (owner) {
      if (typeof owner === 'object') {
        // Sui owner 可能是 { AddressOwner: "0x..." } 格式
        if ('AddressOwner' in owner) {
          ownerAddress = (owner as any).AddressOwner || '';
        } else if ('ObjectOwner' in owner) {
          ownerAddress = (owner as any).ObjectOwner || '';
        }
      } else if (typeof owner === 'string') {
        ownerAddress = owner;
      }
    }

    // 7. 記錄驗證結果
    await TicketVerification.create({
      suiObjectId: ticketId,
      eventId,
      ticketNumber,
      verifierId: verifierId || undefined,
      verificationResult: 'success',
    });

    // 8. 更新票券狀態（如果數據庫中有記錄）
    await NFTTicket.updateMany(
      {
        suiObjectId: ticketId,
      },
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
        },
      }
    );

    logger.info('Ticket verified successfully', {
      ticketId,
      eventId,
      ticketNumber,
    });

    return {
      valid: true,
      ticketInfo: {
        ticketNumber,
        ticketType: fields?.ticket_type || '',
        seatZone: fields?.seat_zone || undefined,
        owner: ownerAddress,
      },
    };
  } catch (error: any) {
    logger.error('Ticket verification failed', {
      ticketId,
      eventId,
      error: error.message,
    });

    // 記錄失敗的驗證
    await TicketVerification.create({
      suiObjectId: ticketId,
      eventId,
      verifierId: verifierId || undefined,
      verificationResult: 'failed',
      errorMessage: error.message,
    }).catch(() => {
      // Ignore errors when recording failed verification
    });

    return {
      valid: false,
      error: error.message || 'Verification failed',
    };
  }
}

/**
 * 獲取驗證記錄
 */
export async function getVerificationRecords(options: {
  eventId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (options.eventId) {
    query.eventId = options.eventId;
  }
  if (options.startDate || options.endDate) {
    query.verifiedAt = {};
    if (options.startDate) {
      query.verifiedAt.$gte = options.startDate;
    }
    if (options.endDate) {
      query.verifiedAt.$lte = options.endDate;
    }
  }

  const [records, total] = await Promise.all([
    TicketVerification.find(query)
      .sort({ verifiedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TicketVerification.countDocuments(query),
  ]);

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default {
  verifyTicket,
  getVerificationRecords,
};

