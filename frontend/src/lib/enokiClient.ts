import { useEnokiFlow } from '@mysten/enoki/react';
import { enokiConfig } from './enoki';

// 注意：這個函數需要在 React 組件中使用，因為需要使用 useEnokiFlow hook
// 初始化 zkLogin（Google）
export function useInitZkLoginGoogle() {
  const enokiFlow = useEnokiFlow();
  
  return async (): Promise<string | null> => {
    try {
      // 嘗試從環境變數獲取，如果沒有則讓 Enoki 使用 Dashboard 配置的
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!googleClientId) {
        console.warn('Google Client ID 未在環境變數中配置，將使用 Enoki Dashboard 配置');
      }

      const url = await enokiFlow.createAuthorizationURL({
        provider: 'google',
        clientId: googleClientId || '', // 如果為空，Enoki 會使用 Dashboard 配置的
        redirectUrl: `${window.location.origin}/login/callback`,
      });
      
      return url;
    } catch (error: any) {
      console.error('Failed to create zkLogin URL:', error);
      // 如果錯誤是因為 clientId，嘗試不提供 clientId
      if (error.message?.includes('clientId') || error.message?.includes('client')) {
        try {
          const url = await enokiFlow.createAuthorizationURL({
            provider: 'google',
            redirectUrl: `${window.location.origin}/login/callback`,
          });
          return url;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          return null;
        }
      }
      return null;
    }
  };
}

// 這些函數已經通過 React hooks 提供，不需要單獨導出

// 獲取 Gas Sponsor 配置
export function getGasSponsorConfig() {
  return {
    gasStationId: enokiConfig.gasStationId || enokiConfig.appSlug,
  };
}

