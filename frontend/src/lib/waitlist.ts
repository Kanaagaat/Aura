// frontend/src/lib/waitlist.ts
import { supabase } from './supabase';

export interface WaitlistSubmission {
  email: string;
  telegram: string;
  interests: string[];
  created_at: string;
}

const STORAGE_KEY = 'aura_waitlist_submissions';

export async function submitWaitlist(data: WaitlistSubmission): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('waitlist').insert({
      email: data.email,
      telegram: data.telegram || null,
      interests: data.interests,
      created_at: data.created_at,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  // Local fallback for development when Supabase env vars are not configured.
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as WaitlistSubmission[];
  existing.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
