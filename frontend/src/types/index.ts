export type Category = 'all' | 'yoga' | 'coffee' | 'spa' | 'other';
export type ActivityType = 'coffee' | 'yoga' | 'walk' | 'study';

export interface UserProfile {
  id: number;
  username?: string;
  display_name: string;
  bio: string;
  telegram_username: string;
  instagram_handle?: string;
  avatar_url: string;
  is_premium: boolean;
  beacons_lit: number;
}

export interface Location {
  id: number;
  name: string;
  category: Exclude<Category, 'all'>;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  vibe_tags: string[];
  editorial_note: string;
  photo_url: string;
  two_gis_id?: string;
  two_gis_url?: string;
  operating_hours: string;
  tier: 'free' | 'featured';
  is_featured: boolean;
  active_beacon_count?: number;
}

export interface BeaconJoin {
  id: number;
  user: UserProfile;
  telegram_handle: string;
  joined_at: string;
}

export interface Beacon {
  id: number;
  location: Location;
  location_id?: number;
  creator: UserProfile;
  activity_type: ActivityType;
  message: string;
  scheduled_at: string;
  expires_at: string;
  is_active: boolean;
  join_count: number;
  joins: BeaconJoin[];
  is_expired: boolean;
  created_at: string;
}

export interface CreateBeaconPayload {
  location_id: number;
  activity_type: ActivityType;
  message: string;
  scheduled_at: string;
}
