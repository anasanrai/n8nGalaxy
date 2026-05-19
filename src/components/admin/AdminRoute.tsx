import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import { Spinner } from '../ui/Spinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isSignedIn, user, isLoaded } = useUser();

  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data ?? null;
    },
    enabled: !!isSignedIn && !!user?.id,
  });

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
