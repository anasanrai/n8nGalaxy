import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, Users, DollarSign, ShoppingBag, BookOpen, LogOut, FileText, Inbox, Mail, Settings } from 'lucide-react';

type ActivePage = 'overview' | 'workflows' | 'courses' | 'users' | 'revenue' | 'blog' | 'submissions' | 'waitlist' | 'settings';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: ActivePage;
}

const navItems: { page: ActivePage; label: string; icon: React.ReactNode; path: string }[] = [
  { page: 'overview',     label: 'Overview',     icon: <LayoutDashboard size={16} />, path: '/admin' },
  { page: 'workflows',    label: 'Workflows',    icon: <ShoppingBag size={16} />,     path: '/admin/workflows' },
  { page: 'courses',      label: 'Courses',      icon: <BookOpen size={16} />,        path: '/admin/courses' },
  { page: 'blog',         label: 'Blog Posts',   icon: <FileText size={16} />,        path: '/admin/blog' },
  { page: 'submissions',  label: 'Submissions',  icon: <Inbox size={16} />,           path: '/admin/submissions' },
  { page: 'users',        label: 'Users',        icon: <Users size={16} />,           path: '/admin/users' },
  { page: 'revenue',      label: 'Revenue',      icon: <DollarSign size={16} />,      path: '/admin/revenue' },
  { page: 'waitlist',     label: 'Waitlist',     icon: <Mail size={16} />,            path: '/admin/waitlist' },
  { page: 'settings',     label: 'Settings',     icon: <Settings size={16} />,        path: '/admin/settings' },
];

export default function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#0D0D14]">
      <aside
        className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
        style={{ background: '#0D0D14', borderRight: '1px solid #1E1E30' }}
      >
        <div className="px-5 py-6 flex items-center gap-3" style={{ borderBottom: '1px solid #1E1E30' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <img src="/n8ngalaxy_logo.png" alt="n8nGalaxy" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#9CA3AF', fontSize: 18 }}>
              n8n
            </span>
            <span
              style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, color: '#7C3AED', fontSize: 18, marginLeft: 2 }}
            >
              Galaxy
            </span>
          </div>
          <span
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ADMIN
          </span>
        </div>

        <div className="px-5 pt-5 pb-2">
          <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
            MAIN
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ page, label, icon, path }) => {
            const isActive = activePage === page;
            return (
              <Link
                key={page}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  ...(isActive
                    ? {
                        background: 'rgba(124,58,237,0.12)',
                        color: '#7C3AED',
                        borderLeft: '3px solid #7C3AED',
                      }
                    : {
                        color: '#9CA3AF',
                        background: 'transparent',
                      }),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = '#13131F';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-5" style={{ borderTop: '1px solid #1E1E30' }}>
          <div className="flex items-center justify-between">
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>Admin</span>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{ color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none', padding: 4, borderRadius: 4 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#EF4444')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#6B7280')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-60 flex-1 p-6 min-h-screen bg-[#0D0D14]">
        {children}
      </main>
    </div>
  );
}
