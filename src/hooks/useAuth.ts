import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();

  const { data: profile } = useQuery<any>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      return data ?? null;
    },
    enabled: isSignedIn && !!user?.id,
  });

  return {
    user: isSignedIn ? { id: user!.id, email: user!.primaryEmailAddress?.emailAddress } : null,
    profile: profile ?? null,
    loading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    signOut: async () => { await clerkSignOut(); },
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
  };
}
