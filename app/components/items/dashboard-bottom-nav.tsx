"use client";

import { Heart, Plus, Clock3 } from "lucide-react";
import Link from "next/link";

interface Props {
  favoritesOnly: boolean;
  selectedStatus: string;
  onToggleFavorites: () => void;
  onToggleWishlist: () => void;
}

export function DashboardBottomNav({
  favoritesOnly,
  selectedStatus,
  onToggleFavorites,
  onToggleWishlist,
}: Props) {
  const wishlistActive = selectedStatus === "wishlist";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0d1f]/82 px-4 py-3 shadow-[0_-18px_50px_-30px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onToggleFavorites}
          aria-pressed={favoritesOnly}
          className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
            favoritesOnly ? "bg-rose-500 text-white" : "bg-white/6 text-white"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition ${favoritesOnly ? "fill-white text-white" : ""}`}
          />
          Favoritos
        </button>

        <Link
          href="/dashboard/new"
          className="vault-button-primary inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Novo item
        </Link>

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-pressed={wishlistActive}
          className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
            wishlistActive ? "bg-amber-400 text-slate-950" : "bg-white/6 text-white"
          }`}
        >
          <Clock3 className="h-4 w-4" />
          Desejos
        </button>
      </div>
    </div>
  );
}
