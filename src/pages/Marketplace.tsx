import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Workflow } from '../types';
import { useAuth } from '../hooks/useAuth';
import { GitBranch, Lock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CATEGORIES = [
  'All',
  'Real Estate',
  'Sales',
  'Finance',
  'Marketing',
  'HR',
  'DevOps',
  'AI Agents',
  'Other',
];

const SORT_OPTIONS = ['Featured', 'Price: Low', 'Price: High', 'Newest'];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('published', true);

      if (error) throw error;
      return data as Workflow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredAndSorted = useMemo(() => {
    if (!workflows) return [];

    let result = workflows;

    if (activeCategory !== 'All') {
      const dbCategory = activeCategory.toLowerCase().replace(' ', '_');
      result = result.filter((w) => w.category === dbCategory);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'Price: Low':
          return a.price_cents - b.price_cents;
        case 'Price: High':
          return b.price_cents - a.price_cents;
        case 'Newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'Featured':
        default:
          if (a.featured === b.featured) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return a.featured ? -1 : 1;
      }
    });

    return result;
  }, [workflows, activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div
        style={{
          height: 48,
          background: '#0D0D14',
          borderBottom: '0.5px solid #1E1E30',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 64,
          zIndex: 40,
          gap: 16,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#9CA3AF',
              fontSize: 13,
            }}
          >
            n8n
          </span>
          <span
            style={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 800,
              color: '#F4F4F8',
              fontSize: 13,
              marginLeft: 2,
            }}
          >
            Galaxy
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            flex: 1,
          }}
          className="scrollbar-hide"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  height: 28,
                  padding: '0 12px',
                  borderRadius: 9999,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  background: isActive
                    ? 'rgba(124,58,237,0.15)'
                    : 'transparent',
                  border: isActive
                    ? '0.5px solid rgba(124,58,237,0.3)'
                    : '0.5px solid #1E1E30',
                  color: isActive ? '#7C3AED' : '#6B7280',
                  cursor: 'pointer',
                  transition: 'color 150ms',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#6B7280';
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={opt}
                value={opt}
                style={{ background: '#13131F', color: '#F4F4F8' }}
              >
                {opt}
              </option>
            ))}
          </select>

          {isAuthenticated ? (
            <div 
              style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E1E30', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#F4F4F8' }}
              onClick={() => navigate('/dashboard')}
            >
              U
            </div>
          ) : (
            <span 
              onClick={() => navigate('/signin')}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}
            >
              Sign in
            </span>
          )}
        </div>
      </div>

      <main className="flex-1 w-full">
        {isLoading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '0.5px',
              background: '#1E1E30',
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 300, background: '#13131F' }}
              />
            ))}
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '0.5px',
              background: '#1E1E30',
            }}
          >
            {filteredAndSorted.map((w) => {
              const price =
                w.price_cents > 0
                  ? `$${(w.price_cents / 100).toFixed(0)}`
                  : 'Free';
              const priceColor =
                w.price_cents > 0 ? '#F4F4F8' : '#00E5C7';

              return (
                <div
                  key={w.id}
                  onClick={() => navigate(`/workflow/${w.slug}`)}
                  style={{
                    background: '#0D0D14',
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'background 150ms',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                  className="group"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#13131F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0D0D14';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 11,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {w.category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      {(!profile || profile.plan === 'free') && w.price_cents > 0 && (
                        <span className="text-[#6B7280]" title="Premium workflow">
                          <Lock size={12} />
                        </span>
                      )}
                      {w.featured && (
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 11,
                            color: '#F59E0B',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    style={{
                      fontFamily: '"Syne", sans-serif',
                      fontWeight: 700,
                      fontSize: 17,
                      color: '#F4F4F8',
                      lineHeight: 1.3,
                      marginBottom: 6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {w.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      color: '#6B7280',
                      lineHeight: 1.5,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {w.description}
                  </p>

                  {w.tools && w.tools.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginTop: 12,
                      }}
                    >
                      {w.tools.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          style={{
                            background: '#13131F',
                            border: '0.5px solid #1E1E30',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 11,
                            color: '#6B7280',
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginTop: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#6B7280',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: 12,
                        }}
                      >
                        {w.node_count} nodes
                      </span>
                      <GitBranch size={10} />
                    </div>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontWeight: 700,
                        fontSize: 16,
                        color: priceColor,
                      }}
                    >
                      {price}
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(19,19,31,0.95) 0%, rgba(19,19,31,0) 60%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingBottom: 20,
                      opacity: 0,
                      transition: 'opacity 150ms',
                      pointerEvents: 'none',
                    }}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 13,
                        color: '#7C3AED',
                      }}
                    >
                      Get template →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6B7280',
                fontSize: 14,
              }}
            >
              No workflows found. Check back soon!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
