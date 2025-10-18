import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { adminKeys } from "@/lib/query-keys";

export type FacilityRegistrationListResponse = {
  data: Array<{
    id: string;
    status: string;
    metadata: unknown;
    submittedAt: string;
    reviewedAt: string | null;
    organization: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
    reviewer: {
      id: string;
      email: string;
    } | null;
  }>;
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

export type FacilityRegistrationFilters = {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useAdminFacilityRegistrations(filters: FacilityRegistrationFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<FacilityRegistrationListResponse>({
    queryKey: [adminKeys.facilityRegistrations(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (typeof filters.page === "number") params.set("page", String(filters.page));
      if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/admin/facilities?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load facility registrations");
      }

      return response.json();
    },
    staleTime: 1000 * 30,
  });
}

export type FacilityOption = {
  id: string;
  name: string;
  slug: string;
  region: string | null;
};

export function useFacilityOptions(search?: string) {
  const { fetchWithAuth } = useAuth();

  return useQuery<FacilityOption[]>({
    queryKey: [adminKeys.facilityOptions(), search ?? ""],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetchWithAuth(`/api/admin/facilities/options?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load facilities");
      }

      return response.json();
    },
    staleTime: 1000 * 30,
  });
}
