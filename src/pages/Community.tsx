import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { MessageCircle, Video, Mail, ArrowUpRight, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const communityCards = [
  {
    icon: MessageCircle,
    title: 'Discord Community',
    description: 'Real-time chat with fellow n8n builders. Share workflows, ask questions, get feedback, and connect with automation engineers worldwide.',
    cta: 'Join Discord →',
    href: 'https://discord.gg/n8ngalaxy',
    primary: true,
  },
  {
    icon: Video,
    title: 'YouTube Channel',
    description: 'Weekly tutorials, workflow breakdowns, and live build sessions. Subscribe for new automation content every week.',
    cta: 'Subscribe →',
    href: 'https://youtube.com/@n8ngalaxy',
    primary: false,
  },
  {
    icon: Mail,
    title: 'Newsletter',
    description: 'Weekly roundup of the best workflows, n8n tips, and community highlights. Join 1,000+ automation builders.',
    cta: null,
    href: null,
    primary: false,
  },
];

const featuredWorkflows = [
  { title: 'AI Lead Scoring with GPT-4', category: 'AI Agents', slug: 'ai-lead-scoring' },
  { title: 'Slack → Linear Issue Creator', category: 'DevOps', slug: 'slack-linear' },
  { title: 'Cold Email Personalizer', category: 'Sales', slug: 'cold-email-personalizer' },
];

export default function Community() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { data: memberCount } = useQuery<number>({
    queryKey: ['community-member-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      const { error: err } = await (supabase.from('newsletter_signups') as any).insert({
        email,
        source: 'community',
      });
      if (err && err.code !== '23505') throw err; // ignore duplicate
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { value: memberCount ? `${memberCount.toLocaleString()}+` : '2,000+', label: 'Members' },
    { value: '150+', label: 'Workflows Shared' },
    { value: '50+', label: 'Tutorials' },
    { value: '4', label: 'Office Hours/month' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-[96px] pb-[64px] px-6 text-center">
          <div className="max-w-[800px] mx-auto flex flex-col items-center">
            <h1 className="font-display font-extrabold text-[48px] leading-tight mb-4 text-text-primary">
              Join the n8n builder community
            </h1>
            <p className="font-sans font-normal text-[18px] text-text-secondary max-w-[560px] mx-auto">
              Connect with automation builders. Share workflows, get help, and grow together.
            </p>
          </div>
        </section>

        {/* Community cards */}
        <section className="px-6 pb-[64px]">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`bg-surface border rounded-card p-[32px] flex flex-col ${card.primary ? 'border-primary/40' : 'border-border'}`}
                >
                  <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center mb-6 ${card.primary ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <Icon className={`w-[24px] h-[24px] ${card.primary ? 'text-primary' : 'text-primary'}`} />
                  </div>
                  <h3 className="font-display font-extrabold text-[22px] text-text-primary mb-3">
                    {card.title}
                  </h3>
                  <p className="font-sans font-normal text-[15px] text-text-secondary leading-relaxed mb-8 flex-1">
                    {card.description}
                  </p>
                  {card.cta && card.href ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center h-[48px] rounded-input font-sans font-semibold text-[15px] transition-colors ${
                        card.primary
                          ? 'bg-primary hover:bg-primary-hover text-white'
                          : 'bg-surface border border-border hover:border-primary/40 text-text-primary'
                      }`}
                    >
                      {card.cta}
                    </a>
                  ) : (
                    /* Newsletter inline form */
                    submitted ? (
                      <div className="h-[48px] flex items-center justify-center bg-success/10 border border-success/30 text-success rounded-input font-sans font-medium text-[14px]">
                        You're subscribed!
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSignup} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="flex-1 h-[48px] px-4 bg-background border border-border rounded-input text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className="h-[48px] px-4 bg-primary hover:bg-primary-hover text-white rounded-input font-sans font-semibold text-[14px] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                        </button>
                      </form>
                    )
                  )}
                  {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-surface py-[64px] px-6">
          <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-extrabold text-[40px] text-text-primary mb-1">
                  {stat.value}
                </div>
                <div className="font-sans font-normal text-[14px] text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured community workflows */}
        <section className="py-[64px] px-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-bold text-[28px]">Featured Community Workflows</h2>
              <a href="/marketplace" className="flex items-center gap-1 text-primary hover:text-primary-hover font-sans text-[14px] font-medium transition-colors">
                View all <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredWorkflows.map((w) => (
                <a
                  key={w.slug}
                  href={`/workflow/${w.slug}`}
                  className="bg-surface border border-border rounded-card p-6 hover:border-primary/40 transition-colors group"
                >
                  <span className="inline-flex items-center h-[20px] px-2 rounded-[4px] bg-primary/10 border border-primary/20 text-primary font-sans font-medium text-[11px] uppercase tracking-wide mb-4">
                    {w.category}
                  </span>
                  <h3 className="font-display font-bold text-[17px] text-text-primary group-hover:text-primary transition-colors">
                    {w.title}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Submit workflow CTA */}
        <section className="bg-surface py-[64px] px-6">
          <div className="max-w-[600px] mx-auto text-center">
            <h2 className="font-display font-extrabold text-[32px] leading-tight mb-4 text-text-primary">
              Built something cool?
            </h2>
            <p className="font-sans font-normal text-[16px] text-text-secondary mb-8">
              Share your workflow with the n8nGalaxy community. Get featured, get feedback, help others automate.
            </p>
            <a
              href="/submit"
              className="inline-flex items-center justify-center h-[52px] px-8 rounded-input bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[16px] transition-colors"
            >
              Submit Your Workflow →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
