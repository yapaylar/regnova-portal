import { useQuery } from "@tanstack/react-query";

import { RECALLS } from "@/data/mock";
import { recallKeys } from "@/lib/query-keys";

export function useRecalls() {
  return useQuery({
    queryKey: recallKeys.list(),
    queryFn: async () => RECALLS,
    staleTime: Infinity,
  });
}

