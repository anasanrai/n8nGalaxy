import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../lib/formatters';
import { Search, Shield, ShieldOff } from 'lucide-react';
import type { Profile } from '../../types';

const PAGE_SIZE = 20;

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(124,58,237,0.15)', color: '#7C3AED' },
  user:  { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
};

const PLAN_STYLES: Record<string, { bg: string; color: string }> = {
  free:   { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
  pro:    { bg: 'rgba(124,58,237,0.15)', color: '#7C3AED' },
  agency: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
};

function StatusBadge({ value, styles }: { value: string; styles: Record<string, { bg: string; color: string }> }) {
  const s = styles[value] ?? styles.user;
  return (
    <span
      style={{
        ...s,
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </span>
  );
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const toggleRole = async (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        (p.full_name ?? '').toLowerCase().includes(q),
    );
  }, [profiles, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page],
  );

  return (
    <AdminLayout activePage="users">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Users
        </h1>
        <div className="relative">
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}
          />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by email or name…"
            style={{
              width: 260,
              height: 36,
              padding: '0 12px 0 32px',
              borderRadius: 8,
              border: '1px solid #1E1E30',
              background: '#13131F',
              color: '#F4F4F8',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: '#0D0D14', color: '#6B7280', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {['Name', 'Email', 'Role', 'Plan', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3" style={{ whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                    Loading users…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                    No users found
                  </td>
                </tr>
              ) : paged.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ background: i % 2 === 0 ? '#13131F' : '#0D0D14', borderTop: '1px solid #1E1E30', height: 48 }}
                >
                  <td className="px-5" style={{ color: '#F4F4F8', fontSize: 13, fontWeight: 500 }}>
                    {p.full_name ?? '—'}
                  </td>
                  <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13 }}>{p.email}</td>
                  <td className="px-5"><StatusBadge value={p.role} styles={ROLE_STYLES} /></td>
                  <td className="px-5"><StatusBadge value={p.plan} styles={PLAN_STYLES} /></td>
                  <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13 }}>{formatRelativeTime(p.created_at)}</td>
                  <td className="px-5">
                    <button
                      onClick={() => toggleRole(p)}
                      title={p.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                      style={{
                        height: 28,
                        width: 28,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: p.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
                        color: p.role === 'admin' ? '#EF4444' : '#7C3AED',
                      }}
                    >
                      {p.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span style={{ color: '#6B7280', fontSize: 12 }}>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid #1E1E30',
                background: '#13131F',
                color: page === 0 ? '#4B5563' : '#F4F4F8',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid #1E1E30',
                background: '#13131F',
                color: page >= totalPages - 1 ? '#4B5563' : '#F4F4F8',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
