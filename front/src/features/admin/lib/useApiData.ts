"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, failureMessage } from "../api";

/**
 * Loads `path` from the admin API and reloads it whenever `path` changes (e.g. a search term).
 * Keeps the previous data while a new request runs, so lists don't flash empty, and ignores
 * answers that arrive after a newer request was sent (fast typing in a search box).
 * `null` as path loads nothing.
 */
export function useApiData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    if (!path) return;
    const request = ++latest.current;
    const result = await apiRequest<T>(path);
    if (request !== latest.current) return;
    if (result.ok) {
      setData(result.data);
      setError(null);
    } else {
      setError(failureMessage(result));
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}

/** The value, once it has stopped changing for `delayMs`: one request per pause in typing, not per key. */
export function useDebounced<T>(value: T, delayMs = 300): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}
