"use client";

import { Layers, Heart, Clock3 } from "lucide-react";
import type { ItemCollectionStats } from "@/hooks/use-items";

interface Props {
  stats: ItemCollectionStats;
}

export function DashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Total */}
      <div className="vault-app-subpanel rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">
            Total
          </p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-white">
          {stats.totalItems}
        </p>
      </div>

      {/* Favoritos */}
      <div className="vault-app-subpanel rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Heart className="h-3.5 w-3.5 shrink-0 text-rose-400" aria-hidden="true" />
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">
            {/* "Favs" on very small screens, full label on sm+ */}
            <span className="sm:hidden">Favs</span>
            <span className="hidden sm:inline">Favoritos</span>
          </p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-rose-400">
          {stats.favoriteItems}
        </p>
      </div>

      {/* Desejos */}
      <div className="vault-app-subpanel rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">
            Desejos
          </p>
        </div>
        <p className="mt-2 text-2xl font-semibold text-amber-400">
          {stats.wishlistItems}
        </p>
      </div>
    </div>
  );
}
