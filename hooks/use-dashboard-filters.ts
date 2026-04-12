"use client";

import { useDeferredValue, useState } from "react";
import { useCategories } from "./use-categories";

export type ViewMode = "grid" | "list";
export type DashboardTab = "all" | "favorites" | "wishlist";

export interface DashboardFilters {
  // State
  search: string;
  deferredSearch: string;
  page: number;
  viewMode: ViewMode;
  selectedCategoryId: string;
  selectedStatus: string;
  favoritesOnly: boolean;
  // Derived
  effectiveCategoryId: string;
  activeTab: DashboardTab;
  // Actions
  setPage: (page: number) => void;
  setViewMode: (mode: ViewMode) => void;
  handleSearchChange: (value: string) => void;
  handleCategoryChange: (categoryId: string) => void;
  handleStatusChange: (status: string) => void;
  toggleFavoritesOnly: () => void;
  toggleWishlist: () => void;
  activateTab: (tab: DashboardTab) => void;
}

export function useDashboardFilters(): DashboardFilters {
  const [search, setSearch] = useState("");
  const [page, setPageState] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const deferredSearch = useDeferredValue(search);
  const { categories } = useCategories();

  // Only use the selected category if it still has items — avoids ghost filters
  // when a category becomes empty after item deletion.
  const effectiveCategoryId =
    categories.some((c) => c.id === selectedCategoryId && c.itemCount > 0)
      ? selectedCategoryId
      : "";

  // activeTab is fully derived from the filter state — never a separate useState.
  // This guarantees bottom nav, mobile tabs, and sidebar are always in sync.
  const activeTab: DashboardTab = favoritesOnly
    ? "favorites"
    : selectedStatus === "wishlist"
      ? "wishlist"
      : "all";

  const setPage = (p: number) => setPageState(p);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageState(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setPageState(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPageState(1);
  };

  const toggleFavoritesOnly = () => {
    setFavoritesOnly((prev) => !prev);
    setPageState(1);
  };

  const toggleWishlist = () => {
    setSelectedStatus((prev) => (prev === "wishlist" ? "" : "wishlist"));
    setPageState(1);
  };

  // Used by mobile tabs — sets both favoritesOnly and selectedStatus atomically
  // so neither state lags behind the other.
  const activateTab = (tab: DashboardTab) => {
    if (tab === "favorites") {
      setFavoritesOnly(true);
      setSelectedStatus("");
    } else if (tab === "wishlist") {
      setFavoritesOnly(false);
      setSelectedStatus("wishlist");
    } else {
      setFavoritesOnly(false);
      setSelectedStatus("");
    }
    setPageState(1);
  };

  return {
    search,
    deferredSearch,
    page,
    viewMode,
    selectedCategoryId,
    selectedStatus,
    favoritesOnly,
    effectiveCategoryId,
    activeTab,
    setPage,
    setViewMode,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    toggleFavoritesOnly,
    toggleWishlist,
    activateTab,
  };
}
