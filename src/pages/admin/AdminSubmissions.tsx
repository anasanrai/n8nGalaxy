import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import type { Submission } from '../../types';
import { Loader2, Check, X, Clock } from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  approved: { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  pending:  { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  rejected: { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
};

export default function AdminSubmissions() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [actioning, setActioning] = useState<string | null>(null);

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ['admin', 'submissions', statusFilter],
    queryFn: async () => {
      let q = supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Submission[];
    },
  });

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActioning(id);
    try {
      await (supabase.from('submissions') as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      qc.invalidateQueries({ queryKey: ['admin', 'submissions'] });
    } finally {
      setActioning(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filters: StatusFilter[] = ['pending', 'approved', 'rejected', 'all'];

  return (
    <AdminLayout activePage="submissions">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Submissions
        </h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className="h-[32px] px-4 rounded-lg text-[12px] font-medium capitalize transition-colors cursor-pointer"
            style={statusFilter === f
              ? { background: '#7C3AED', color: '#fff' }
              : { background: '#13131F', color: '#9CA3AF', border: '1px solid #1E1E30' }}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading...
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No {statusFilter === 'all' ? '' : statusFilter} submissions.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((s) => {
            const style = STATUS_STYLES[s.status] ?? STATUS_STYLES.pending;
            return (
              <div
                key={s.id}
                className="p-5 rounded-xl"
                style={{ background: '#13131F', border: '1px solid #1E1E30' }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 style={{ color: '#F4F4F8', fontWeight: 700, fontSize: 16 }}>{s.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span style={{ color: '#6B7280', fontSize: 12 }}>
                        {s.category.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: '#374151', fontSize: 12 }}>·</span>
                      <span style={{ color: '#6B7280', fontSize: 12 }}>{formatDate(s.created_at)}</span>
                    </div>
                    {s.description && (
                      <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8, maxWidth: 560 }}>
                        {s.description}
                      </p>
                    )}
                    {s.tools?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {s.tools.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[11px]"
                            style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.file_url && (
                      <a
                        href={s.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-[12px] text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                      >
                        View file →
                      </a>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center px-2 h-[22px] rounded text-[11px] font-bold uppercase shrink-0"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {s.status}
                  </span>
                </div>

                {s.status === 'pending' && (
                  <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #1E1E30' }}>
                    <button
                      onClick={() => updateStatus(s.id, 'approved')}
                      disabled={actioning === s.id}
                      className="flex items-center gap-1.5 h-[32px] px-4 rounded-lg text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      {actioning === s.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, 'rejected')}
                      disabled={actioning === s.id}
                      className="flex items-center gap-1.5 h-[32px] px-4 rounded-lg text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <X size={12} />
                      Reject
                    </button>
                  </div>
                )}

                {s.status === 'approved' && (
                  <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid #1E1E30' }}>
                    <Check size={13} style={{ color: '#10B981' }} />
                    <span style={{ color: '#10B981', fontSize: 12 }}>Approved — workflow has been added to marketplace</span>
                  </div>
                )}

                {s.status === 'rejected' && (
                  <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid #1E1E30' }}>
                    <Clock size={13} style={{ color: '#6B7280' }} />
                    <span style={{ color: '#6B7280', fontSize: 12 }}>Rejected</span>
                    <button
                      onClick={() => updateStatus(s.id, 'pending')}
                      className="ml-2 text-[11px] text-[#7C3AED] hover:text-[#6D28D9] underline cursor-pointer"
                    >
                      Reopen
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
