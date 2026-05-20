import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { openPaddleCheckout } from '../lib/paddle';
import { BookOpen, Check, ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import type { Course, Purchase } from '../types';

const DIFFICULTY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  beginner: { color: '#00E5C7', bg: 'rgba(0,229,199,0.1)', border: 'rgba(0,229,199,0.3)' },
  intermediate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  advanced: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as Course;
    },
    enabled: !!slug,
  });

  const { data: purchase } = useQuery({
    queryKey: ['course-purchase', course?.id, user?.id],
    queryFn: async () => {
      if (!user || !course) return null;
      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .maybeSingle();
      return data as Purchase | null;
    },
    enabled: !!user && !!course,
  });

  const handleBuy = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (purchase) return;

    if (profile?.plan === 'free' && course && course.price_cents > 0) {
      navigate('/pricing');
      return;
    }

    const priceId = course?.paddle_price_id;
    if (!priceId) {
      alert('Price not configured for this course');
      return;
    }
    try {
      await openPaddleCheckout({
        priceId,
        userId: user.id,
        userEmail: user.email || '',
        userName: profile?.full_name || '',
        customData: {
          user_id: user.id,
          course_id: course?.id || '',
          type: 'course',
        },
      });
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const ds = course ? DIFFICULTY_STYLES[course.difficulty] || DIFFICULTY_STYLES.beginner : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-[144px] px-6 max-w-[1200px] mx-auto w-full flex justify-center bg-[#0D0D14]">
          <Loader2 className="w-12 h-12 text-[#7C3AED] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display font-bold text-[32px] text-[#F4F4F8] mb-4">Course not found</h1>
        <Link to="/learn" className="text-[#7C3AED] hover:underline font-sans font-medium text-[16px]">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  const lessonList = course.lessons || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[144px] pb-[96px] px-6 bg-[#0D0D14]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative items-start">
          {/* Left Column */}
          <div className="w-full lg:w-[60%] lg:shrink-0 flex flex-col relative">
            <Link
              to="/learn"
              className="inline-block font-sans font-normal text-[14px] text-[#6B7280] hover:text-[#F4F4F8] transition-colors mb-8 w-fit"
            >
              ← Back to Learn
            </Link>

            <div className="flex flex-wrap gap-2 mb-3">
              {ds && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    background: ds.bg,
                    border: `0.5px solid ${ds.border}`,
                    color: ds.color,
                    borderRadius: 4,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {course.difficulty}
                </span>
              )}
              {course.featured && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    background: 'rgba(124,58,237,0.15)',
                    border: '0.5px solid rgba(124,58,237,0.3)',
                    color: '#7C3AED',
                    borderRadius: 4,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Featured
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: 40,
                lineHeight: 1.15,
                color: '#F4F4F8',
                marginTop: 12,
              }}
            >
              {course.title}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#6B7280',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                marginTop: 16,
              }}
            >
              <BookOpen size={16} />
              <span>{course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
            </div>

            {course.description && (
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  color: '#9CA3AF',
                  lineHeight: 1.7,
                  marginTop: 24,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {course.description}
              </div>
            )}

            <hr
              style={{
                width: '100%',
                border: 'none',
                borderTop: '0.5px solid #1E1E30',
                marginTop: 32,
                marginBottom: 32,
              }}
            />

            {/* What you'll learn */}
            <h3
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: '#F4F4F8',
                marginBottom: 16,
              }}
            >
              What you'll learn
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                'Build complete n8n automations from scratch',
                'Integrate AI and LLMs into your workflows',
                'Handle errors and edge cases like a pro',
                'Use webhooks, APIs, and databases in n8n',
                'Deploy and monitor production workflows',
              ].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Check size={16} style={{ color: '#00E5C7', flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 15,
                      color: '#9CA3AF',
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Lessons */}
            <h3
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: '#F4F4F8',
                marginBottom: 16,
              }}
            >
              Course lessons
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: '0.5px solid #1E1E30',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {lessonList.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    color: '#6B7280',
                    textAlign: 'center',
                  }}
                >
                  Lessons coming soon.
                </div>
              ) : (
                lessonList.map((lesson, index) => {
                  const isOpen = expandedLesson === index;
                  return (
                    <div key={lesson.id || index}>
                      <button
                        onClick={() => setExpandedLesson(isOpen ? null : index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '14px 20px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: index < lessonList.length - 1 ? '0.5px solid #1E1E30' : 'none',
                          cursor: 'pointer',
                          transition: 'background 150ms',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#13131F'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'rgba(124,58,237,0.12)',
                              border: '0.5px solid rgba(124,58,237,0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              fontSize: 12,
                              color: '#7C3AED',
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </span>
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: 14,
                              color: '#F4F4F8',
                              textAlign: 'left' as const,
                            }}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: 12,
                              color: '#6B7280',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {lesson.duration}
                          </span>
                          {isOpen ? (
                            <ChevronUp size={14} color="#6B7280" />
                          ) : (
                            <ChevronDown size={14} color="#6B7280" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div
                          style={{
                            padding: '0 20px 14px 56px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            color: '#9CA3AF',
                            lineHeight: 1.6,
                            borderBottom: index < lessonList.length - 1 ? '0.5px solid #1E1E30' : 'none',
                          }}
                        >
                          {lesson.description}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="w-full lg:w-[40%] flex justify-center lg:justify-end shrink-0 sticky lg:top-[96px]">
            <div
              style={{
                width: '100%',
                maxWidth: 400,
                background: '#13131F',
                border: '0.5px solid #1E1E30',
                borderRadius: 12,
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontWeight: 800,
                    fontSize: 48,
                    color: '#F4F4F8',
                  }}
                >
                  {course.price_cents === 0 ? 'Free' : `$${(course.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: course.price_cents % 100 === 0 ? 0 : 2 })}`}
                </span>
                {course.price_cents > 0 && (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      color: '#6B7280',
                      marginTop: 4,
                    }}
                  >
                    One-time purchase. Lifetime access.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)} level
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280' }}>
                <BookOpen size={14} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                  {course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '0.5px solid #1E1E30', width: '100%' }} />

              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Full lifetime access to all lessons',
                  'Step-by-step video walkthroughs',
                  'Downloadable workflow files',
                  'Free updates when new content is added',
                ].map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Check size={16} style={{ color: '#7C3AED', marginTop: 2, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 14,
                        color: '#9CA3AF',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div style={{ width: '100%', paddingTop: 16 }}>
                <button
                  onClick={handleBuy}
                  disabled={!!purchase}
                  style={{
                    width: '100%',
                    height: 52,
                    borderRadius: 8,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: purchase ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: purchase
                      ? '#13131F'
                      : course.price_cents === 0
                        ? '#00E5C7'
                        : '#7C3AED',
                    color: purchase
                      ? '#6B7280'
                      : course.price_cents === 0
                        ? '#0D0D14'
                        : '#FFFFFF',
                    border: purchase ? '0.5px solid #1E1E30' : 'none',
                  }}
                >
                  {purchase ? 'Enrolled' : course.price_cents === 0 ? 'Enroll Free' : 'Enroll Now'}
                </button>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 12,
                    color: '#6B7280',
                  }}
                >
                  <ShieldCheck size={12} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                    Secure checkout via Paddle
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
