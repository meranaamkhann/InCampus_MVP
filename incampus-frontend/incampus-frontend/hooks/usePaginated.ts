"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ApiResponse, PageResponse } from "@/types";

export function usePaginated<T>(endpoint: string, size = 15, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<PageResponse<T>>>(endpoint, {
        params: { page, size },
      });
      const data = res.data.data;
      setItems((prev) => (page === 0 ? data.content : [...prev, ...data.content]));
      setHasMore(!data.last);
      setPage((p) => p + 1);
    } catch {
      setError("Couldn't load more right now");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, hasMore, size]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (page === 0 && items.length === 0 && hasMore) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore();
        },
        { rootMargin: "200px" }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [loadMore]
  );

  return { items, setItems, loading, error, hasMore, sentinelRef, reset };
}
