'use client';

import { useEffect, useState } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      // Simula sincronização por 2 segundos
      setTimeout(() => {
        setIsSyncing(false);
        setLastSync(new Date());
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    // Listen para mensagens do service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        setIsSyncing(false);
        setLastSync(new Date());
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  const statusConfig = isOnline
    ? isSyncing
      ? {
          icon: <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-blue-700 rounded-full animate-spin" />,
          label: 'Sincronizando...',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
        }
      : {
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: 'Online',
          bg: 'bg-green-100',
          text: 'text-green-700',
        }
    : {
        icon: <WifiOff className="w-3.5 h-3.5" />,
        label: 'Offline',
        bg: 'bg-orange-100',
        text: 'text-orange-700',
      };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusConfig.bg} ${statusConfig.text}`}
      title={lastSync ? `Última sincronização: ${lastSync.toLocaleTimeString('pt-BR')}` : undefined}
    >
      {statusConfig.icon}
      <span>{statusConfig.label}</span>
    </div>
  );
}
