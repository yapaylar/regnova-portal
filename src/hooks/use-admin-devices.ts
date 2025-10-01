import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/auth-context";

type AdminDeviceResponse = {
  items: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    udi: string | null;
    registrationStatus: string;
    deviceClass: string;
    createdAt: string;
    updatedAt: string;
    manufacturer: {
      id: string;
      name: string;
      slug: string;
    };
    assignments: Array<{
      id: string;
      status: string;
      facility: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type UseAdminDevicesOptions = {
  search?: string;
  manufacturerId?: string;
  facilityId?: string;
  registrationStatus?: string;
  deviceClass?: string;
};

export function useAdminDevices(options: UseAdminDevicesOptions = {}) {
  const params = new URLSearchParams();
  const { fetchWithAuth } = useAuth();

  if (options.search) params.set("search", options.search);
  if (options.manufacturerId) params.set("manufacturerId", options.manufacturerId);
  if (options.facilityId) params.set("facilityId", options.facilityId);
  if (options.registrationStatus) params.set("registrationStatus", options.registrationStatus);
  if (options.deviceClass) params.set("class", options.deviceClass);

  return useQuery<AdminDeviceResponse>({
    queryKey: [adminKeys.devices(), options],
    queryFn: async () => {
      const result = await fetchWithAuth(`/api/admin/devices?${params.toString()}`);
      if (!result.ok) {
        throw new Error("Failed to load devices");
      }
      return result.json();
    },
    staleTime: 1000 * 30,
  });
}

type CreateDevicePayload = {
  name: string;
  modelNumber?: string | null;
  manufacturerId: string;
  udi?: string | null;
  deviceClass: string;
  registrationStatus: string;
  notes?: string | null;
  assignments?: Array<{
    facilityId: string;
    status: string;
    notes?: string | null;
  }>;
};

type CreateDeviceResponse = {
  device: AdminDeviceResponse["items"][number];
};

export function useCreateDeviceMutation() {
  const queryClient = useQueryClient();
  const { fetchWithAuth } = useAuth();

  return useMutation<CreateDeviceResponse, Error, CreateDevicePayload>({
    mutationFn: async (payload) => {
      const response = await fetchWithAuth("/api/admin/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        skipAuthRetry: true,
      });

      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.error?.message ?? "Failed to create device");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [adminKeys.devices()] });
    },
  });
}


