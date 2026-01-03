'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentAccount, useWallets } from '@mysten/dapp-kit';

export default function AdminLoginPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const [mounted, setMounted] = useState(false);
  const [adminAddress, setAdminAddress] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    // Check if admin address is stored
    const stored = localStorage.getItem('admin_address');
    if (stored) {
      setAdminAddress(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if already logged in as admin
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    // Only redirect if already logged in and not already on dashboard to avoid infinite loop
    if (isAdmin && userRole === 'admin' && window.location.pathname !== '/admin/dashboard') {
      router.push('/admin/dashboard');
    }
  }, [mounted, router]);

  const handleWalletConnect = async () => {
    // For demo: directly set as admin after wallet connection
    // In production, this would check wallet address against admin whitelist
    if (currentAccount?.address) {
      const address = currentAccount.address;
      const isAdmin = !adminAddress || address === adminAddress || address.toLowerCase() === adminAddress.toLowerCase();
      
      if (isAdmin) {
        localStorage.setItem('is_admin', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('admin_wallet', address);
        router.push('/admin/dashboard');
      } else {
        alert('This wallet is not authorized as admin');
      }
    } else {
      // If no wallet connected, show message to connect first
      alert('Please connect your wallet first');
    }
  };

  const handleSetAdminAddress = () => {
    if (adminAddress) {
      localStorage.setItem('admin_address', adminAddress);
      alert('Admin address set successfully');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Platform Operator Access</p>
        </div>

        <div className="space-y-6">
          {/* Wallet Connection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect Sui Wallet</h2>
            {currentAccount ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 mb-2">Connected: {currentAccount.address.slice(0, 10)}...{currentAccount.address.slice(-8)}</p>
                <button
                  onClick={() => {
                    localStorage.setItem('is_admin', 'true');
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('admin_wallet', currentAccount.address);
                    router.push('/admin/dashboard');
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                  Login as Admin
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletConnect}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Admin Address Setup (for demo) */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Set Admin Address (Demo)</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={adminAddress}
                onChange={(e) => setAdminAddress(e.target.value)}
                placeholder="Enter admin wallet address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSetAdminAddress}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Set Admin Address
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave empty to allow any wallet as admin (demo mode)
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/"
              className="block text-center text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

