"use client";

import { Heart, Clock3, Layers, CheckCircle2, ArrowUpDown } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-theme";
import { itemStatusOptions } from "@/lib/item-status";
import { CategoryChips } from "./category-chips";

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface Props {
  categories: Category[];
  effectiveCategoryId: string;
  selectedStatus: string;
  favoritesOnly: boolean;
  onCategoryChange: (id: string) => void;
  onStatusChange: (status: string) => void;
  onToggleFavorites: () => void;
  onToggleWishlist: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </p>
  );
}

function SidebarButton({
  isActive,
  onClick,
  children,
  activeClassName = "bg-indigo-500/16 text-indigo-200",
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? activeClassName
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export function DashboardSidebar({
  categories,
  effectiveCategoryId,
  selectedStatus,
  favoritesOnly,
  onCategoryChange,
  onStatusChange,
  onToggleFavorites,
  onToggleWishlist,
}: Props) {
  const wishlistActive = selectedStatus === "wishlist";

  return (
    /*
     * The sidebar uses `self-start` so it doesn't stretch to the full
     * flex-container height. `sticky top-20` works here because
     * `.vault-app-shell` has `overflow: hidden` which clips decorative
     * elements but does NOT create a scroll container — the viewport
     * remains the scroll root, so sticky positioning is relative to it.
     */
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="vault-app-panel sticky top-20 self-start rounded-2xl p-3 space-y-5">

        {/* Categories */}
        <section>
          <SectionLabel>Categorias</SectionLabel>
          <div className="space-y-0.5">
            <SidebarButton
              isActive={effectiveCategoryId === ""}
              onClick={() => onCategoryChange("")}
            >
              <Layers className="h-4 w-4 shrink-0" />
              Todas
            </SidebarButton>

            {categories.map((category) => {
              const theme = getCategoryTheme(category.name);
              const isActive = effectiveCategoryId === category.id;
              return (
                <SidebarButton
                  key={category.id}
                  isActive={isActive}
                  onClick={() => onCategoryChange(category.id)}
                  activeClassName={`${theme.chip}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-current opacity-70"
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="text-xs opacity-50">{category.itemCount}</span>
                </SidebarButton>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-white/[0.06]" />

        {/* Status */}
        <section>
          <SectionLabel>Status</SectionLabel>
          <div className="space-y-0.5">
            <SidebarButton
              isActive={selectedStatus === "" && !favoritesOnly}
              onClick={() => onStatusChange("")}
            >
              <ArrowUpDown className="h-4 w-4 shrink-0" />
              Todos
            </SidebarButton>

            {itemStatusOptions.map((option) => (
              <SidebarButton
                key={option.value}
                isActive={selectedStatus === option.value}
                onClick={() => onStatusChange(option.value)}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {option.label}
              </SidebarButton>
            ))}
          </div>
        </section>

        <div className="h-px bg-white/[0.06]" />

        {/* Quick access */}
        <section>
          <SectionLabel>Acesso rápido</SectionLabel>
          <div className="space-y-0.5">
            <SidebarButton
              isActive={favoritesOnly}
              onClick={onToggleFavorites}
              activeClassName="bg-rose-500/12 text-rose-300"
            >
              <Heart
                className={`h-4 w-4 shrink-0 transition ${favoritesOnly ? "fill-rose-400 text-rose-400" : ""}`}
              />
              Favoritos
            </SidebarButton>

            <SidebarButton
              isActive={wishlistActive}
              onClick={onToggleWishlist}
              activeClassName="bg-amber-500/12 text-amber-300"
            >
              <Clock3 className="h-4 w-4 shrink-0" />
              Desejos
            </SidebarButton>
          </div>
        </section>
      </div>
    </aside>
  );
}
