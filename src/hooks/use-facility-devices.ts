import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { facilityKeys } from "@/lib/query-keys";

export type FacilityDeviceListItem = {
  assignmentId: string;
  status: string;
  notes: string | null;
  assignedAt: string;
  updatedAt: string;
  device: {
    id: string;
    name: string;
    modelNumber: string | null;
    udi: string | null;
    deviceClass: string;
    registrationStatus: string;
    manufacturer: {
      id: string;
      name: string;
    };
  };
  reportsCount: number;
  activeRecalls: number;
};

export type FacilityDeviceListResponse = {
  data: FacilityDeviceListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNextPage: boolean;
    totalPages: number;
  };
};

export type FacilityDeviceFilters = {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export function useFacilityDevices(filters: FacilityDeviceFilters = {}) {
  const { fetchWithAuth } = useAuth();

  return useQuery<FacilityDeviceListResponse>({
    queryKey: [facilityKeys.devices(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (typeof filters.page === "number") params.set("page", String(filters.page));
      if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

      const response = await fetchWithAuth(`/api/facility/devices?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load facility devices");
      }

      return response.json();
    },
    staleTime: 1000 * 30,
  });
}

