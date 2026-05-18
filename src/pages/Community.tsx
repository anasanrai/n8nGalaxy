import { MessageCircle, Video, Mail } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const communityCards = [
  {
    icon: MessageCircle,
    title: 'Discord Community',
    description: 'Real-time chat with fellow n8n builders. Share workflows, ask questions, get feedback.',
    cta: 'Join Discord \u2192',
    href: '#',
  },
  {
    icon: Video,
    title: 'YouTube Channel',
    description: 'Weekly tutorials, workflow breakdowns, and live build sessions. New content every week.',
    cta: 'Subscribe \u2192',
    href: '#',
  },
  {
    icon: Mail,
    title: 'Email Newsletter',
    description: 'Weekly roundup of the best workflows, tips, and community highlights. No spam, ever.',
    cta: 'Subscribe \u2192',
    href: '#',
  },
];

const stats = [
  { value: '2,000+', label: 'Members' },
  { value: '150+', label: 'Workflows Shared' },
  { value: '50+', label: 'Tutorials' },
  { value: '4', label: 'Office Hours/month' },
];

export default function Community() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-[80px] pb-[64px] px-6 text-center">
          <div className="max-w-[800px] mx-auto flex flex-col items-center">
            <h1 className="font-display font-extrabold text-[48px] leading-tight mb-4 text-text-primary">
              Join the n8n builder community
            </h1>
            <p className="font-sans font-normal text-[18px] text-text-secondary max-w-[600px] mx-auto">
              Connect with 2,000+ automation builders. Share workflows, get help, and grow together.
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
                  className="bg-surface border border-border rounded-card p-[32px] flex flex-col"
                >
                  <div className="w-[48px] h-[48px] rounded-[12px] bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-[24px] h-[24px] text-primary" />
                  </div>
                  <h3 className="font-display font-extrabold text-[22px] text-text-primary mb-3">
                    {card.title}
                  </h3>
                  <p className="font-sans font-normal text-[15px] text-text-secondary leading-relaxed mb-8 flex-1">
                    {card.description}
                  </p>
                  <a
                    href={card.href}
                    className="inline-flex items-center justify-center h-[48px] rounded-input bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[15px] transition-colors"
                  >
                    {card.cta}
                  </a>
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

        {/* Join CTA */}
        <section className="py-[80px] px-6 text-center">
          <div className="max-w-[600px] mx-auto flex flex-col items-center">
            <h2 className="font-display font-extrabold text-[36px] leading-tight mb-4 text-text-primary">
              Ready to build with us?
            </h2>
            <p className="font-sans font-normal text-[18px] text-text-secondary mb-8">
              The n8nGalaxy community is free to join. Start connecting today.
            </p>
            <a
              href="#"
              className="inline-flex items-center justify-center h-[52px] px-8 rounded-input bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[16px] transition-colors"
            >
              Join Discord
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
