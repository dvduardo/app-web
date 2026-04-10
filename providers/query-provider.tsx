"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactNode, useState, useEffect } from "react";

const CACHE_KEY = "colecao-virtual-query-cache";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 horas

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Mantém dados em cache mesmo quando offline
        gcTime: CACHE_MAX_AGE,
        // Não lança erro se estiver offline — usa cache
        retryOnMount: true,
        retry: (failureCount, error: unknown) => {
          const isOffline =
            typeof window !== "undefined" && !window.navigator.onLine;
          if (isOffline) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        // Mutações falhas ficam na fila para retry quando voltar online
        retry: (failureCount, error: unknown) => {
          const isOffline =
            typeof window !== "undefined" && !window.navigator.onLine;
          if (isOffline) return false;
          return failureCount < 1;
        },
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const [persister, setPersister] = useState<ReturnType<
    typeof createSyncStoragePersister
  > | null>(null);

  useEffect(() => {
    // localStorage só existe no browser — criamos o persister no client
    const p = createSyncStoragePersister({
      storage: window.localStorage,
      key: CACHE_KEY,
      throttleTime: 1000,
    });
    setPersister(p);
  }, []);

  // Antes do persister estar pronto, renderiza sem persistência
  // (evita hydration mismatch no SSR)
  if (!persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: createSyncStoragePersister({ storage: typeof window !== "undefined" ? window.localStorage : undefined, key: CACHE_KEY }) }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        // Não persiste queries de auth para evitar dados sensíveis em cache
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            return key !== "me" && key !== "session" && query.state.status === "success";
          },
        },
      }}
      onSuccess={() => {
        // Cache restaurado do storage — invalida dados antigos ao voltar online
        window.addEventListener(
          "online",
          () => queryClient.invalidateQueries(),
          { once: false }
        );
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
