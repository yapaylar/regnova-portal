import { useQuery } from "@tanstack/react-query";

import { adminKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/auth-context";

type AdminReportResponse = {
  items: Array<{
    id: string;
    trackingId: string;
    reportType: string;
    status: string;
    summary: string | null;
    occurredAt: string | null;
    createdAt: string;
    submittedAt: string | null;
    resolvedAt: string | null;
    submitter: {
      id: string;
      email: string;
      name: string | null;
    } | null;
    facility: {
      id: string;
      name: string;
      slug: string;
    } | null;
    manufacturer: {
      id: string;
      name: string;
      slug: string;
    } | null;
    device: {
      id: string;
      name: string;
      modelNumber: string | null;
    } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type UseAdminReportsOptions = {
  search?: string;
  status?: string;
  reportType?: string;
  page?: number;
  pageSize?: number;
};

export function useAdminReports(options: UseAdminReportsOptions = {}) {
  const params = new URLSearchParams();
  const { fetchWithAuth } = useAuth();

  if (options.search) params.set("search", options.search);
  if (options.status) params.set("status", options.status);
  if (options.reportType) params.set("reportType", options.reportType);
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("pageSize", String(options.pageSize));

  return useQuery<AdminReportResponse>({
    queryKey: [adminKeys.reports(), options],
    queryFn: async () => {
      const result = await fetchWithAuth(`/api/admin/reports?${params.toString()}`);
      if (!result.ok) {
        throw new Error("Failed to load reports");
      }
      return result.json();
    },
    staleTime: 1000 * 30,
  });
}


