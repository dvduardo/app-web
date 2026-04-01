'use client';

import { ReactNode, useEffect } from 'react';

export function ClientProvider({ children }: { children: ReactNode }) {
  // Handle unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Log but don't throw - these are usually expected rejections from the app
      console.debug('Unhandled promise rejection:', event.reason);
      // Prevent default error handler from showing the error
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
