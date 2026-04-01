'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, BookOpen, CheckCircle } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [showDashboardButton, setShowDashboardButton] = useState(!navigator.onLine);

  useEffect(() => {
    const initialOnlineStatus = navigator.onLine;
    setIsOnline(initialOnlineStatus);
    if (!initialOnlineStatus) {
      setShowDashboardButton(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      // Aguarda um pouco para mostrar feedback visual, depois redireciona
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowDashboardButton(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`p-4 rounded-full transition-colors ${
              isOnline ? 'bg-green-100' : 'bg-orange-100'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-12 h-12 text-green-600 animate-pulse" />
            ) : (
              <WifiOff className="w-12 h-12 text-orange-600" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          {isOnline ? '✨ Bem-vindo!' : '📴 Modo Offline'}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {isOnline
            ? 'Sua conexão foi restaurada! Sincronizando dados...'
            : 'Você está sem internet, mas o app continuará funcionando normalmente.'}
        </p>

        {/* Features quando offline */}
        {!isOnline && (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 mb-6 text-left">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Você ainda pode usar tudo:
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-lg">📚</span>Ver seus itens salvos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>Buscar na sua coleção
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">➕</span>Criar novos itens
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✏️</span>Editar itens
                </li>
              </ul>
              <p className="text-xs text-blue-700 mt-4 font-medium border-t border-blue-200 pt-4">
                🔄 Quando voltar online, tudo será sincronizado automaticamente!
              </p>
            </div>

            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              Abrir Minha Coleção
            </button>
          </>
        )}

        {/* Online indicator */}
        {isOnline && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
              Conectado!
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sincronizando dados...
            </div>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto flex justify-center">
        <div
          className={`px-4 py-2 rounded-full font-medium text-sm ${
            isOnline
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          } shadow-md`}
        >
          {isOnline
            ? '✓ Você está online'
            : '⚠️ Modo offline - seus dados estão salvos'}
        </div>
      </div>
    </div>
  );
}

