// frontend/src/api/client.ts
import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aura_access_token');
      localStorage.removeItem('aura_refresh_token');
      window.location.href = `/auth?expired=true&redirect=${encodeURIComponent(
        window.location.pathname,
      )}`;
    }
    return Promise.reject(error);
  },
);

export function unwrapApiData<T>(payload: T | { data: T; error: unknown }): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    'error' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
