import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

      const response = await fetchWithAuth(`/api/admin/registrations/manufacturers?${params.toString()}`);
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

export function useApproveManufacturerRegistration() {
  const { fetchWithAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, notes }: { registrationId: string; notes?: string }) => {
      const response = await fetchWithAuth(`/api/admin/registrations/manufacturers/${registrationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve registration");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.manufacturerRegistrations() });
    },
  });
}

export function useRejectManufacturerRegistration() {
  const { fetchWithAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, notes }: { registrationId: string; notes?: string }) => {
      const response = await fetchWithAuth(`/api/admin/registrations/manufacturers/${registrationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject registration");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.manufacturerRegistrations() });
    },
  });
}
