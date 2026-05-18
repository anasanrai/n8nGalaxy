import { useNavigate } from 'react-router-dom';
import { ShoppingBag, BookOpen, Users, Zap, Search, CreditCard, Download } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <Navbar />

      <main>
        {/* SECTION 1 - Hero */}
        <section className="relative min-h-[calc(100vh-64px)] pt-[64px] flex items-center justify-center px-6"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,229,199,0.04) 50%, rgba(13,13,20,1) 100%)'
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%)'
          }}></div>

          <div className="relative z-10 w-full max-w-[720px] mx-auto text-center flex flex-col items-center">
            {/* Headline */}
            <h1 className="font-display font-extrabold text-[40px] md:text-[64px] leading-tight text-text-primary mb-6">
              The n8n ecosystem
              <br />
              <span className="text-text-primary">hub for builders</span>
            </h1>

            {/* Subheadline */}
            <p className="font-sans font-normal text-[18px] text-text-secondary max-w-[600px] mx-auto leading-relaxed mb-10">
              Marketplace, learn, community, and pricing — everything you need to build and scale with n8n.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center mb-10">
              <button
                onClick={() => navigate('/marketplace')}
                className="h-[48px] px-7 bg-primary hover:bg-primary-hover text-white font-sans font-medium text-[16px] rounded-input transition-colors cursor-pointer"
              >
                Browse Marketplace
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="h-[48px] px-7 bg-surface border border-border hover:bg-border text-text-primary font-sans font-medium text-[16px] rounded-input transition-colors cursor-pointer"
              >
                View Pricing
              </button>
            </div>

            {/* Trust markers */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-text-tertiary font-sans font-normal text-[13px]">
              <span>No subscription required</span>
              <span className="hidden sm:inline">·</span>
              <span>Cancel anytime</span>
              <span className="hidden sm:inline">·</span>
              <span>Instant delivery</span>
            </div>
          </div>
        </section>

        {/* SECTION 2 - Stats bar */}
        <section className="bg-surface border-y border-border py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-border">
              {[
                { number: '50+', label: 'Workflows' },
                { number: '500+', label: 'Community Members' },
                { number: '10+', label: 'Courses' },
                { number: '100%', label: 'Satisfaction Rate' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center px-4">
                  <span className="font-display font-extrabold text-[32px] text-text-primary mb-1">{stat.number}</span>
                  <span className="font-sans font-normal text-[14px] text-text-secondary">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3 - Product cards */}
        <section className="py-[96px] px-6 max-w-[1200px] mx-auto">
          <div className="text-center w-full mb-16">
            <span className="block font-sans font-medium text-[12px] text-primary tracking-[0.1em] uppercase mb-4">WHAT WE OFFER</span>
            <h2 className="font-display font-extrabold text-[40px] text-text-primary mb-4">Four ways to build with n8n</h2>
            <p className="font-sans font-normal text-[16px] text-text-secondary">Every product feeds the next.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Card 1 - Marketplace */}
            <div className="bg-surface border border-border rounded-card p-8 flex flex-col h-full items-start group">
              <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center mb-6">
                <ShoppingBag className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-[20px] text-text-primary mb-3">Workflow Marketplace</h3>
              <p className="font-sans font-normal text-[15px] text-text-secondary leading-relaxed mb-6 flex-grow">
                Buy production-ready n8n workflow templates. Real estate, sales, finance, AI agents. Download JSON, import, done.
              </p>
              <div className="flex items-center justify-between w-full mt-auto">
                <span className="font-sans font-medium text-[13px] text-accent">From $29</span>
                <button onClick={() => navigate('/marketplace')} className="font-sans font-medium text-[14px] text-primary hover:underline cursor-pointer flex items-center">
                  Browse templates <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* Card 2 - Learn */}
            <div className="bg-surface border border-border rounded-card p-8 flex flex-col h-full items-start group">
              <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-[20px] text-text-primary mb-3">Learn & Courses</h3>
              <p className="font-sans font-normal text-[15px] text-text-secondary leading-relaxed mb-6 flex-grow">
                Step-by-step courses from beginner to advanced. Free and Pro tracks available.
              </p>
              <div className="flex items-center justify-between w-full mt-auto">
                <span className="font-sans font-medium text-[13px] text-accent">Free & Pro</span>
                <button onClick={() => navigate('/learn')} className="font-sans font-medium text-[14px] text-primary hover:underline cursor-pointer flex items-center">
                  Start learning <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* Card 3 - Community */}
            <div className="bg-surface border border-border rounded-card p-8 flex flex-col h-full items-start group">
              <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center mb-6">
                <Users className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-[20px] text-text-primary mb-3">Community</h3>
              <p className="font-sans font-normal text-[15px] text-text-secondary leading-relaxed mb-6 flex-grow">
                Join Discord, follow on YouTube, connect on Twitter. The n8n builder network.
              </p>
              <div className="flex items-center justify-between w-full mt-auto">
                <span className="font-sans font-medium text-[13px] text-accent">Free to join</span>
                <button onClick={() => navigate('/community')} className="font-sans font-medium text-[14px] text-primary hover:underline cursor-pointer flex items-center">
                  Join community <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            {/* Card 4 - Pricing (highlighted) */}
            <div className="bg-surface border border-accent/25 rounded-card p-8 flex flex-col h-full items-start group relative shadow-[0_0_40px_rgba(0,229,199,0.05)]">
              <div className="w-12 h-12 rounded-xl border border-accent/20 bg-accent/10 flex items-center justify-center mb-6">
                <Zap className="text-accent w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-[20px] text-text-primary mb-3">Pro & Agency Plans</h3>
              <p className="font-sans font-normal text-[15px] text-text-secondary leading-relaxed mb-6 flex-grow">
                Unlock premium workflows, priority support, and advanced courses. Paddle-powered subscriptions.
              </p>
              <div className="flex items-center justify-between w-full mt-auto">
                <span className="font-sans font-medium text-[13px] text-accent">From $29/mo</span>
                <button onClick={() => navigate('/pricing')} className="font-sans font-medium text-[14px] text-primary hover:underline cursor-pointer flex items-center">
                  See plans <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - How it works */}
        <section className="bg-surface py-[96px] px-6">
          <div className="max-w-[1200px] mx-auto w-full">
            <div className="text-center w-full mb-16">
              <span className="block font-sans font-medium text-[12px] text-primary tracking-[0.1em] uppercase mb-4">HOW IT WORKS</span>
              <h2 className="font-display font-extrabold text-[40px] text-text-primary mb-4">Three steps to ship</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 w-full relative">
              {/* Dashed line connector behind items */}
              <div className="hidden lg:block absolute top-[64px] left-[15%] right-[15%] h-[1px] border-t border-dashed border-border z-0"></div>

              {[
                {
                  icon: <Search className="w-8 h-8 text-primary" />,
                  title: 'Browse',
                  body: 'Find the perfect workflow template or course for your use case.'
                },
                {
                  icon: <CreditCard className="w-8 h-8 text-primary" />,
                  title: 'Purchase',
                  body: 'One-time purchase or subscribe for unlimited access. Instant checkout.'
                },
                {
                  icon: <Download className="w-8 h-8 text-primary" />,
                  title: 'Build',
                  body: 'Download the JSON, import into n8n, and start automating in minutes.'
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center flex-1 text-center relative z-10 bg-surface">
                  <span className="font-sans font-medium text-[12px] text-primary mb-4 bg-surface px-2">0{i + 1}</span>
                  <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="font-display font-bold text-[18px] text-text-primary mb-3">{step.title}</h3>
                  <p className="font-sans font-normal text-[14px] text-text-secondary leading-relaxed max-w-[280px]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 - CTA banner */}
        <section className="py-[96px] px-6 w-full text-center">
          <h2 className="font-display font-extrabold text-[48px] text-text-primary mb-4">Ready to build?</h2>
          <p className="font-sans font-normal text-[18px] text-text-secondary mb-10">Start with a free workflow. No credit card needed.</p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <button
              onClick={() => navigate('/marketplace')}
              className="h-[48px] px-7 bg-primary hover:bg-primary-hover text-white font-sans font-medium text-[16px] rounded-input transition-colors cursor-pointer"
            >
              Browse Marketplace
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="h-[48px] px-7 bg-surface border border-border hover:bg-border text-text-primary font-sans font-medium text-[16px] rounded-input transition-colors cursor-pointer"
            >
              View Pricing
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
