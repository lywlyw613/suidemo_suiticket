'use client';

import { EnokiFlowProvider } from '@mysten/enoki/react';

export function EnokiProvider({ children }: { children: React.ReactNode }) {
  // 已升級到 @mysten/enoki@0.13.0
  // 注意：EnokiFlowProvider 不支持直接傳遞 network
  // network 參數需要在調用 createAuthorizationURL 時傳遞
  return (
    <EnokiFlowProvider
      apiKey={process.env.NEXT_PUBLIC_ENOKI_API_KEY || ''}
    >
      {children}
    </EnokiFlowProvider>
  );
}

