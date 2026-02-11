"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Stale-while-revalidate caching hook using sessionStorage.
 *
 * Returns cached data instantly, then fetches fresh data in the background.
 *
 * @param {string} key        – sessionStorage key
 * @param {Function} fetchFn  – async function that returns the data
 * @param {number} ttlMs      – time-to-live in ms (default: 2 minutes)
 */
export function useCache(key, fetchFn, ttlMs = 2 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndCache = useCallback(async () => {
    try {
      const freshData = await fetchFn();
      setData(freshData);
      setError(null);

      // Store in sessionStorage with timestamp
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ data: freshData, ts: Date.now() })
        );
      } catch {
        // sessionStorage might be full or unavailable; silently ignore
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttlMs]);

  useEffect(() => {
    let stale = false;

    // Try to read from cache first
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const { data: cachedData, ts } = JSON.parse(cached);
        setData(cachedData);
        setLoading(false);

        // If still fresh, skip refetch
        if (Date.now() - ts < ttlMs) {
          return;
        }
        stale = true;
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
