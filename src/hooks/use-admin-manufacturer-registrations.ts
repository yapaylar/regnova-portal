import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { adminKeys } from "@/lib/query-keys";

export type ManufacturerRegistrationListResponse = {
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

export type ManufacturerRegistrationFilters = {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useAdminManufacturerRegistrations(filters: ManufacturerRegistrationFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<ManufacturerRegistrationListResponse>({
    queryKey: [adminKeys.manufacturerRegistrations(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (typeof filters.page === "number") params.set("page", String(filters.page));
      if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/admin/manufacturers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load manufacturer registrations");
      }

      return response.json();
    },
    staleTime: 1000 * 30,
  });
}

export type ManufacturerOption = {
  id: string;
  name: string;
  slug: string;
};

export function useManufacturerOptions(search?: string) {
  const { fetchWithAuth } = useAuth();

  return useQuery<ManufacturerOption[]>({
    queryKey: [adminKeys.manufacturerOptions(), search ?? ""],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetchWithAuth(`/api/admin/manufacturers/options?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load manufacturers");
      }

      return response.json();
    },
    staleTime: 1000 * 30,
  });
}
