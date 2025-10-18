import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { manufacturerKeys } from "@/lib/query-keys";
import type { ManufacturerProductListItem } from "@/lib/manufacturer/data-access";

type ManufacturerProductFilters = {
  search?: string;
  page?: number;
  pageSize?: number;
};

type ManufacturerProductResponse = {
  data: ManufacturerProductListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

export function useManufacturerProducts(filters: ManufacturerProductFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<ManufacturerProductResponse>({
    queryKey: [manufacturerKeys.products(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/manufacturer/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load manufacturer products");
      }
      return response.json();
    },
    staleTime: 1000 * 60,
  });
}

