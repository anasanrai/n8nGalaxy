// Called after Clerk sign-in to ensure profile exists in Supabase
import { supabase } from './supabase';

const ADMIN_EMAILS = ['raianasan10@gmail.com', 'admin@n8ngalaxy.com'];

export async function syncClerkUserToSupabase(clerkUser: {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  fullName?: string | null;
  imageUrl?: string;
}) {
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return;

  const isAdmin = ADMIN_EMAILS.includes(email);

  // Try to insert a new profile row. If it already exists, skip.
  const { error: insertError } = await (supabase.from('profiles') as any).insert({
    id: clerkUser.id,
    email,
    full_name: clerkUser.fullName ?? null,
    avatar_url: clerkUser.imageUrl ?? null,
    role: isAdmin ? 'admin' : 'user',
  });

  if (insertError && insertError.code !== '23505') {
    // Not a duplicate key error — unexpected, log it
    console.warn('Profile insert error:', insertError.message);
    return;
  }

  // Profile already existed — update non-role fields only, then promote if needed
  if (insertError?.code === '23505') {
    await (supabase.from('profiles') as any)
      .update({
        email,
        full_name: clerkUser.fullName ?? null,
        avatar_url: clerkUser.imageUrl ?? null,
      })
      .eq('id', clerkUser.id);

    if (isAdmin) {
      await (supabase.from('profiles') as any)
        .update({ role: 'admin' })
        .eq('id', clerkUser.id);
    }
  }
}
