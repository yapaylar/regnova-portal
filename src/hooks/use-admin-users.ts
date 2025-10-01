import { useQuery } from "@tanstack/react-query";

import { adminKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/auth-context";

type AdminUserResponse = {
  items: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    organization: string | null;
    profileType: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    facilityProfile: {
      title: string | null;
      department: string | null;
      facility: {
        id: string;
        name: string;
        slug: string;
      };
    } | null;
    manufacturerProfile: {
      jobTitle: string | null;
      manufacturer: {
        id: string;
        name: string;
        slug: string;
      };
    } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type UseAdminUsersOptions = {
  search?: string;
  profileType?: string;
  isActive?: boolean;
};

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const params = new URLSearchParams();
  const { fetchWithAuth } = useAuth();

  if (options.search) params.set("search", options.search);
  if (options.profileType) params.set("profileType", options.profileType);
  if (typeof options.isActive === "boolean") params.set("isActive", String(options.isActive));

  return useQuery<AdminUserResponse>({
    queryKey: [adminKeys.users(), options],
    queryFn: async () => {
      const result = await fetchWithAuth(`/api/admin/users?${params.toString()}`);
      if (!result.ok) {
        throw new Error("Failed to load users");
      }
      return result.json();
    },
    staleTime: 1000 * 30,
  });
}


