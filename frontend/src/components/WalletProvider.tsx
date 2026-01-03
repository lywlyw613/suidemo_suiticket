'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { useState, useEffect } from 'react';

// 配置 devnet
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Always provide the providers, even during SSR
  // This ensures hooks can be called during SSR without errors
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <DappKitWalletProvider
          autoConnect={false}
          preferredWallets={['Slush', 'Sui Wallet', 'Suiet']}
        >
          {children}
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

