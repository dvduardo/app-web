// OFFLINE CACHE MANAGER
// Fallback quando Service Worker falha - usa localStorage + intercepção de fetch
// NOTA: Isso é um fallback. O primeir mecanismo deve ser o Service Worker registrado em use-offline-sync.ts

const OFFLINE_CACHE_KEY = 'app_offline_cache_v1';
const CACHE_WHITELIST = [
  '/dashboard',
  '/dashboard/new',
  '/auth/login',
  '/auth/register',
  '/offline.html',
  '/manifest.json',
];

// Registrar Service Worker como fallback
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js', { scope: '/' })
    .then(() => {
      console.log('[OfflineCacheManager] Service Worker fallback registrado');
    })
    .catch((err) => {
      console.warn('[OfflineCacheManager] SW não pôde ser registrado:', err);
    });
}

class OfflineCacheManager {
  constructor() {
    this.cache = this.loadCache();
    this.initNetwork();
    
    console.log('[OfflineCacheManager] ✅ Inicializado');
    console.log('[OfflineCacheManager] IndexedDB disponível:', !!window.indexedDB);
    console.log('[OfflineCacheManager] Service Worker disponível:', 'serviceWorker' in navigator);
  }

  loadCache() {
    try {
      const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      console.warn('[OfflineCacheManager] Erro ao carregar cache:', e);
      return {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(this.cache));
    } catch (e) {
      console.warn('[OfflineCacheManager] Erro ao salvar cache:', e);
      if (e.name === 'QuotaExceededError') {
        console.warn('[OfflineCacheManager] localStorage cheio');
      }
    }
  }

  initNetwork() {
    // Cache pages on successful navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const currentPath = window.location.pathname;
        
        if (CACHE_WHITELIST.some(path => currentPath.startsWith(path))) {
          this.cachePage(currentPath);
        }
      });

      // Monitor online/offline
      window.addEventListener('online', () => {
        console.log('[OfflineCacheManager] ✅ Voltou online!');
        window.dispatchEvent(new CustomEvent('offline-cache-online'));
      });

      window.addEventListener('offline', () => {
        console.log('[OfflineCacheManager] 📡 Modo offline');
        window.dispatchEvent(new CustomEvent('offline-cache-offline'));
      });
    }
  }

  cachePage(path, html = null) {
    if (!html) {
      // HTML will be cached on next page load via document serialization
      html = document.documentElement.outerHTML;
    }

    this.cache[path] = {
      html,
      timestamp: Date.now(),
      title: document.title,
      status: 'ok'
    };

    this.saveCache();
    console.log(`[OfflineCacheManager] 📦 Cached: ${path}`);
  }

  getPageIfOffline(path) {
    return this.cache[path];
  }

  clearAll() {
    localStorage.removeItem(OFFLINE_CACHE_KEY);
    this.cache = {};
    console.log('[OfflineCacheManager] 🗑️ Cache limpo');
  }

  getStats() {
    return {
      cacheSize: Object.keys(this.cache).length,
      pages: Object.keys(this.cache),
      totalSize: JSON.stringify(this.cache).length,
    };
  }
}

// Initialize globally
if (typeof window !== 'undefined') {
  window.offlineCacheManager = new OfflineCacheManager();
  window.logOfflineCacheStats = () => {
    const stats = window.offlineCacheManager.getStats();
    console.table(stats);
    return stats;
  };
}

export { OfflineCacheManager };
