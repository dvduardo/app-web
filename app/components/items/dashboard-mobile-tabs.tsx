"use client";

import { Layers, Heart, Clock3 } from "lucide-react";
import type { DashboardTab } from "@/hooks/use-dashboard-filters";

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const TABS: { id: DashboardTab; label: string; Icon: React.ElementType }[] = [
  { id: "all", label: "Coleção", Icon: Layers },
  { id: "favorites", label: "Favoritos", Icon: Heart },
  { id: "wishlist", label: "Desejos", Icon: Clock3 },
];

export function DashboardMobileTabs({ activeTab, onTabChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Contexto do dashboard"
      className="vault-app-panel flex rounded-2xl p-1 lg:hidden"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onTabChange(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-500/20 text-indigo-200 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
