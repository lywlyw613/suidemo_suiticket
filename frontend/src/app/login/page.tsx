'use client';

// Force dynamic rendering - this page uses client-only hooks
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import * as React from 'react';
import { useEnokiFlow } from '@mysten/enoki/react';
import { useCurrentAccount, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { useWalletLogin, useZkLoginFrontend } from '@/lib/frontendAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Role = 'customer' | 'organizer' | 'verifier' | null;

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Hooks must be called unconditionally at the top level
  const enokiFlow = useEnokiFlow();
  const currentAccount = useCurrentAccount();
  const { mutate: connectWallet } = useConnectWallet();
  const wallets = useWallets();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // 檢查是否已登入
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (token && userRole) {
      // 已登入，直接跳轉
      // 如果已經在目標頁面，就不重定向
      const currentPath = window.location.pathname;
      const isOnTargetPage = currentPath.startsWith('/organizer/') || 
                            currentPath.startsWith('/verifier/') || 
                            currentPath.startsWith('/customer/');
      
      if (!isOnTargetPage) {
        const redirectPath = userRole === 'organizer' ? '/organizer/dashboard' 
          : userRole === 'verifier' ? '/verifier/dashboard' 
          : '/customer/dashboard';
        router.push(redirectPath);
      }
    }
  }, [mounted, router]);

  // 根據角色決定跳轉路徑
  const getRedirectPath = (role: Role) => {
    if (!role) return '/';
    switch (role) {
      case 'organizer':
        return '/organizer/dashboard';
      case 'verifier':
        return '/verifier/dashboard';
      case 'customer':
      default:
        return '/customer/dashboard';
    }
  };

  // 開發模式登入
  const handleDevLogin = async () => {
    if (!selectedRole) {
      setError('Please select a login role first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mockData = {
        sub: 'dev-user-' + Date.now(),
        email: 'dev@example.com',
        name: 'Dev Test User',
        picture: '',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const mockToken = btoa(encodeURIComponent(JSON.stringify(mockData)));

      // 純前端：創建開發模式用戶
      const user: any = {
        id: `dev-${Date.now()}`,
        address: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        name: 'Dev Test User',
        email: 'dev@example.com',
        loginType: 'wallet',
        createdAt: Date.now(),
      };

      localStorage.setItem('token', `dev-${Date.now()}`);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', selectedRole);
      // 使用 replace 避免返回按鈕回到登入頁
      router.replace(getRedirectPath(selectedRole));
    } catch (err: any) {
      console.error('Dev login error:', err);
      setError(err.message || 'Dev mode login failed');
      setLoading(false);
    }
  };

  // Google 登入
  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a login role first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      // 將 role 保存到 sessionStorage，因為 redirect URL 不能包含 query 參數
      sessionStorage.setItem('pendingLoginRole', selectedRole);
      
      if (!enokiFlow) {
        throw new Error('Enoki flow not initialized');
      }
      
      const url = await enokiFlow.createAuthorizationURL({
        provider: 'google',
        clientId: googleClientId || '',
        redirectUrl: `${window.location.origin}/login/callback`,
        network: 'devnet',
      });
      
      if (!url) {
        throw new Error('Failed to create login URL, please check Enoki configuration');
      }

      window.location.href = url;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed, please try again');
      setLoading(false);
    }
  };

  // Sui Wallet 登入
  // 純前端登入 hooks
  const walletLogin = useWalletLogin();
  const zkLoginFrontend = useZkLoginFrontend();

  const handleWalletLogin = async () => {
    if (!selectedRole) {
      setError('Please select a login role first');
      return;
    }

    if (!currentAccount?.address) {
      setError('Please connect wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 純前端登入，無需後端
      const user = walletLogin.login(selectedRole);
      
      if (user) {
        // 使用 replace 避免返回按鈕回到登入頁
        router.replace(getRedirectPath(selectedRole));
      } else {
        throw new Error('Wallet login failed');
      }
    } catch (err: any) {
      console.error('Wallet login error:', err);
      setError(err.message || 'Wallet login failed');
      setLoading(false);
    }
  };


  // Devnet Faucet
  const handleFaucet = async () => {
    if (!currentAccount?.address) {
      setError('Please connect wallet first');
      return;
    }

    setFaucetLoading(true);
    setError(null);

    try {
      const response = await fetch('https://faucet.devnet.sui.io/v2/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: currentAccount.address,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Faucet request failed: ${errorData}`);
      }

      const data = await response.json();
      console.log('Faucet response:', data);
      alert('✅ Successfully requested test coins! Please wait a moment, test coins will arrive automatically.');
    } catch (err: any) {
      console.error('Faucet error:', err);
      setError(err.message || 'Failed to get test coins');
    } finally {
      setFaucetLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'customer' as Role,
      title: 'Ticket Buyer',
      description: 'Browse events and purchase NFT tickets',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      id: 'organizer' as Role,
      title: 'Event Organizer',
      description: 'Create events and manage tickets',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'verifier' as Role,
      title: 'Ticket Verifier',
      description: 'Scan QR codes and verify tickets',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ];

  // Wait for client-side mounting before rendering
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome Back</h1>
          <p className="text-lg text-gray-800">Please select your role to continue</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Login Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleOptions.map((option) => {
              const isSelected = selectedRole === option.id;
              const colorMap: Record<string, string> = {
                customer: 'from-primary-500 to-primary-600',
                organizer: 'from-secondary-500 to-secondary-600',
                verifier: 'from-accent-500 to-accent-600',
              };
              const optionId = option.id as string;
              return (
                <button
                  key={optionId}
                  onClick={() => {
                    setSelectedRole(option.id);
                    setError(null);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-300 bg-primary-50 shadow-soft-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-soft card-hover'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${colorMap[optionId] || option.color} flex items-center justify-center text-white mb-4 shadow-soft`}>
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-800">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Methods */}
        {selectedRole && (
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Login Methods</h2>

            {/* Dev Mode Toggle */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={devMode}
                  onChange={(e) => setDevMode(e.target.checked)}
                  className="mr-3 w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded"
                />
                <span className="text-sm text-yellow-800 font-medium">Dev Mode (Skip zkLogin)</span>
              </label>
            </div>

            <div className="space-y-4">
              {/* Sui Wallet Login */}
              {currentAccount ? (
                <div className="space-y-3">
                  <button
                    onClick={handleWalletLogin}
                    disabled={loading}
                    className="w-full btn-primary bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Connected: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)} - Click to login</span>
                      </>
                    )}
                  </button>

                  {/* Faucet Button */}
                  <button
                    onClick={handleFaucet}
                    disabled={faucetLoading}
                    className="w-full py-2.5 px-4 bg-accent-50 text-accent-700 rounded-xl font-medium hover:bg-accent-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm border border-accent-200"
                  >
                    {faucetLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700"></div>
                        <span>Requesting...</span>
                      </>
                    ) : (
                      <>
                        <span>💧</span>
                        <span>Get Devnet Test Coins</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (connecting) return;
                    setConnecting(true);
                    setError(null);
                    try {
                      console.log('所有檢測到的錢包:', wallets);
                      console.log('錢包詳細信息:', wallets.map(w => ({
                        name: w.name,
                        accounts: w.accounts,
                      })));
                      
                      // 嘗試找到可用的錢包
                      // 使用類型斷言來訪問可能存在的屬性
                      let availableWallet = wallets.find(w => {
                        const wallet = w as any;
                        return wallet.installed || wallet.available || true; // 如果沒有標誌，默認可用
                      });
                      
                      // 如果沒找到，嘗試使用第一個錢包（可能是 Slush 或其他）
                      if (!availableWallet && wallets.length > 0) {
                        availableWallet = wallets[0];
                        console.log('使用第一個可用錢包:', availableWallet.name);
                      }
                      
                      if (availableWallet) {
                        console.log('嘗試連接錢包:', availableWallet.name);
                        connectWallet(
                          { wallet: availableWallet },
                          {
                            onSuccess: () => {
                              console.log('錢包連接成功');
                              setConnecting(false);
                            },
                            onError: (err: any) => {
                              console.error('連接錢包錯誤:', err);
                              setError(err.message || '連接錢包失敗，請確保錢包擴展已啟用');
                              setConnecting(false);
                            },
                          }
                        );
                      } else {
                        setError('未找到可用的 Sui 錢包。請確保：\n1. 已安裝 Sui Wallet 擴展（如 Slush Wallet）\n2. 擴展已啟用\n3. 刷新頁面後重試');
                        setConnecting(false);
                      }
                    } catch (err: any) {
                      console.error('連接錢包異常:', err);
                      setError(err.message || '連接錢包失敗');
                      setConnecting(false);
                    }
                  }}
                  disabled={connecting}
                  className="w-full btn-primary bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 flex items-center justify-center gap-3"
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in with Sui Wallet</span>
                      {wallets.length > 0 && (
                        <span className="text-xs opacity-75">({wallets.length} wallets available)</span>
                      )}
                    </>
                  )}
                </button>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-800 font-medium">or</span>
                </div>
              </div>

              {/* Google Login - 注意：完整功能需要後端支持 */}
              {!devMode && (
                <div>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full btn-secondary flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Sign in with Google (zkLogin - Demo)</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Note: Full zkLogin requires backend. This is a demo mode.
                  </p>
                </div>
              )}

              {/* Dev Mode Login */}
              {devMode && (
                <button
                  onClick={handleDevLogin}
                  disabled={loading}
                  className="w-full btn-primary bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔧</span>
                      <span>Dev Mode Login</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-700">
          <p>🌐 Current Network: Devnet</p>
        </div>
      </main>
    </div>
  );
}
