import { useQuery } from '@tanstack/react-query';
import { locationAPI } from '../api';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

export const useSearchLocation = (query: string) => {
  return useQuery({
    queryKey: ['location', 'search', query],
    queryFn: async () => {
      const response = await locationAPI.searchLocation(query);
      return response.data.data;
    },
    enabled: !!query,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
