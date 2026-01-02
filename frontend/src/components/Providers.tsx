'use client';

import { EnokiProvider } from './EnokiProvider';
import { WalletProvider } from './WalletProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <EnokiProvider>
        {children}
      </EnokiProvider>
    </WalletProvider>
  );
}

