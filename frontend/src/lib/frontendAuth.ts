// 純前端認證 - 無需後端，使用 localStorage
'use client';

import { useZkLoginSession } from '@mysten/enoki/react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export interface FrontendUser {
  id: string;
  address: string;
  name?: string;
  email?: string;
  picture?: string;
  loginType: 'wallet' | 'zklogin';
  createdAt: number;
}

/**
 * 使用 Sui Wallet 登入（純前端）
 */
export function useWalletLogin() {
  const currentAccount = useCurrentAccount();

  const login = (role: 'customer' | 'organizer' | 'verifier'): FrontendUser | null => {
    if (!currentAccount?.address) {
      return null;
    }

    const user: FrontendUser = {
      id: `wallet-${currentAccount.address}`,
      address: currentAccount.address,
      name: `Wallet User ${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`,
      loginType: 'wallet',
      createdAt: Date.now(),
    };

    // 存儲到 localStorage
    localStorage.setItem('token', `wallet-${currentAccount.address}`);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', role);

    return user;
  };

  return { login, isConnected: !!currentAccount?.address, address: currentAccount?.address };
}

/**
 * 使用 zkLogin 登入（純前端，使用 Enoki session）
 * 注意：這只是 demo 方案，實際生產環境需要後端驗證 JWT
 */
export function useZkLoginFrontend() {
  const session = useZkLoginSession();

  const login = async (role: 'customer' | 'organizer' | 'verifier'): Promise<FrontendUser | null> => {
    if (!session?.jwt) {
      return null;
    }

    try {
      // 解析 JWT（不驗證簽名，僅用於 demo）
      const parts = session.jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(atob(parts[1]));
      
      // 從 Enoki session 獲取地址（如果可用）
      // 注意：實際地址計算需要 Enoki API，這裡使用臨時方案
      const address = `zklogin-${payload.sub.slice(0, 16)}`;

      const user: FrontendUser = {
        id: `zklogin-${payload.sub}`,
        address,
        name: payload.name || payload.email || 'zkLogin User',
        email: payload.email,
        picture: payload.picture,
        loginType: 'zklogin',
        createdAt: Date.now(),
      };

      // 存儲到 localStorage
      localStorage.setItem('token', session.jwt);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', role);

      return user;
    } catch (error) {
      console.error('Failed to parse zkLogin session:', error);
      return null;
    }
  };

  return { login, hasSession: !!session?.jwt, session };
}

/**
 * 獲取當前用戶（從 localStorage）
 */
export function getCurrentUser(): FrontendUser | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 登出
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
}

/**
 * 檢查是否已登入
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

