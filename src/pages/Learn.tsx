import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';
import { BookOpen, Lock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

function difficultyStyle(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return { color: '#00E5C7', bg: 'rgba(0,229,199,0.1)', border: 'rgba(0,229,199,0.3)' };
    case 'intermediate':
      return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
    case 'advanced':
      return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
    default:
      return { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)' };
  }
}

export default function Learn() {
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true);

      if (error) throw error;
      return data as Course[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredAndSorted = useMemo(() => {
    if (!courses) return [];

    let result = courses;

    if (activeDifficulty !== 'All') {
      const dbDifficulty = activeDifficulty.toLowerCase();
      result = result.filter((c) => c.difficulty === dbDifficulty);
    }

    result.sort((a, b) => {
      if (a.featured === b.featured) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.featured ? -1 : 1;
    });

    return result;
  }, [courses, activeDifficulty]);

  return (
    <div className="min-h-screen bg-[#0D0D14] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="bg-[#0D0D14] pt-[120px] pb-[64px] px-6 text-center">
          <div className="max-w-[800px] mx-auto flex flex-col items-center">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 12,
                color: '#7C3AED',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              LEARN
            </span>
            <h1
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: 48,
                lineHeight: 1.1,
                color: '#F4F4F8',
                marginBottom: 16,
              }}
            >
              Build real automation skills
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 18,
                color: '#9CA3AF',
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              Step-by-step courses from beginner to advanced. Learn n8n, build workflows, and grow your automation business.
            </p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="px-6 pb-8">
          <div
            style={{
              maxWidth: 860,
              margin: '0 auto',
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {DIFFICULTIES.map((d) => {
              const isActive = activeDifficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setActiveDifficulty(d)}
                  style={{
                    height: 32,
                    padding: '0 16px',
                    borderRadius: 9999,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 13,
                    background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                    border: isActive ? '0.5px solid rgba(124,58,237,0.3)' : '0.5px solid #1E1E30',
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
                  {d}
                </button>
              );
            })}
          </div>
        </section>

        {/* COURSES GRID */}
        <section className="px-6 pb-24">
          {isLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '0.5px',
                background: '#1E1E30',
                maxWidth: 1100,
                margin: '0 auto',
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ height: 280, background: '#13131F' }}
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
                maxWidth: 1100,
                margin: '0 auto',
              }}
            >
              {filteredAndSorted.map((c) => {
                const price =
                  c.price_cents > 0
                    ? `$${(c.price_cents / 100).toFixed(0)}`
                    : 'Free';
                const priceColor =
                  c.price_cents > 0 ? '#F4F4F8' : '#00E5C7';
                const ds = difficultyStyle(c.difficulty);

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/course/${c.slug}`)}
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
                    {/* Badges row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: ds.bg,
                          border: `0.5px solid ${ds.border}`,
                          color: ds.color,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderRadius: 4,
                        }}
                      >
                        {c.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        {(!profile || profile.plan === 'free') && c.price_cents > 0 && (
                          <span className="text-[#6B7280]" title="Premium course">
                            <Lock size={12} />
                          </span>
                        )}
                        {c.featured && (
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: 11,
                              color: '#F59E0B',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: '"Syne", sans-serif',
                        fontWeight: 700,
                        fontSize: 18,
                        color: '#F4F4F8',
                        lineHeight: 1.3,
                        marginBottom: 8,
                      }}
                    >
                      {c.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        color: '#6B7280',
                        lineHeight: 1.5,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 16,
                      }}
                    >
                      {c.description}
                    </p>

                    {/* Bottom row: lesson count + price */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#6B7280',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12,
                        }}
                      >
                        <BookOpen size={14} />
                        <span>{c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
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
                No courses yet. Check back soon!
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
