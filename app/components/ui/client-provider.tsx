'use client';

import { ReactNode, useEffect } from 'react';
import { QueryProvider } from '@/providers/query-provider';

export function ClientProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.debug('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <QueryProvider>{children}</QueryProvider>;
}
