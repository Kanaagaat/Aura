// frontend/src/hooks/useLocations.ts
import { useEffect, useState } from 'react';
import type { Location } from '../types';
import { api } from '../lib/api';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getLocations()
      .then((data) => {
        if (!cancelled) {
          setLocations(data);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { locations, loading, error };
}
