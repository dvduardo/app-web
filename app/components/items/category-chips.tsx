"use client";

import { getCategoryTheme } from "@/lib/category-theme";

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface Props {
  categories: Category[];
  effectiveCategoryId: string;
  onCategoryChange: (id: string) => void;
  className?: string;
}

export function CategoryChips({
  categories,
  effectiveCategoryId,
  onCategoryChange,
  className = "",
}: Props) {
  return (
    <div className={`flex snap-x gap-2 overflow-x-auto pb-1 mobile-scrollbar ${className}`}>
      <button
        type="button"
        data-active={effectiveCategoryId === ""}
        onClick={() => onCategoryChange("")}
        className="vault-app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
      >
        Todas
      </button>

      {categories.map((category) => {
        const theme = getCategoryTheme(category.name);
        const isActive = effectiveCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            data-active={isActive}
            onClick={() => onCategoryChange(category.id)}
            className={`vault-app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? theme.chip : ""
            }`}
          >
            {category.name} ({category.itemCount})
          </button>
        );
      })}
    </div>
  );
}
