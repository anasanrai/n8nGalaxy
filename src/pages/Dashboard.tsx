import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, BookOpen, Upload, User, CreditCard, ArrowUpRight, Loader2 } from 'lucide-react';

import type { Purchase, Subscription, Submission, Workflow, Course } from '../types';

type Tab = 'overview' | 'submissions' | 'account';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatAmount = (cents: number | null) => {
    if (cents === null) return '—';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const purchasesCount = purchases?.length ?? 0;
  const activeSubsCount = activeSubscriptions?.length ?? 0;
  const submissionsCount = submissions?.length ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <main className="flex-grow pt-16 pb-24 px-6 max-w-[1000px] w-full mx-auto">
        <h1 className="font-display font-extrabold text-[32px] text-text-primary mb-2">Dashboard</h1>
        <p className="font-sans font-normal text-[16px] text-text-secondary mb-12">
          Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'there'}
        </p>

        {/* Tabs */}
        <div className="flex w-full border-b border-border mb-8">
          {(['overview', 'submissions', 'account'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 text-center text-[15px] transition-colors cursor-pointer border-b-2 capitalize ${
                activeTab === tab
                  ? 'font-sans font-medium text-text-primary border-primary'
                  : 'font-sans font-normal text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'submissions' ? 'My Submissions' : 'Account'}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="w-full flex flex-col gap-8">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Purchases', value: purchasesCount, icon: ShoppingBag },
                { label: 'Active Subscriptions', value: activeSubsCount, icon: CreditCard },
                { label: 'Submissions', value: submissionsCount, icon: Upload },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-surface border border-border rounded-card p-6 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-[28px] text-text-primary block leading-none mb-1">
                      {stat.value}
                    </span>
                    <span className="font-sans font-normal text-[13px] text-text-secondary">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* My Purchases */}
            <div>
              <h2 className="font-display font-bold text-[20px] text-text-primary mb-4">My Purchases</h2>
              {loadingPurchases ? (
                <div className="flex items-center justify-center py-12 text-text-secondary text-[14px] gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading purchases...
                </div>
              ) : purchases && purchases.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {purchases.map((p) => {
                    const item = p.workflow || p.course;
                    const type = p.workflow ? 'Workflow' : p.course ? 'Course' : 'Template';
                    return (
                      <div
                        key={p.id}
                        className="bg-surface border border-border rounded-card p-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                            {p.workflow ? (
                              <ShoppingBag className="w-4 h-4 text-primary" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-[15px] text-text-primary truncate">
                              {item?.title || 'Unknown Item'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-[6px] h-[18px] rounded-[4px] bg-primary/10 border border-primary/20 text-primary uppercase font-sans font-medium tracking-wide text-[10px]">
                                {type}
                              </span>
                              <span className="font-sans font-normal text-[12px] text-text-tertiary">
                                {formatDate(p.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-display font-bold text-[16px] text-text-primary shrink-0">
                          {formatAmount(p.amount_cents)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-card p-8 text-center">
                  <ShoppingBag className="w-10 h-10 text-text-tertiary mx-auto mb-4" />
                  <p className="font-sans font-normal text-[14px] text-text-secondary mb-4">No purchases yet</p>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="h-[36px] px-5 bg-primary hover:bg-primary-hover text-white font-sans font-medium text-[13px] rounded-input transition-colors cursor-pointer"
                  >
                    Browse Marketplace
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="font-display font-bold text-[20px] text-text-primary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Browse Marketplace', onClick: () => navigate('/marketplace') },
                  { label: 'Submit a Workflow', onClick: () => navigate('/submit') },
                  { label: 'View Pricing', onClick: () => navigate('/pricing') },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="bg-surface border border-border hover:border-primary/40 rounded-card p-5 flex items-center justify-between gap-2 transition-colors cursor-pointer group text-left"
                  >
                    <span className="font-sans font-medium text-[14px] text-text-primary">{action.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: My Submissions */}
        {activeTab === 'submissions' && (
          <div className="w-full">
            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-12 text-text-secondary text-[14px] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading submissions...
              </div>
            ) : submissions && submissions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {submissions.map((s) => {
                  const statusColors: Record<string, string> = {
                    pending: 'border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] text-warning',
                    approved: 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-success',
                    rejected: 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-danger',
                  };
                  return (
                    <div key={s.id} className="bg-surface border border-border rounded-card p-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-display font-bold text-[16px] text-text-primary">{s.title}</h3>
                        <span
                          className={`inline-flex items-center px-[8px] h-[22px] rounded-[4px] border font-sans font-bold text-[11px] uppercase shrink-0 ${
                            statusColors[s.status] || statusColors.pending
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[13px] font-sans text-text-tertiary">
                        <span>{s.category.replace(/_/g, ' ')}</span>
                        <span>·</span>
                        <span>{formatDate(s.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-border bg-surface/50 rounded-card">
                <Upload className="w-12 h-12 text-text-tertiary mb-6" />
                <h3 className="font-display font-bold text-[20px] text-text-secondary mb-2">No submissions yet</h3>
                <p className="font-sans font-normal text-[14px] text-text-tertiary mb-6">
                  Share your workflows with the community
                </p>
                <button
                  onClick={() => navigate('/submit')}
                  className="bg-primary hover:bg-primary-hover text-white h-[40px] px-6 font-sans font-medium text-[14px] rounded-input transition-colors cursor-pointer"
                >
                  Submit a Workflow →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Account */}
        {activeTab === 'account' && (
          <div className="w-full max-w-[600px] flex flex-col gap-6">
            {/* Profile Info */}
            <div className="bg-surface border border-border rounded-card p-6">
              <h2 className="font-display font-bold text-[18px] text-text-primary mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide">Email</span>
                  <p className="font-sans font-normal text-[15px] text-text-primary mt-1">{user?.email}</p>
                </div>
                <div>
                  <span className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide">Full Name</span>
                  <p className="font-sans font-normal text-[15px] text-text-primary mt-1">
                    {profile?.full_name || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide">Member Since</span>
                  <p className="font-sans font-normal text-[15px] text-text-primary mt-1">
                    {profile?.created_at ? formatDate(profile.created_at) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Info */}
            <div className="bg-surface border border-border rounded-card p-6">
              <h2 className="font-display font-bold text-[18px] text-text-primary mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Plan
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide">Current Plan</span>
                  <span className="inline-flex items-center px-[10px] h-[26px] rounded-[6px] bg-primary/10 border border-primary/20 text-primary font-sans font-bold text-[12px] uppercase">
                    {profile?.plan || 'free'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  className="h-[40px] px-5 bg-primary hover:bg-primary-hover text-white font-sans font-medium text-[14px] rounded-input transition-colors cursor-pointer mt-2"
                >
                  {profile?.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="h-[44px] border border-danger/30 bg-danger/5 hover:bg-danger/10 text-danger font-sans font-medium text-[14px] rounded-input transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </main>


    </div>
  );
}
