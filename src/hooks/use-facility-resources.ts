import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { facilityKeys } from "@/lib/query-keys";

export type FacilityResourceListItem = {
  id: string;
  title: string;
  type: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  version: string | null;
  uploadedAt: string;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    manufacturer: {
      id: string;
      name: string;
    };
  } | null;
};

export type FacilityResourceListResponse = {
  data: FacilityResourceListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

export type FacilityResourceFilters = {
  search?: string;
  type?: string;
  page?: number;
  pageSize?: number;
};

export function useFacilityResources(filters: FacilityResourceFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<FacilityResourceListResponse>({
    queryKey: [facilityKeys.resources(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      if (typeof filters.page === "number") params.set("page", String(filters.page));
      if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/facility/resources?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load facility resources");
      }

      return response.json();
    },
    staleTime: 1000 * 60,
  });
}

