import { useState, useEffect, useCallback, useRef } from 'react';

type QueryKey = string | readonly unknown[];
type QueryFunction<T> = () => Promise<T>;

interface QueryOptions {
  enabled?: boolean;
  cacheTime?: number;      // Time to keep cache (ms) - default 5 minutes
  staleTime?: number;      // Time before data is considered stale (ms) - default 1 minute
  refetchOnMount?: boolean; // Whether to refetch on component mount - default false
}

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_CACHE_TIME = 5 * 60 * 1000;  // 5 minutes
const DEFAULT_STALE_TIME = 1 * 60 * 1000;   // 1 minute

// Clear expired cache entries
const clearExpiredCache = (cacheTime: number) => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > cacheTime) {
      cache.delete(key);
    }
  }
};

export function useQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  options: QueryOptions = {}
): QueryResult<T> {
  const {
    enabled = true,
    cacheTime = DEFAULT_CACHE_TIME,
    staleTime = DEFAULT_STALE_TIME,
    refetchOnMount = false,
  } = options;

  const queryKeyString = JSON.stringify(queryKey);
  const cachedEntry = cache.get(queryKeyString);
  const isCachedDataFresh = cachedEntry && (Date.now() - cachedEntry.timestamp < staleTime);

  const [data, setData] = useState<T | null>(cachedEntry?.data || null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled && !cachedEntry);
  const [error, setError] = useState<Error | null>(null);

  const queryFnRef = useRef(queryFn);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  // Periodically clear expired cache
  useEffect(() => {
    const interval = setInterval(() => clearExpiredCache(cacheTime), 60000); // Every minute
    return () => clearInterval(interval);
  }, [cacheTime]);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) {
      return;
    }

    // If we have fresh cached data and it's not a manual refetch, use cached data
    const currentCachedEntry = cache.get(queryKeyString);
    const isDataFresh = currentCachedEntry && (Date.now() - currentCachedEntry.timestamp < staleTime);
    
    if (!isRefetch && isDataFresh) {
      setData(currentCachedEntry.data);
      if (isLoading) setIsLoading(false);
      return; // Don't refetch if data is still fresh
    }

    // If it's the initial mount and refetchOnMount is false, and we have cached data
    if (!isRefetch && !refetchOnMount && currentCachedEntry && !hasFetchedRef.current) {
      setData(currentCachedEntry.data);
      if (isLoading) setIsLoading(false);
      hasFetchedRef.current = true;
      return;
    }

    if (isRefetch && !isLoading) {
      setIsLoading(true);
    }

    try {
      const result = await queryFnRef.current();
      cache.set(queryKeyString, {
        data: result,
        timestamp: Date.now(),
      });
      setData(result);
      setError(null);
      hasFetchedRef.current = true;
    } catch (err: any) {
      setError(err);
      console.error(`Error fetching ${queryKeyString}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [queryKeyString, enabled, isLoading, staleTime, refetchOnMount]);

  useEffect(() => {
    fetchData();
  }, [queryKeyString, enabled]);

  const refetch = useCallback(() => {
    // Clear cache to ensure fresh data
    cache.delete(queryKeyString);
    hasFetchedRef.current = false;
    fetchData(true);
  }, [fetchData, queryKeyString]);

  return { data, isLoading, error, refetch };
}