import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { manufacturerKeys } from "@/lib/query-keys";

type ManufacturerReportsOptions = {
  search?: string;
  status?: string;
  reportType?: string;
  page?: number;
  pageSize?: number;
};

type ManufacturerReport = {
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
  } | null;
  facility: {
    id: string;
    name: string;
  } | null;
};

type ManufacturerReportsResponse = {
  items: ManufacturerReport[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export function useManufacturerReports(options: ManufacturerReportsOptions = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<ManufacturerReportsResponse>({
    queryKey: [manufacturerKeys.reports(), options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search) params.set("search", options.search);
      if (options.status) params.set("status", options.status);
      if (options.reportType) params.set("reportType", options.reportType);
      if (options.page) params.set("page", String(options.page));
      if (options.pageSize) params.set("pageSize", String(options.pageSize));

      const response = await fetchWithAuth(`/api/manufacturer/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load manufacturer reports");
      }
      return response.json();
    },
    staleTime: 1000 * 30,
  });
}

