import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/formatters';
import { ArrowUpRight, Users, ShoppingBag, BookOpen, DollarSign } from 'lucide-react';

// ── Queries ────────────────────────────────────────────────────────────────────

function useWorkflows() {
  return useQuery<{ status: string }[]>({
    queryKey: ['admin', 'workflows'],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('workflows').select('status');
        return (data ?? []) as { status: string }[];
      } catch {
        return [];
      }
    },
  });
}

function useCourses() {
  return useQuery<{ published: boolean }[]>({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('courses').select('published');
        return (data ?? []) as { published: boolean }[];
      } catch {
        return [];
      }
    },
  });
}

function usePendingSubmissions() {
  return useQuery<number>({
    queryKey: ['admin', 'pending-submissions'],
    queryFn: async () => {
      try {
        const { count } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        return count ?? 0;
      } catch {
        return 0;
      }
    },
  });
}

function usePurchases() {
  return useQuery<{ amount_cents: number | null }[]>({
    queryKey: ['admin', 'purchases-overview'],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('purchases').select('amount_cents');
        return (data ?? []) as { amount_cents: number | null }[];
      } catch {
        return [];
      }
    },
  });
}

function useProfileCount() {
  return useQuery<number>({
    queryKey: ['admin', 'profile-count'],
    queryFn: async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        return count ?? 0;
      } catch {
        return 0;
      }
    },
  });
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AdminOverview() {
  const { data: workflows = [] }      = useWorkflows();
  const { data: courses = [] }        = useCourses();
  const { data: pendingSubmissions }  = usePendingSubmissions();
  const { data: purchases = [] }      = usePurchases();
  const { data: totalUsers }          = useProfileCount();

  const totalWorkflows    = workflows.length;
  const publishedWorkflows = workflows.filter((w) => w.status === 'approved').length;
  const pendingWorkflows  = workflows.filter((w) => w.status === 'draft' || w.status === 'pending').length;

  const totalCourses    = courses.length;
  const publishedCourses = courses.filter((c) => c.published).length;

  const totalRevenue  = purchases.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const totalPurchases = purchases.length;

  return (
    <AdminLayout activePage="overview">
      {/* Page title */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Overview
        </h1>
      </div>

      {/* Migration warning */}
      <div
        className="mb-6 rounded-xl px-5 py-3 text-sm"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}
      >
        Run the migration SQL in <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 4 }}>supabase/migrations/001_marketplace_schema.sql</code> to create all required tables.
      </div>

      {/* Row 1: 4 cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard
          label="Total Workflows"
          value={totalWorkflows}
          valueColor="#7C3AED"
          sub={`${publishedWorkflows} published`}
          icon={<BookOpen size={14} />}
        />
        <MetricCard
          label="Total Courses"
          value={totalCourses}
          valueColor="#00E5C7"
          sub={`${publishedCourses} published`}
          icon={<ShoppingBag size={14} />}
        />
        <MetricCard
          label="Total Users"
          value={totalUsers ?? 0}
          valueColor="#F4F4F8"
          sub="registered"
          icon={<Users size={14} />}
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          valueColor="#F59E0B"
          sub={`${totalPurchases} purchases`}
          icon={<DollarSign size={14} />}
        />
      </section>

      {/* Row 2: 2 cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          label="Pending Submissions"
          value={pendingSubmissions ?? 0}
          valueColor="#F59E0B"
          sub="awaiting review"
          icon={<ShoppingBag size={14} />}
        />
        <MetricCard
          label="Pending Workflows"
          value={pendingWorkflows}
          valueColor="#EF4444"
          sub="need approval"
          icon={<ArrowUpRight size={14} />}
        />
      </section>
    </AdminLayout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  valueColor,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  valueColor: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span style={{ color: valueColor, opacity: 0.6 }}>{icon}</span>}
        <p style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500 }}>{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 36, color: valueColor, lineHeight: 1 }}>
          {value}
        </span>
        {sub && (
          <span className="flex items-center gap-0.5" style={{ color: '#6B7280', fontSize: 12 }}>
            <ArrowUpRight size={12} />
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

// function SkeletonCard() { ... } // kept for reference
