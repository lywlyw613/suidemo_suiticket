'use client';

import { EnokiFlowProvider } from '@mysten/enoki/react';
import { useEffect, useState } from 'react';

export function EnokiProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <EnokiFlowProvider
      apiKey={process.env.NEXT_PUBLIC_ENOKI_API_KEY || ''}
    >
      {children}
    </EnokiFlowProvider>
  );
}

