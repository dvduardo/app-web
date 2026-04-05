const CATEGORY_THEMES = [
  {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    chip: "data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500",
  },
  {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    chip: "data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500",
  },
  {
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    chip: "data-[active=true]:bg-sky-500 data-[active=true]:text-white data-[active=true]:border-sky-500",
  },
  {
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    chip: "data-[active=true]:bg-rose-500 data-[active=true]:text-white data-[active=true]:border-rose-500",
  },
  {
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    chip: "data-[active=true]:bg-indigo-500 data-[active=true]:text-white data-[active=true]:border-indigo-500",
  },
];

function hashCategoryName(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function getCategoryTheme(categoryName: string | null | undefined) {
  if (!categoryName) {
    return {
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      chip: "data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:border-gray-900",
    };
  }

  return CATEGORY_THEMES[hashCategoryName(categoryName) % CATEGORY_THEMES.length];
}
