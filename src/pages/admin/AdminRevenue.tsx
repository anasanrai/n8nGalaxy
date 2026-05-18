import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/formatters';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

interface PurchaseRow {
  id: string;
  user_id: string;
  amount_cents: number | null;
  status: string;
  created_at: string;
  workflows: { title: string } | null;
  courses: { title: string } | null;
}

export default function AdminRevenue() {
  const { data: purchases = [], isLoading } = useQuery<PurchaseRow[]>({
    queryKey: ['admin', 'purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, workflows:workflow_id(title), courses:course_id(title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PurchaseRow[];
    },
  });

  const totalRevenue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
  }, [purchases]);

  const totalPurchases = purchases.length;

  const avgOrderValue = useMemo(() => {
    return totalPurchases ? Math.round(totalRevenue / totalPurchases) : 0;
  }, [totalRevenue, totalPurchases]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    purchases?.forEach(p => {
      const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      months[month] = (months[month] || 0) + (p.amount_cents || 0);
    });
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue: revenue / 100 }));
  }, [purchases]);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { background: 'rgba(16,185,129,0.1)', color: '#10B981' };
      case 'refunded':
        return { background: 'rgba(239,68,68,0.1)', color: '#EF4444' };
      case 'pending':
        return { background: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
      default:
        return { background: 'rgba(107,114,128,0.1)', color: '#6B7280' };
    }
  };

  return (
    <AdminLayout activePage="revenue">
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>Revenue</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-6" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#7C3AED" />
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Total Revenue</p>
          </div>
          <p style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 32, color: '#F4F4F8', lineHeight: 1 }}>
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} color="#10B981" />
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Total Purchases</p>
          </div>
          <p style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 32, color: '#F4F4F8', lineHeight: 1 }}>
            {totalPurchases}
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#F59E0B" />
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>Average Order Value</p>
          </div>
          <p style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 32, color: '#F4F4F8', lineHeight: 1 }}>
            {formatCurrency(avgOrderValue)}
          </p>
        </div>
      </div>

      <div className="rounded-xl p-6 mb-8" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 15, color: '#F4F4F8', marginBottom: 20 }}>
          Monthly Revenue
        </h3>
        {isLoading ? (
          <div style={{ height: 250, background: '#1E1E30', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{ background: '#1E1E30', border: 'none', borderRadius: 8, color: '#F4F4F8', fontSize: 12 }}
                formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                cursor={{ fill: 'rgba(124,58,237,0.08)' }}
              />
              <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1E1E30' }}>
          <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 15, color: '#F4F4F8' }}>
            Purchase History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: '#0D0D14', color: '#6B7280', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {['Date', 'User / Item', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3" style={{ whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center" style={{ color: '#6B7280' }}>Loading…</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center" style={{ color: '#6B7280' }}>No purchases yet.</td></tr>
              ) : purchases.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#13131F' : '#0D0D14', borderTop: '1px solid #1E1E30', height: 52 }}>
                  <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13 }}>
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5" style={{ color: '#F4F4F8', fontSize: 13 }}>
                    {p.workflows?.title ?? p.courses?.title ?? '—'}
                  </td>
                  <td className="px-5" style={{ color: '#F4F4F8', fontWeight: 600, fontSize: 13 }}>
                    {p.amount_cents ? formatCurrency(p.amount_cents) : '—'}
                  </td>
                  <td className="px-5">
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      ...statusStyle(p.status),
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
