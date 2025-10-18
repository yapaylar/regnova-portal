import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { facilityKeys } from "@/lib/query-keys";

export type FacilityRecallListItem = {
  id: string;
  title: string;
  reference: string;
  status: string;
  actionType: string;
  region: string;
  description: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  createdAt: string;
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

export type FacilityRecallListResponse = {
  data: FacilityRecallListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

export type FacilityRecallFilters = {
  search?: string;
  status?: string;
  actionType?: string;
  page?: number;
  pageSize?: number;
};

export function useFacilityRecalls(filters: FacilityRecallFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<FacilityRecallListResponse>({
    queryKey: [facilityKeys.recalls(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.actionType) params.set("actionType", filters.actionType);
      if (typeof filters.page === "number") params.set("page", String(filters.page));
      if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/facility/recalls?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load recalls");
      }

      return response.json();
    },
    staleTime: 1000 * 60,
  });
}

