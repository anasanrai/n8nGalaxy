import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Download } from 'lucide-react';

type PlanFilter = 'all' | 'free' | 'pro' | 'agency';

interface WaitlistEntry {
  id: string;
  email: string;
  plan_interest: string;
  use_case: string | null;
  created_at: string;
}

interface NewsletterEntry {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

export default function AdminWaitlist() {
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [tab, setTab] = useState<'waitlist' | 'newsletter'>('waitlist');

  const { data: waitlist = [], isLoading: loadingWaitlist } = useQuery<WaitlistEntry[]>({
    queryKey: ['admin', 'waitlist', planFilter],
    queryFn: async () => {
      let q = (supabase.from('pricing_waitlist') as any).select('*').order('created_at', { ascending: false });
      if (planFilter !== 'all') q = q.eq('plan_interest', planFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: newsletter = [], isLoading: loadingNewsletter } = useQuery<NewsletterEntry[]>({
    queryKey: ['admin', 'newsletter'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('newsletter_signups') as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const exportCSV = (rows: { email: string }[], filename: string) => {
    const csv = ['email', ...rows.map((r) => r.email)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const planColors: Record<string, string> = {
    free:   'rgba(16,185,129,0.15)',
    pro:    'rgba(124,58,237,0.15)',
    agency: 'rgba(245,158,11,0.15)',
  };
  const planTextColors: Record<string, string> = {
    free:   '#10B981',
    pro:    '#7C3AED',
    agency: '#F59E0B',
  };

  return (
    <AdminLayout activePage="waitlist">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Waitlist & Newsletter
        </h1>
        <button
          onClick={() =>
            tab === 'waitlist'
              ? exportCSV(waitlist, 'waitlist.csv')
              : exportCSV(newsletter, 'newsletter.csv')
          }
          className="flex items-center gap-2 h-[36px] px-4 rounded-lg text-[13px] font-medium cursor-pointer transition-colors"
          style={{ background: '#13131F', color: '#9CA3AF', border: '1px solid #1E1E30' }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {(['waitlist', 'newsletter'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="h-[32px] px-4 rounded-lg text-[12px] font-medium capitalize transition-colors cursor-pointer"
            style={tab === t
              ? { background: '#7C3AED', color: '#fff' }
              : { background: '#13131F', color: '#9CA3AF', border: '1px solid #1E1E30' }}
          >
            {t === 'waitlist' ? `Pricing Waitlist (${waitlist.length})` : `Newsletter (${newsletter.length})`}
          </button>
        ))}
      </div>

      {/* Waitlist tab */}
      {tab === 'waitlist' && (
        <>
          <div className="flex gap-2 mb-4">
            {(['all', 'free', 'pro', 'agency'] as PlanFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setPlanFilter(f)}
                className="h-[28px] px-3 rounded-lg text-[11px] font-medium capitalize transition-colors cursor-pointer"
                style={planFilter === f
                  ? { background: '#7C3AED', color: '#fff' }
                  : { background: '#0D0D14', color: '#6B7280', border: '1px solid #1E1E30' }}
              >
                {f}
              </button>
            ))}
          </div>

          {loadingWaitlist ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
              <Loader2 size={18} className="animate-spin" /> Loading...
            </div>
          ) : waitlist.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#6B7280' }}>No entries yet.</div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1E1E30' }}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: '#0D0D14', borderBottom: '1px solid #1E1E30' }}>
                    {['Email', 'Plan', 'Use Case', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((entry, i) => (
                    <tr
                      key={entry.id}
                      style={{
                        background: i % 2 === 0 ? '#13131F' : '#0D0D14',
                        borderBottom: '1px solid #1E1E30',
                      }}
                    >
                      <td className="px-4 py-3" style={{ color: '#F4F4F8' }}>{entry.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 h-[20px] rounded text-[10px] font-bold uppercase"
                          style={{
                            background: planColors[entry.plan_interest] ?? 'rgba(156,163,175,0.15)',
                            color: planTextColors[entry.plan_interest] ?? '#9CA3AF',
                          }}
                        >
                          {entry.plan_interest}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[280px] truncate" style={{ color: '#9CA3AF' }}>
                        {entry.use_case || '—'}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#6B7280' }}>{formatDate(entry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Newsletter tab */}
      {tab === 'newsletter' && (
        <>
          {loadingNewsletter ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
              <Loader2 size={18} className="animate-spin" /> Loading...
            </div>
          ) : newsletter.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#6B7280' }}>No subscribers yet.</div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1E1E30' }}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: '#0D0D14', borderBottom: '1px solid #1E1E30' }}>
                    {['Email', 'Source', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {newsletter.map((entry, i) => (
                    <tr
                      key={entry.id}
                      style={{
                        background: i % 2 === 0 ? '#13131F' : '#0D0D14',
                        borderBottom: '1px solid #1E1E30',
                      }}
                    >
                      <td className="px-4 py-3 flex items-center gap-2" style={{ color: '#F4F4F8' }}>
                        <Mail size={13} style={{ color: '#7C3AED' }} />
                        {entry.email}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#9CA3AF' }}>{entry.source}</td>
                      <td className="px-4 py-3" style={{ color: '#6B7280' }}>{formatDate(entry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
