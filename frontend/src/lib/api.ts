import type { Beacon, Category, CreateBeaconPayload, Location, UserProfile } from '../types';
import { client, unwrapApiData } from '../api/client';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

export function getAccessToken() {
  return localStorage.getItem('aura_access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('aura_refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('aura_access_token', access);
  localStorage.setItem('aura_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('aura_access_token');
  localStorage.removeItem('aura_refresh_token');
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...options?.headers } as Record<string, string>;
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && getRefreshToken() && path !== '/api/auth/login/' && path !== '/api/auth/google/' && path !== '/api/auth/token/refresh/') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: getRefreshToken() }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setTokens(data.access, data.refresh || getRefreshToken() || '');
          isRefreshing = false;
          onRefreshed(data.access);
        } else {
          isRefreshing = false;
          clearTokens();
          window.location.href = `/auth?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        clearTokens();
        window.location.href = `/auth?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        headers['Authorization'] = `Bearer ${newToken}`;
        fetch(`${API_BASE}${path}`, { ...options, headers })
          .then((retryRes) => {
            if (!retryRes.ok) {
              retryRes.json().then((err) => reject(new Error(err.detail || `Retry failed: ${retryRes.status}`))).catch(() => reject(new Error(`Retry failed: ${retryRes.status}`)));
            } else {
              if (retryRes.status === 204) resolve(undefined as T);
              else resolve(retryRes.json());
            }
          })
          .catch(reject);
      });
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}

async function axiosJson<T>(path: string, payload?: unknown): Promise<T> {
  try {
    const response =
      payload === undefined ? await client.get(path) : await client.post(path, payload);
    return unwrapApiData<T>(response.data);
  } catch (err: any) {
    const data = err?.response?.data;
    const message =
      data?.error?.message || data?.detail || err?.message || 'Request failed';
    throw new Error(message);
  }
}

interface AuthResponse {
  user: UserProfile;
  access: string;
  refresh: string;
}

export const api = {
  login: (payload: any) =>
    fetchJson<AuthResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: any) =>
    fetchJson<AuthResponse>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  googleAuth: (credential: string) =>
    fetchJson<AuthResponse>('/api/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  getLocations: async (category?: Category): Promise<Location[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    const query = params.toString();
    const data = await axiosJson<Location[] | { results: Location[] }>(
      `/api/v1/locations/${query ? `?${query}` : ''}`,
    );
    return unwrapList(data);
  },

  getLocation: (id: number) => axiosJson<Location>(`/api/v1/locations/${id}/`),

  getBeacons: async (): Promise<Beacon[]> => {
    const data = await axiosJson<Beacon[] | { results: Beacon[] }>('/api/v1/beacons/?active=true');
    return unwrapList(data);
  },

  getBeacon: (id: number) => axiosJson<Beacon>(`/api/v1/beacons/${id}/`),

  createBeacon: (payload: CreateBeaconPayload) =>
    axiosJson<Beacon>('/api/v1/beacons/', payload),

  joinBeacon: (id: number, telegram_handle?: string) =>
    axiosJson<Beacon>(`/api/v1/beacons/${id}/join/`, { telegram_handle: telegram_handle || '' }),

  deleteBeacon: (id: number) =>
    axiosJson<void>(`/api/v1/beacons/${id}/`, {}),

  getProfile: () => fetchJson<UserProfile>('/api/v1/profiles/me/'),

  getProfileById: (id: number) => fetchJson<UserProfile>(`/api/v1/profiles/${id}/`),

  updateProfile: (payload: Partial<UserProfile>) =>
    fetchJson<UserProfile>('/api/v1/profiles/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getSavedLocations: async (): Promise<Location[]> => {
    const data = await axiosJson<{ data: Location[] }>('/api/v1/profiles/saved/');
    return (data as any).data ?? data ?? [];
  },

  toggleSavedLocation: async (locationId: number): Promise<{ saved: boolean; location_id: number }> => {
    const data = await axiosJson<{ data: { saved: boolean; location_id: number } }>(
      `/api/v1/profiles/saved/${locationId}/`,
      {},  // empty body forces POST
    );
    return (data as any).data;
  },
};
