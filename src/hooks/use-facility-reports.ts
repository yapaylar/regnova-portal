import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { facilityKeys } from "@/lib/query-keys";

export type FacilityReportListItem = {
  id: string;
  trackingId: string;
  reportType: string;
  status: string;
  summary: string | null;
  createdAt: string;
  submittedAt: string | null;
  occurredAt: string | null;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    manufacturer: {
      id: string;
      name: string;
    } | null;
  } | null;
};

export type FacilityReportListResponse = {
  data: FacilityReportListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

export type FacilityReportFilters = {
  search?: string;
  status?: string;
  reportType?: string;
  page?: number;
  pageSize?: number;
};

export function useFacilityReports(filters: FacilityReportFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<FacilityReportListResponse>({
    queryKey: [facilityKeys.complaints(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.reportType) params.set("reportType", filters.reportType);
      if (typeof filters.page === "number") params.set("page", String(filters.page));
      if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/facility/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load facility reports");
      }

      return response.json();
    },
    staleTime: 1000 * 30,
  });
}

export type CreateReportData = {
  deviceId: string;
  reportType: "COMPLAINT" | "ADVERSE_EVENT";
  summary: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dateOccurred?: string;
};

export function useCreateFacilityReport() {
  const { fetchWithAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReportData) => {
      const response = await fetchWithAuth("/api/facility/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [facilityKeys.complaints()] });
    },
  });
}

