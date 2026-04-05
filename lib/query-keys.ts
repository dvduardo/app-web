export const queryKeys = {
  items: {
    all: () => ["items"] as const,
    list: (params: {
      page: number;
      limit: number;
      search: string;
      categoryId: string;
      status: string;
      favoritesOnly: boolean;
    }) =>
      ["items", "list", params] as const,
    detail: (id: string) => ["items", id] as const,
  },
  customFields: {
    all: () => ["custom-fields"] as const,
  },
  categories: {
    all: () => ["categories"] as const,
  },
} as const;
