import { useInfiniteQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export interface AppliedFilters {
  cityId?: string;
  state?: string;
  zoneId?: string;
  effectiveDate?: string;
}

export const useCommissionRules = (filters: AppliedFilters) => {
  return useInfiniteQuery({
    queryKey: ['commission-rules', filters],
    queryFn: ({ pageParam, signal }) => 
      adminApi.listCommissionRules({ ...filters, cursor: pageParam, limit: 20 }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000,
  });
};
