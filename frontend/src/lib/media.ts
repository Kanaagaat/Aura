const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

const FALLBACK_BY_CATEGORY: Record<string, string> = {
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  yoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
};

/** Resolve relative /downloads_photos paths to the Django origin in dev. */
export function resolvePhotoUrl(
  url: string | undefined | null,
  category = 'other',
): string {
  if (!url) {
    return FALLBACK_BY_CATEGORY[category] ?? FALLBACK_BY_CATEGORY.other;
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return API_BASE ? `${API_BASE.replace(/\/$/, '')}${url}` : url;
  }
  return url;
}

export function twoGisFirmUrl(twoGisId?: string | null, twoGisUrl?: string | null): string {
  if (twoGisUrl) return twoGisUrl;
  if (!twoGisId) return '';
  return `https://2gis.kz/almaty/firm/${twoGisId}`;
}
