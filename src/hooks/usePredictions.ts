import { useEffect, useState } from "react";
import { fetchArrivalsByPlatform } from "../api/gtfsRealtime";
import type { Arrival } from "../types";

const POLL_INTERVAL_MS = 30_000;

export function usePredictions() {
  const [arrivalsByPlatform, setArrivalsByPlatform] = useState<Map<string, Arrival[]>>(new Map());
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await fetchArrivalsByPlatform();
        if (cancelled) return;
        setArrivalsByPlatform(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { arrivalsByPlatform, error, lastUpdated };
}
