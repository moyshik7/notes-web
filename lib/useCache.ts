"use client";

import { useState, useEffect, useCallback } from "react";
import type { CacheEntry } from "@/types";

/**
 * Stale-while-revalidate caching hook using sessionStorage.
 *
 * Returns cached data instantly, then fetches fresh data in the background.
 */
export function useCache<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number = 2 * 60 * 1000) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAndCache = useCallback(async () => {
        try {
            const freshData = await fetchFn();
            setData(freshData);
            setError(null);

            // Store in sessionStorage with timestamp
            try {
                const entry: CacheEntry<T> = { data: freshData, ts: Date.now() };
                sessionStorage.setItem(key, JSON.stringify(entry));
            } catch {
                // sessionStorage might be full or unavailable; silently ignore
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn, ttlMs]);

    useEffect(() => {
        // Try to read from cache first
        try {
            const cached = sessionStorage.getItem(key);
            if (cached) {
                const { data: cachedData, ts } = JSON.parse(cached) as CacheEntry<T>;
                setData(cachedData);
                setLoading(false);

                // If still fresh, skip refetch
                if (Date.now() - ts < ttlMs) {
                    return;
                }
            }
        } catch {
            // cache miss or parse error
        }

        // Fetch fresh data (either no cache or stale)
        fetchAndCache();
    }, [key, fetchAndCache, ttlMs]);

    const refresh = useCallback(() => {
        setLoading(true);
        return fetchAndCache();
    }, [fetchAndCache]);

    return { data, loading, error, refresh };
}
