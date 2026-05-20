// Called after Clerk sign-in to ensure profile exists in Supabase
import { supabase } from './supabase';

export async function syncClerkUserToSupabase(clerkUser: {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  fullName?: string | null;
  imageUrl?: string;
}) {
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return;

  const { error } = await (supabase.from('profiles') as any).upsert(
    {
      id: clerkUser.id,
      email,
      full_name: clerkUser.fullName ?? null,
      avatar_url: clerkUser.imageUrl ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: false }
  );

  if (error) {
    console.warn('Profile sync error:', error.message);
  }
}