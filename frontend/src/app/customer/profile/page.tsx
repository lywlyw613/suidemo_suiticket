'use client';

// Force dynamic rendering - this page uses client-only hooks
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/frontendAuth';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useZkLoginSession } from '@mysten/enoki/react';
import { getSuiBalance, formatSuiBalance, requestFaucet } from '@/lib/enokiWallet';

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Early return if not mounted (prevents SSR issues)
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Hooks must be called unconditionally, but we check mounted before using them
  const currentAccount = useCurrentAccount();
  const zkLoginSession = useZkLoginSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'wallet' | 'preferences' | 'orders'>('info');
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 純前端：從 localStorage 讀取用戶數據
    const user = getCurrentUser();
    if (user) {
      setUser(user);
    } else {
      // 用戶數據不存在，清除並跳轉
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  // 獲取餘額
  useEffect(() => {
    const fetchBalance = async () => {
      // 優先使用 Enoki zkLogin 地址
      const address = user?.suiAddress || currentAccount?.address;
      if (address && activeTab === 'wallet') {
        setBalanceLoading(true);
        try {
          const bal = await getSuiBalance(address);
          setBalance(bal);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        } finally {
          setBalanceLoading(false);
        }
      }
    };

    if (user || currentAccount) {
      fetchBalance();
    }
  }, [user, currentAccount, activeTab]);

  // 處理 Faucet 請求
  const handleFaucet = async () => {
    const address = user?.suiAddress || currentAccount?.address;
    if (!address) {
      setFaucetMessage('❌ Unable to get wallet address');
      return;
    }

    setFaucetLoading(true);
    setFaucetMessage(null);

    try {
      const result = await requestFaucet(address);
      setFaucetMessage(result.message);
      
      // 如果成功，等待幾秒後刷新餘額
      if (result.success) {
        setTimeout(async () => {
          const bal = await getSuiBalance(address);
          setBalance(bal);
        }, 5000);
      }
    } catch (error: any) {
      setFaucetMessage(`❌ ${error.message || 'Request failed'}`);
    } finally {
      setFaucetLoading(false);
    }
  };

  // 獲取錢包地址（優先 Enoki，其次 Sui Wallet）
  const getWalletAddress = () => {
    if (user?.suiAddress) {
      return { address: user.suiAddress, type: 'Enoki zkLogin' };
    }
    if (currentAccount?.address) {
      return { address: currentAccount.address, type: 'Sui Wallet' };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/customer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            SuiTicket
          </Link>
          <Link
            href="/customer/dashboard"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'info', label: 'Basic Info' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'preferences', label: 'Preferences' },
              { id: 'orders', label: 'Order History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name || '用戶'}</h2>
                  <p className="text-gray-800">{user?.email || '未設置'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">姓名</label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">電子郵件</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                  儲存變更
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">錢包管理</h2>
              
              {/* 錢包地址卡片 */}
              {(() => {
                const walletInfo = getWalletAddress();
                if (!walletInfo) {
                  return (
                    <div className="p-4 border border-gray-200 rounded-xl text-center text-gray-700">
                      未連接錢包
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{walletInfo.type}</p>
                          <p className="text-sm text-gray-800 font-mono mt-1 break-all">
                            {walletInfo.address}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium whitespace-nowrap">
                          已連接
                        </span>
                      </div>
                      
                      {/* 餘額顯示 */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">餘額</span>
                          {balanceLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatSuiBalance(balance)} SUI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Faucet 按鈕（僅 Devnet） */}
                    {walletInfo.type === 'Enoki zkLogin' && (
                      <div className="space-y-3">
                        <button
                          onClick={handleFaucet}
                          disabled={faucetLoading}
                          className="w-full py-3 px-4 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {faucetLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700"></div>
                              <span>請求中...</span>
                            </>
                          ) : (
                            <>
                              <span>💧</span>
                              <span>獲取 Devnet 測試幣</span>
                            </>
                          )}
                        </button>
                        {faucetMessage && (
                          <div className={`p-3 rounded-lg text-sm ${
                            faucetMessage.includes('✅') 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {faucetMessage}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 充值說明 */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <h3 className="font-semibold text-blue-900 mb-2">如何充值 SUI？</h3>
                      <div className="text-sm text-blue-800 space-y-2">
                        {walletInfo.type === 'Enoki zkLogin' ? (
                          <>
                            <p><strong>測試網（Devnet）：</strong></p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                              <li>點擊上方「獲取 Devnet 測試幣」按鈕</li>
                              <li>等待 10-30 秒，測試幣會自動到帳</li>
                              <li>刷新頁面查看餘額</li>
                            </ol>
                            <p className="mt-3"><strong>主網（Mainnet）：</strong></p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                              <li>在交易所（如 OKX、Binance）購買 SUI</li>
                              <li>提現到您的錢包地址（複製上方地址）</li>
                              <li>等待確認後即可使用</li>
                            </ol>
                          </>
                        ) : (
                          <>
                            <p>使用 Sui Wallet 擴展時，您可以：</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                              <li>在交易所購買 SUI 後提現到錢包</li>
                              <li>或使用其他錢包轉帳到此地址</li>
                            </ol>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 使用說明 */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <h3 className="font-semibold text-amber-900 mb-2">如何使用錢包購買票券？</h3>
                      <div className="text-sm text-amber-800 space-y-1">
                        <p>• 確保錢包中有足夠的 SUI 餘額</p>
                        <p>• 在活動頁面選擇票券並點擊「購買」</p>
                        <p>• 確認交易後，系統會使用 Enoki 自動簽名（無需手動操作）</p>
                        <p>• 如果啟用了 Gas Sponsor，Gas 費用將由平台支付</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">偏好設定</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">通知</p>
                    <p className="text-sm text-gray-700">接收活動提醒和訂單通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">語言</p>
                    <p className="text-sm text-gray-800">選擇介面語言</p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option>繁體中文</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">主題</p>
                    <p className="text-sm text-gray-800">選擇介面主題</p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option>淺色</option>
                    <option>深色</option>
                    <option>自動</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">訂單歷史</h2>
              <div className="text-center py-12 text-gray-700">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>尚無訂單記錄</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

