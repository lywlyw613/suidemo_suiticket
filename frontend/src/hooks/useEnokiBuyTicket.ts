// 使用 Enoki 購買票券的 Hook
'use client';

import { useState } from 'react';
import { useEnokiFlow, useZkLoginSession } from '@mysten/enoki/react';
import { Transaction } from '@mysten/sui.js/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { suiToMist } from '@/lib/enokiWallet';

const suiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

interface BuyTicketParams {
  eventId: string; // Sui Object ID of the event
  price: number; // Price in SUI
  recipient?: string; // Optional recipient address (defaults to user's address)
}

/**
 * Hook for buying tickets using Enoki zkLogin
 */
export function useEnokiBuyTicket() {
  const enokiFlow = useEnokiFlow();
  const session = useZkLoginSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyTicket = async (params: BuyTicketParams): Promise<{ success: boolean; digest?: string; error?: string }> => {
    if (!session?.jwt) {
      return {
        success: false,
        error: '請先使用 zkLogin 登入',
      };
    }

    setLoading(true);
    setError(null);

    try {
      // 獲取用戶地址
      // 注意：Enoki 管理的地址通常存儲在後端用戶數據中
      // 這裡假設可以從 session 或通過其他方式獲取
      // 如果無法獲取，使用提供的 recipient 或從後端獲取
      let userAddress: string;
      
      // 優先從 localStorage 中的用戶數據獲取地址（最可靠）
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.suiAddress) {
            userAddress = user.suiAddress;
          } else {
            throw new Error('用戶數據中沒有 suiAddress');
          }
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          throw new Error('無法解析用戶數據');
        }
      } else if (params.recipient) {
        userAddress = params.recipient;
      } else {
        throw new Error('無法獲取用戶地址。請確保已登入或提供 recipient 參數');
      }
      
      const recipient = params.recipient || userAddress;

      // 創建交易
      const tx = new Transaction();
      
      // 設置 Gas Budget
      tx.setGasBudget(30_000_000); // 30 MIST

      // 將價格轉換為 MIST
      const priceMist = suiToMist(params.price);

      // 從 gas 中分離出支付金額
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);

      // 調用 buy_ticket 函數
      // 注意：這裡需要根據實際的 Move 合約調整 target
      // 假設合約結構為：package_id::module::buy_ticket
      const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';
      
      if (!PACKAGE_ID) {
        throw new Error('未配置 SUI_PACKAGE_ID');
      }

      tx.moveCall({
        target: `${PACKAGE_ID}::ticket_nft::buy_ticket`,
        arguments: [
          tx.object(params.eventId), // Event object
          paymentCoin, // Payment coin
          tx.pure.address(recipient), // Recipient address
        ],
      });

      // 使用 Enoki 簽名並執行交易
      // Enoki 會自動處理 zkLogin 簽名
      const result = await enokiFlow.signAndExecuteTransaction({
        transaction: tx,
        network: 'devnet',
        // 如果配置了 Gas Sponsor，可以啟用
        // gasSponsor: {
        //   gasStationId: process.env.NEXT_PUBLIC_ENOKI_GAS_STATION_ID || '',
        // },
      });

      setLoading(false);
      return {
        success: true,
        digest: result.digest,
      };
    } catch (err: any) {
      console.error('Buy ticket error:', err);
      const errorMessage = err.message || '購票失敗，請稍後再試';
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    buyTicket,
    loading,
    error,
  };
}

