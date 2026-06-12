import { create } from 'zustand';
import type { Beacon, Category, Location, UserProfile } from '../types';
import { api, getAccessToken, setTokens, clearTokens } from '../lib/api';

interface AuraState {
  locations: Location[];
  beacons: Beacon[];
  profile: UserProfile | null;
  savedLocations: Location[];
  isAuthenticated: boolean;
  mapFilter: Category;
  searchQuery: string;
  selectedLocationId: number | null;
  loading: boolean;
  error: string | null;

  setMapFilter: (filter: Category) => void;
  setSearchQuery: (q: string) => void;
  selectLocation: (id: number | null) => void;
  fetchLocations: () => Promise<void>;
  fetchBeacons: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchSavedLocations: () => Promise<void>;
  toggleSave: (locationId: number) => Promise<void>;
  login: (payload: Parameters<typeof api.login>[0]) => Promise<void>;
  register: (payload: Parameters<typeof api.register>[0]) => Promise<void>;
  googleLogin: (credential: string) => Promise<UserProfile>;
  updateProfile: (payload: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  createBeacon: (payload: Parameters<typeof api.createBeacon>[0]) => Promise<Beacon>;
  joinBeacon: (id: number, handle?: string) => Promise<void>;
  init: () => Promise<void>;
}

export const useAuraStore = create<AuraState>((set, get) => ({
  locations: [],
  beacons: [],
  profile: null,
  savedLocations: [],
  isAuthenticated: !!getAccessToken(),
  mapFilter: 'all',
  searchQuery: '',
  selectedLocationId: null,
  loading: false,
  error: null,

  setMapFilter: (mapFilter) => set({ mapFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectLocation: (selectedLocationId) => set({ selectedLocationId }),

  fetchLocations: async () => {
    try {
      const { mapFilter } = get();
      const locations = await api.getLocations(mapFilter);
      set({ locations, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchBeacons: async () => {
    try {
      const beacons = await api.getBeacons();
      set({ beacons, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchProfile: async () => {
    if (!getAccessToken()) {
      set({ profile: null, isAuthenticated: false });
      return;
    }
    try {
      const profile = await api.getProfile();
      set({ profile, isAuthenticated: true, error: null });
    } catch (e) {
      clearTokens();
      set({ profile: null, isAuthenticated: false, error: (e as Error).message });
    }
  },

  fetchSavedLocations: async () => {
    if (!getAccessToken()) return;
    try {
      const savedLocations = await api.getSavedLocations();
      set({ savedLocations });
    } catch {
      // silently fail — not critical
    }
  },

  toggleSave: async (locationId: number) => {
    if (!getAccessToken()) return;
    try {
      const result = await api.toggleSavedLocation(locationId);
      const { savedLocations, locations, profile } = get();
      if (result.saved) {
        const loc = locations.find((l) => l.id === locationId);
        if (loc && !savedLocations.find((s) => s.id === locationId)) {
          set({ savedLocations: [...savedLocations, loc] });
        }
      } else {
        set({ savedLocations: savedLocations.filter((l) => l.id !== locationId) });
      }
      // Update profile saved_location_ids in sync
      if (profile) {
        const ids = result.saved
          ? [...(profile.saved_location_ids ?? []), locationId]
          : (profile.saved_location_ids ?? []).filter((id) => id !== locationId);
        set({ profile: { ...profile, saved_location_ids: ids } });
      }
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.login(payload);
      setTokens(data.access, data.refresh);
      set({ profile: data.user, isAuthenticated: true, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.register(payload);
      setTokens(data.access, data.refresh);
      set({ profile: data.user, isAuthenticated: true, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  googleLogin: async (credential) => {
    set({ loading: true, error: null });
    try {
      const data = await api.googleAuth(credential);
      setTokens(data.access, data.refresh);
      set({ profile: data.user, isAuthenticated: true, loading: false });
      return data.user;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  updateProfile: async (payload) => {
    set({ loading: true, error: null });
    try {
      const profile = await api.updateProfile(payload);
      set({ profile, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  logout: () => {
    clearTokens();
    set({ profile: null, isAuthenticated: false });
  },

  createBeacon: async (payload) => {
    const beacon = await api.createBeacon(payload);
    await get().fetchBeacons();
    return beacon;
  },

  joinBeacon: async (id, handle) => {
    await api.joinBeacon(id, handle);
    await get().fetchBeacons();
  },

  init: async () => {
    set({ loading: true });
    const promises: Promise<void>[] = [
      get().fetchLocations(),
      get().fetchBeacons(),
    ];
    if (getAccessToken()) {
      promises.push(get().fetchProfile());
      promises.push(get().fetchSavedLocations());
    }
    await Promise.all(promises);
    set({ loading: false });
  },
}));
