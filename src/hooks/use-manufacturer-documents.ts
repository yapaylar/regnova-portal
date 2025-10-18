import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { manufacturerKeys } from "@/lib/query-keys";
import { ManufacturerDocumentResult } from "@/lib/manufacturer/documents";

type ManufacturerDocumentOptions = {
  search?: string;
  deviceId?: string;
  page?: number;
  pageSize?: number;
};

export function useManufacturerDocuments(options: ManufacturerDocumentOptions = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<ManufacturerDocumentResult>({
    queryKey: [manufacturerKeys.documents(), options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search) params.set("search", options.search);
      if (options.deviceId) params.set("deviceId", options.deviceId);
      if (options.page) params.set("page", String(options.page));
      if (options.pageSize) params.set("pageSize", String(options.pageSize));

      const response = await fetchWithAuth(`/api/manufacturer/documents?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load manufacturer documents");
      }
      return response.json();
    },
    staleTime: 1000 * 60,
  });
}

