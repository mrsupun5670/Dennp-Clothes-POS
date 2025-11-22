import { useState, useEffect, useCallback, useRef } from 'react';

type QueryKey = string | readonly unknown[];
type QueryFunction<T> = () => Promise<T>;

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const cache = new Map<string, any>();

export function useQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  options: { enabled?: boolean } = { enabled: true }
): QueryResult<T> {
  const queryKeyString = JSON.stringify(queryKey);
  const [data, setData] = useState<T | null>(cache.get(queryKeyString) || null);
  const [isLoading, setIsLoading] = useState<boolean>((options.enabled ?? true) && !cache.has(queryKeyString));
  const [error, setError] = useState<Error | null>(null);

  const queryFnRef = useRef(queryFn);
  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!options.enabled) {
      return;
    }

    if (!isRefetch && cache.has(queryKeyString)) {
      setData(cache.get(queryKeyString));
      if (isLoading) setIsLoading(false);
      // Still refetch in the background
    }

    if (isRefetch && !isLoading) {
      setIsLoading(true);
    }

    try {
      const result = await queryFnRef.current();
      cache.set(queryKeyString, result);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error(`Error fetching ${queryKeyString}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [queryKeyString, options.enabled, isLoading]);

  useEffect(() => {
    fetchData();
  }, [queryKeyString, options.enabled]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}