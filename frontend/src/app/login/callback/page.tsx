'use client';

// Force dynamic rendering - this page uses client-only hooks
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEnokiFlow, useZkLoginSession } from '@mysten/enoki/react';
import { useZkLoginFrontend } from '@/lib/frontendAuth';

export default function LoginCallbackPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Hooks must be called unconditionally, but we check mounted before using them
  const enokiFlow = useEnokiFlow();
  const session = useZkLoginSession();
  const zkLoginFrontend = useZkLoginFrontend();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing login...');
  const hasProcessed = useRef(false); // 防止重複執行

  useEffect(() => {
    setMounted(true);
  }, []);

  // 第一步：處理 OAuth 回調
  useEffect(() => {
    if (!mounted || !enokiFlow || hasProcessed.current) return;
    
    const handleCallback = async () => {
      // 檢查是否有 hash（OAuth 回調）
      if (typeof window !== 'undefined' && window.location.hash && enokiFlow) {
        try {
          console.log('Processing OAuth callback...');
          await enokiFlow.handleAuthCallback(window.location.hash);
          console.log('OAuth callback processed, waiting for session initialization...');
          // 給 Enoki 一些時間來初始化 session
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.error('Failed to handle auth callback:', error);
          
          // 檢查是否是速率限制錯誤
          if (error?.message?.includes('429') || error?.message?.includes('Rate limit')) {
            hasProcessed.current = false;
            setStatus('error');
            setMessage('Enoki API rate limit exceeded, please wait 10-15 minutes and try again');
            return;
          }
          
          // 如果是其他錯誤，可能已經處理過了，繼續等待 session
        }
      }
    };

    handleCallback();
  }, [mounted, enokiFlow]);

  // 第二步：當 session 有 JWT 時，處理登入
  useEffect(() => {
    if (!mounted || hasProcessed.current) return;
    
    // 類型守衛：確保 session 和 jwt 都存在
    const jwt = session?.jwt;
    if (!jwt) return;

           const processLogin = async () => {
             hasProcessed.current = true; // 標記為已處理

             try {
               console.log('Session initialized, starting login process...');

               // 從 sessionStorage 獲取角色
               const role = (sessionStorage.getItem('pendingLoginRole') || 'customer') as 'customer' | 'organizer' | 'verifier';
               sessionStorage.removeItem('pendingLoginRole');

               // 使用純前端登入（無需後端）
               const user = await zkLoginFrontend.login(role);

               if (user) {
                 setStatus('success');
                 setMessage('Login successful! Redirecting...');

                 // 清除 URL hash
                 if (typeof window !== 'undefined') {
                   window.history.replaceState(null, '', window.location.pathname);
                 }

                 // 根據角色跳轉
                 const redirectPath = role === 'organizer' ? '/organizer/dashboard' 
                   : role === 'verifier' ? '/verifier/dashboard' 
                   : '/customer/dashboard';
                 
                 setTimeout(() => {
                   router.replace(redirectPath);
                 }, 1500);
               } else {
                 hasProcessed.current = false; // 允許重試
                 throw new Error('Failed to create user session');
               }
             } catch (error: any) {
               console.error('Login error:', error);
               hasProcessed.current = false; // 允許重試
               setStatus('error');
               
               // 提供更友好的錯誤訊息
               let errorMessage = error.message || 'Login failed, please try again';
               if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
                 errorMessage = 'Rate limit exceeded, please wait 10-15 minutes and try again';
               }
               
               setMessage(errorMessage);
             }
           };

           processLogin();
         }, [mounted, session, router]);

  // 第三步：超時檢查 - 如果等待太久還沒有 session，顯示錯誤
  useEffect(() => {
    if (!mounted || hasProcessed.current) return;
    if (session?.jwt) return; // 如果已經有 JWT，不需要超時檢查

    const timeout = setTimeout(() => {
        if (!hasProcessed.current && !session?.jwt) {
          console.error('Session initialization timeout');
          setStatus('error');
          setMessage('zkLogin session initialization timeout, please login again');
        }
           }, 15000); // 15 秒超時

           return () => clearTimeout(timeout);
         }, [mounted, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-700">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-gray-700">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-red-700 mb-4">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  hasProcessed.current = false; // 重置標記
                  setStatus('loading');
                  setMessage('Processing login...');
                  // 觸發重新處理
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                      Retry
                    </button>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Back to Login
                    </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

