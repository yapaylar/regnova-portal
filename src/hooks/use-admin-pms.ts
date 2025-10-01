import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/auth-context";

type AdminPmsResponse = {
  items: Array<{
    id: string;
    organization: string;
    visitDate: string;
    notes: string;
    attachments: unknown;
    createdAt: string;
    updatedAt: string;
    facility: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type UseAdminPmsOptions = {
  search?: string;
  facilityId?: string;
};

export function useAdminPmsVisits(options: UseAdminPmsOptions = {}) {
  const params = new URLSearchParams();
  const { fetchWithAuth } = useAuth();

  if (options.search) params.set("search", options.search);
  if (options.facilityId) params.set("facilityId", options.facilityId);

  return useQuery<AdminPmsResponse>({
    queryKey: [adminKeys.pms(), options],
    queryFn: async () => {
      const result = await fetchWithAuth(`/api/admin/pms?${params.toString()}`);
      if (!result.ok) {
        throw new Error("Failed to load PMS visits");
      }
      return result.json();
    },
    staleTime: 1000 * 30,
  });
}

type CreatePmsPayload = {
  facilityId?: string | null;
  organization: string;
  visitDate: string;
  notes: string;
  attachments?: string;
};

type CreatePmsResponse = {
  visit: AdminPmsResponse["items"][number];
};

export function useCreatePmsVisitMutation() {
  const queryClient = useQueryClient();
  const { fetchWithAuth } = useAuth();

  return useMutation<CreatePmsResponse, Error, CreatePmsPayload>({
    mutationFn: async (payload) => {
      const response = await fetchWithAuth("/api/admin/pms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facilityId: payload.facilityId ?? null,
          organization: payload.organization,
          visitDate: payload.visitDate,
          notes: payload.notes,
          attachments: payload.attachments
            ?.split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
        skipAuthRetry: true,
      });

      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.error?.message ?? "Failed to create visit");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [adminKeys.pms()] });
    },
  });
}


