// frontend/src/lib/waitlist.ts
import { supabase } from './supabase';

export interface WaitlistSubmission {
  email: string;
  city: string;
  telegram: string;
  interests: string[];
  created_at: string;
}

const STORAGE_KEY = 'aura_waitlist_submissions';

function waitlistErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code === 'PGRST205' || error.message?.includes("Could not find the table")) {
    return 'Waitlist database is not set up yet. Run docs/supabase_waitlist.sql in Supabase SQL Editor.';
  }

  if (error.message?.toLowerCase().includes('row-level security')) {
    return 'Waitlist database policy is blocking signups. Re-run docs/supabase_waitlist.sql in Supabase SQL Editor.';
  }

  return error.message || 'Could not join the waitlist.';
}

export async function submitWaitlist(data: WaitlistSubmission): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('waitlist').insert({
      email: data.email,
      city: data.city || null,
      telegram: data.telegram || null,
      interests: data.interests,
      created_at: data.created_at,
    });

    if (error) {
      throw new Error(waitlistErrorMessage(error));
    }

    return;
  }

  // Local fallback for development when Supabase env vars are not configured.
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as WaitlistSubmission[];
  existing.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
