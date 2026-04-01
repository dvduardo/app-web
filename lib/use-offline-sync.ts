'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const DB_NAME = 'colecao-db';
const STORE_NAMES = {
  items: 'items',
  photos: 'photos',
  customFields: 'customFields',
  syncQueue: 'syncQueue'
};

// Abrir IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Criar object stores se não existirem
      Object.values(STORE_NAMES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
}

// Salvar dados no IndexedDB
async function saveOfflineData(storeName: keyof typeof STORE_NAMES, data: any[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAMES[storeName]], 'readwrite');
  const store = transaction.objectStore(STORE_NAMES[storeName]);
  
  // Limpar store
  await new Promise((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onerror = () => reject(clearReq.error);
    clearReq.onsuccess = () => resolve(undefined);
  });
  
  // Inserir novos dados
  for (const item of data) {
    await new Promise((resolve, reject) => {
      const addReq = store.add(item);
      addReq.onerror = () => reject(addReq.error);
      addReq.onsuccess = () => resolve(undefined);
    });
  }
}

// Carregar dados do IndexedDB
async function loadOfflineData(storeName: keyof typeof STORE_NAMES): Promise<any[]> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAMES[storeName]], 'readonly');
  const store = transaction.objectStore(STORE_NAMES[storeName]);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export interface OfflineItem {
  id: string;
  title: string;
  description: string | null;
  customData: string;
  photos: Array<{
    id: string;
    data: string;
    mimeType: string;
  }>;
  createdAt: string;
  updatedAt: string;
  _synced?: boolean; // true = sincronizado com servidor
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [items, setItems] = useState<OfflineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncWithServer(); // Sincronizar quando volta online
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Definir estado inicial
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar dados do servidor ou cache local
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Tentar buscar do servidor primeiro
      const response = await axios.get('/api/items', { timeout: 3000 });
      const serverItems = response.data.items || [];
      
      // Salvar no cache
      await saveOfflineData('items', serverItems);
      setItems(serverItems);
    } catch (error) {
      // Se falhar, carregar do cache
      console.log('[Offline] Carregando do cache local');
      const cachedItems = await loadOfflineData('items');
      setItems(cachedItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar com servidor
  const syncWithServer = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      // Buscar dados atualizados
      const response = await axios.get('/api/items', { timeout: 3000 });
      const serverItems = response.data.items || [];
      
      // Atualizar cache
      await saveOfflineData('items', serverItems);
      setItems(serverItems);
      
      console.log('[Sync] Dados sincronizados com sucesso');
    } catch (error) {
      console.log('[Sync] Falha ao sincronizar');
    }
  }, [isOnline]);

  return {
    items,
    isLoading,
    isOnline,
    fetchItems,
    syncWithServer,
    setItems
  };
}
