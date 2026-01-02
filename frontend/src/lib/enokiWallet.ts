// Enoki 錢包工具函數
'use client';

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { useEnokiFlow, useZkLoginSession } from '@mysten/enoki/react';
import { Transaction } from '@mysten/sui.js/transactions';

// 創建 Sui Client (devnet)
const suiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

/**
 * 獲取 Enoki 管理的地址
 * 從 zkLogin session 或後端用戶數據中獲取
 * 
 * 注意：Enoki 管理的地址通常存儲在後端用戶數據中（user.suiAddress）
 * 如果需要從 Enoki 直接獲取，需要確保 session 已初始化
 */
export function useEnokiAddress() {
  const session = useZkLoginSession();
  const enokiFlow = useEnokiFlow();

  // 嘗試從 Enoki session 獲取地址
  // 注意：實際地址通常由後端在登入時計算並存儲
  const getAddress = async (): Promise<string | null> => {
    try {
      // 如果 session 存在，可以嘗試獲取地址
      // 但通常地址已經在後端用戶數據中
      if (session?.jwt) {
        // Enoki 會自動管理地址，但獲取方式可能因版本而異
        // 建議從後端用戶數據中獲取 user.suiAddress
        console.log('Enoki session exists, address should be in user data');
      }
    } catch (error) {
      console.error('Failed to get Enoki address:', error);
    }
    return null;
  };

  return { getAddress, session };
}

/**
 * 獲取 SUI 餘額
 */
export async function getSuiBalance(address: string): Promise<bigint> {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
    });
    return BigInt(balance.totalBalance);
  } catch (error) {
    console.error('Failed to get balance:', error);
    return BigInt(0);
  }
}

/**
 * 格式化 SUI 餘額（從 MIST 轉換為 SUI）
 */
export function formatSuiBalance(mist: bigint): string {
  const sui = Number(mist) / 1_000_000_000; // 1 SUI = 10^9 MIST
  return sui.toFixed(4);
}

/**
 * 從 SUI 轉換為 MIST
 */
export function suiToMist(sui: number): bigint {
  return BigInt(Math.floor(sui * 1_000_000_000));
}

/**
 * 從 MIST 轉換為 SUI
 */
export function mistToSui(mist: bigint): number {
  return Number(mist) / 1_000_000_000;
}

/**
 * 請求 Devnet Faucet
 */
export async function requestFaucet(address: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://faucet.devnet.sui.io/v2/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        message: `Faucet 請求失敗: ${errorData}`,
      };
    }

    const data = await response.json();
    console.log('Faucet response:', data);
    return {
      success: true,
      message: '✅ 已成功請求測試幣！請稍等片刻，測試幣會自動到帳。',
    };
  } catch (error: any) {
    console.error('Faucet error:', error);
    return {
      success: false,
      message: error.message || '獲取測試幣失敗',
    };
  }
}

/**
 * 使用 Enoki 簽名並執行交易
 * 
 * 注意：此函數需要在 React 組件中使用（因為使用了 hook）
 * 或者直接使用 useEnokiFlow hook
 */
export function useEnokiTransaction() {
  const enokiFlow = useEnokiFlow();

  const signAndExecuteTransaction = async (
    transaction: Transaction,
    options?: {
      network?: 'mainnet' | 'testnet' | 'devnet';
      gasSponsor?: boolean;
    }
  ) => {
    try {
      // 使用 Enoki 簽名交易
      // Enoki 會自動處理 zkLogin 簽名
      const result = await enokiFlow.signAndExecuteTransaction({
        transaction,
        network: options?.network || 'devnet',
        // 如果啟用 Gas Sponsor，Enoki 會自動處理
        // 注意：Gas Sponsor 配置可能因 Enoki 版本而異
        ...(options?.gasSponsor && process.env.NEXT_PUBLIC_ENOKI_GAS_STATION_ID && {
          gasSponsor: {
            gasStationId: process.env.NEXT_PUBLIC_ENOKI_GAS_STATION_ID,
          },
        }),
      });

      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return { signAndExecuteTransaction };
}

