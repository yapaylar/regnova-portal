import { useQuery } from "@tanstack/react-query";

import { adminKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/auth-context";

type AdminAuditResponse = {
  items: Array<{
    id: string;
    event: string;
    message: string;
    metadata: unknown;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    } | null;
    report: {
      id: string;
      trackingId: string;
    } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type UseAdminAuditOptions = {
  search?: string;
  event?: string;
};

export function useAdminAuditLog(options: UseAdminAuditOptions = {}) {
  const params = new URLSearchParams();
  const { fetchWithAuth } = useAuth();

  if (options.search) params.set("search", options.search);
  if (options.event) params.set("event", options.event);

  return useQuery<AdminAuditResponse>({
    queryKey: [adminKeys.auditLog(), options],
    queryFn: async () => {
      const result = await fetchWithAuth(`/api/admin/audit?${params.toString()}`);
      if (!result.ok) {
        throw new Error("Failed to load audit log");
      }
      return result.json();
    },
    staleTime: 1000 * 30,
  });
}


