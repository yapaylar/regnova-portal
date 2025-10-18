import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { manufacturerKeys } from "@/lib/query-keys";
import { ManufacturerRecallResult } from "@/lib/manufacturer/recalls";

type ManufacturerRecallOptions = {
  search?: string;
  status?: string;
  actionType?: string;
  region?: string;
  page?: number;
  pageSize?: number;
};

export function useManufacturerRecalls(options: ManufacturerRecallOptions = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<ManufacturerRecallResult>({
    queryKey: [manufacturerKeys.recalls(), options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search) params.set("search", options.search);
      if (options.status) params.set("status", options.status);
      if (options.actionType) params.set("actionType", options.actionType);
      if (options.region) params.set("region", options.region);
      if (options.page) params.set("page", String(options.page));
      if (options.pageSize) params.set("pageSize", String(options.pageSize));

      const response = await fetchWithAuth(`/api/manufacturer/recalls?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load manufacturer recalls");
      }
      return response.json();
    },
    staleTime: 1000 * 60,
  });
}

