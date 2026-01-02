// Enoki 配置和工具函數

export const enokiConfig = {
  apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY || '',
  appSlug: process.env.NEXT_PUBLIC_ENOKI_APP_SLUG || 'demoday-86b22d0b',
  gasStationId: process.env.NEXT_PUBLIC_ENOKI_GAS_STATION_ID || '',
};

// 檢查 Enoki 配置是否完整
export function isEnokiConfigured(): boolean {
  return !!(enokiConfig.apiKey && enokiConfig.appSlug);
}

// Enoki API 基礎 URL
export const ENOKI_API_URL = 'https://api.enoki.mystenlabs.com';

