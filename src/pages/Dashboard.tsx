import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { UserButton } from '@clerk/clerk-react';
import {
  ShoppingBag, BookOpen, Upload, User,
  CreditCard, ArrowUpRight, Loader2, LogOut,
  Package, FileText,
} from 'lucide-react';
import type { Purchase, Subscription, Submission, Workflow, Course } from '../types';

type Section = 'library' | 'submissions' | 'account';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('library');

  // Redirect admin users to the admin panel once profile loads
  useEffect(() => {
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [profile?.role, navigate]);

  const { data: purchases, isLoading: loadingPurchases } = useQuery({
    queryKey: ['dashboard-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      const { data, error } = await supabase
        .from('purchases')
        .select('*, workflow:workflows(*), course:courses(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Purchase & { workflow: Workflow | null; course: Course | null })[];
    },
    enabled: !!user?.id,
  });

  const { data: activeSubscriptions } = useQuery({
    queryKey: ['dashboard-subscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user?.id,
  });

  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['dashboard-submissions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Submission[];
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const fmtAmt = (c: number | null) => (c === null ? '—' : `$${(c / 100).toFixed(2)}`);

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  const planColor: Record<string, string> = {
    free:   'bg-gray-500/15 text-gray-400 border-gray-500/30',
    pro:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
    agency: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  const statusStyle: Record<string, { dot: string; text: string; badge: string }> = {
    pending:  { dot: 'bg-amber-400',  text: 'text-amber-400',  badge: 'bg-amber-400/10 border-amber-400/30 text-amber-400' },
    approved: { dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' },
    rejected: { dot: 'bg-red-400',    text: 'text-red-400',    badge: 'bg-red-400/10 border-red-400/30 text-red-400' },
  };

  const navItems: { id: Section; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'library',     label: 'My Library',    icon: Package,       count: purchases?.length },
    { id: 'submissions', label: 'Submissions',    icon: FileText,      count: submissions?.length },
    { id: 'account',     label: 'Account',        icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-10">
        <div className="max-w-[1100px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">

          {/* ── Left sidebar ── */}
          <aside className="w-full md:w-[240px] shrink-0 flex flex-col gap-4">

            {/* Profile card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col items-center text-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl select-none">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-[15px] text-white leading-tight">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5 truncate max-w-[180px]">{user?.email}</p>
              </div>
              <span className={`inline-flex items-center px-3 h-[22px] rounded-full border text-[11px] font-bold uppercase tracking-wide ${planColor[profile?.plan || 'free']}`}>
                {profile?.plan || 'free'}
              </span>
            </div>

            {/* Nav */}
            <nav className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {navItems.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer border-b border-white/5 last:border-0 ${
                    section === id
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} />
                    {label}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span className="text-[11px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick links */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {[
                { label: 'Browse Marketplace', to: '/marketplace', icon: ShoppingBag },
                { label: 'Submit Workflow',     to: '/submit',      icon: Upload },
                { label: 'View Pricing',        to: '/pricing',     icon: CreditCard },
              ].map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-[13px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} />
                    {label}
                  </span>
                  <ArrowUpRight size={13} className="group-hover:text-violet-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full h-[40px] rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[13px] font-medium transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </aside>

          {/* ── Right content ── */}
          <div className="flex-1 min-w-0">

            {/* My Library */}
            {section === 'library' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="font-display font-extrabold text-[26px] text-white mb-1">My Library</h1>
                  <p className="text-gray-500 text-[14px]">Workflows and courses you've unlocked.</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Purchases',      value: purchases?.length ?? 0,        color: 'text-violet-400' },
                    { label: 'Subscriptions',  value: activeSubscriptions?.length ?? 0, color: 'text-emerald-400' },
                    { label: 'Submissions',    value: submissions?.length ?? 0,       color: 'text-amber-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <span className={`font-display font-extrabold text-[32px] leading-none ${s.color}`}>{s.value}</span>
                      <p className="text-gray-500 text-[12px] mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Purchase list */}
                {loadingPurchases ? (
                  <div className="flex items-center justify-center py-16 text-gray-500 gap-2 text-[14px]">
                    <Loader2 size={16} className="animate-spin" /> Loading...
                  </div>
                ) : purchases && purchases.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {purchases.map((p) => {
                      const item = p.workflow || p.course;
                      const isWorkflow = !!p.workflow;
                      return (
                        <div
                          key={p.id}
                          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors p-4 flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                            {isWorkflow
                              ? <ShoppingBag size={16} className="text-violet-400" />
                              : <BookOpen size={16} className="text-violet-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-white truncate">
                              {item?.title || 'Unknown Item'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-violet-400 font-medium uppercase tracking-wide">
                                {isWorkflow ? 'Workflow' : 'Course'}
                              </span>
                              <span className="text-gray-600">·</span>
                              <span className="text-[12px] text-gray-500">{fmt(p.created_at)}</span>
                            </div>
                          </div>
                          <span className="text-[14px] font-bold text-white shrink-0">{fmtAmt(p.amount_cents)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <ShoppingBag size={36} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium mb-1">No purchases yet</p>
                    <p className="text-gray-600 text-[13px] mb-5">Browse free and premium workflows</p>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="h-[38px] px-5 bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submissions */}
            {section === 'submissions' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display font-extrabold text-[26px] text-white mb-1">My Submissions</h1>
                    <p className="text-gray-500 text-[14px]">Workflows you've submitted to the marketplace.</p>
                  </div>
                  <button
                    onClick={() => navigate('/submit')}
                    className="h-[38px] px-4 bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Upload size={13} />
                    Submit New
                  </button>
                </div>

                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-16 text-gray-500 gap-2 text-[14px]">
                    <Loader2 size={16} className="animate-spin" /> Loading...
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {submissions.map((s) => {
                      const st = statusStyle[s.status] ?? statusStyle.pending;
                      return (
                        <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[15px] font-semibold text-white truncate">{s.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[12px] text-gray-500 capitalize">
                                  {s.category.replace(/_/g, ' ')}
                                </span>
                                <span className="text-gray-700">·</span>
                                <span className="text-[12px] text-gray-500">{fmt(s.created_at)}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full border text-[11px] font-bold uppercase shrink-0 ${st.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {s.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <FileText size={36} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium mb-1">No submissions yet</p>
                    <p className="text-gray-600 text-[13px] mb-5">Share your automations with the community</p>
                    <button
                      onClick={() => navigate('/submit')}
                      className="h-[38px] px-5 bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Submit a Workflow →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Account */}
            {section === 'account' && (
              <div className="flex flex-col gap-6 max-w-[560px]">
                <div>
                  <h1 className="font-display font-extrabold text-[26px] text-white mb-1">Account</h1>
                  <p className="text-gray-500 text-[14px]">Your profile and plan details.</p>
                </div>

                {/* Profile */}
                <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5">
                  <div className="px-6 py-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Profile</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">Name</p>
                        <p className="text-[14px] text-white">{profile?.full_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-[14px] text-white truncate">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">Member Since</p>
                        <p className="text-[14px] text-white">
                          {profile?.created_at ? fmt(profile.created_at) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">Role</p>
                        <p className="text-[14px] text-white capitalize">{profile?.role || 'user'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Plan</p>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white font-semibold capitalize">{profile?.plan || 'Free'} Plan</p>
                      <p className="text-gray-500 text-[12px] mt-0.5">
                        {profile?.plan === 'free' ? 'Upgrade to unlock premium workflows' : 'Active subscription'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 h-[24px] rounded-full border text-[11px] font-bold uppercase ${planColor[profile?.plan || 'free']}`}>
                      {profile?.plan || 'free'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full h-[40px] bg-violet-600 hover:bg-violet-500 text-white font-medium text-[14px] rounded-lg transition-colors cursor-pointer"
                  >
                    {profile?.plan === 'free' ? 'Upgrade Plan →' : 'Manage Subscription'}
                  </button>
                </div>

                {/* Manage via Clerk */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Security</p>
                  <p className="text-gray-400 text-[13px] mb-4">Change password, connected accounts, and two-factor auth.</p>
                  <div className="flex items-center gap-2">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-gray-500 text-[13px]">Manage via Clerk account settings</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
