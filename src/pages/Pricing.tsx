import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { openPaddleCheckout } from '../lib/paddle';
import { useAuth } from '../hooks/useAuth';

const plans = [
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For individual builders and freelancers.',
    priceId: import.meta.env.VITE_PADDLE_PRO_PRICE_ID || import.meta.env.VITE_PADDLE_SANDBOX_PRO,
    features: [
      '50+ premium workflows',
      'Access to all courses',
      'Community Discord',
      'Priority email support',
      'Monthly live builds',
      'Workflow vault access',
    ],
    cta: 'Subscribe Pro',
    planKey: 'pro' as const,
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/month',
    description: 'For teams and agencies shipping at scale.',
    priceId: import.meta.env.VITE_PADDLE_AGENCY_PRICE_ID || import.meta.env.VITE_PADDLE_SANDBOX_AGENCY,
    features: [
      'Everything in Pro',
      '200+ premium workflows',
      'Advanced AI agent templates',
      'Client-ready workflows',
      'White-label exports',
      'Direct Slack support',
      'Quarterly strategy call',
      'Early access to new features',
    ],
    cta: 'Subscribe Agency',
    planKey: 'agency' as const,
    featured: true,
  },
];

const freeFeatures = [
  'Basic workflow templates',
  'Community access',
  'Email support (72h)',
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[number]) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!plan.priceId) {
      setCheckoutError('This plan is not yet available for purchase. Email hello@n8ngalaxy.com to sign up.');
      return;
    }

    setLoadingPlan(plan.planKey);
    setCheckoutError(null);

    try {
      await openPaddleCheckout({
        priceId: plan.priceId,
        userId: user!.id,
        userEmail: user!.email ?? '',
        userName: user!.email ?? '',
        customData: {
          user_id: user!.id,
          plan: plan.planKey,
          source: 'pricing',
        },
      });
    } catch (err: any) {
      console.error('Paddle checkout error:', err);
      const msg = err?.message || err?.toString() || 'Unknown error';
      setCheckoutError(`Checkout error: ${msg} — email hello@n8ngalaxy.com if this persists.`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <Navbar />

      <main className="pt-[64px]">
        {/* Hero */}
        <section className="relative py-24 px-6 text-center">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 70%)'
          }}></div>
          <div className="relative z-10 max-w-[640px] mx-auto">
            <h1 className="font-display font-extrabold text-[40px] md:text-[56px] leading-tight text-text-primary mb-4">
              Simple, transparent pricing
            </h1>
            <p className="font-sans font-normal text-[18px] text-text-secondary leading-relaxed">
              Choose the plan that fits your workflow. Upgrade or cancel anytime.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="px-6 pb-24">
          {checkoutError && (
            <div className="max-w-[1000px] mx-auto mb-6 px-5 py-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-[14px] font-sans flex items-start justify-between gap-4">
              <span>{checkoutError}</span>
              <button onClick={() => setCheckoutError(null)} className="shrink-0 text-danger/60 hover:text-danger transition-colors cursor-pointer text-[18px] leading-none">×</button>
            </div>
          )}
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const isLoading = loadingPlan === plan.planKey;
              return (
                <div
                  key={plan.planKey}
                  className="relative rounded-card p-8 flex flex-col"
                  style={{
                    background: '#13131F',
                    border: plan.featured
                      ? '1px solid rgba(124,58,237,0.5)'
                      : '1px solid #1E1E30',
                    boxShadow: plan.featured
                      ? '0 0 40px rgba(124,58,237,0.1), 0 0 80px rgba(124,58,237,0.05)'
                      : undefined,
                  }}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-pill flex items-center gap-1.5" style={{ background: '#7C3AED', border: '1px solid rgba(124,58,237,0.5)' }}>
                      <Zap size={12} className="text-white" />
                      <span className="font-sans font-semibold text-[11px] text-white">Most Popular</span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="font-display font-bold text-[24px] text-text-primary mb-1">{plan.name}</h2>
                    <p className="font-sans font-normal text-[14px] text-text-secondary">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <span className="font-display font-extrabold text-[48px] text-text-primary">{plan.price}</span>
                    <span className="font-sans font-normal text-[16px] text-text-tertiary ml-1">{plan.period}</span>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading}
                    className="w-full h-[48px] rounded-input font-sans font-medium text-[15px] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: plan.featured ? '#7C3AED' : 'transparent',
                      color: plan.featured ? '#FFFFFF' : '#7C3AED',
                      border: plan.featured ? 'none' : '1px solid rgba(124,58,237,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && !plan.featured) {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading && !plan.featured) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Opening checkout...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>

                  <div className="mt-8 flex-grow">
                    <span className="font-sans font-semibold text-[13px] text-text-tertiary uppercase tracking-wider mb-4 block">Includes</span>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check size={16} className="mt-0.5 shrink-0" style={{ color: '#00E5C7' }} />
                          <span className="font-sans font-normal text-[14px] text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sticky comparison */}
        <div className="sticky bottom-0 z-20 border-t" style={{ background: '#0D0D14', borderColor: '#1E1E30' }}>
          <div className="max-w-[1000px] mx-auto px-6 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-[15px] text-text-primary">Free</span>
                <span className="font-sans font-normal text-[13px] text-text-tertiary">— Get started with free workflows</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {freeFeatures.map((f) => (
                  <span key={f} className="flex items-center gap-1.5 font-sans font-normal text-[12px] text-text-tertiary">
                    <Check size={12} style={{ color: '#00E5C7' }} />
                    {f}
                  </span>
                ))}
                <span className="font-sans font-medium text-[12px] text-text-tertiary px-2 py-0.5 rounded-pill" style={{ border: '1px solid #1E1E30' }}>
                  Always free
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust section */}
        <section className="py-16 px-6" style={{ background: '#13131F', borderTop: '1px solid #1E1E30' }}>
          <div className="max-w-[600px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill mb-6" style={{ border: '1px solid #1E1E30' }}>
              <span className="font-sans font-medium text-[12px] text-text-tertiary">Billed monthly. Cancel anytime.</span>
            </div>
            <p className="font-sans font-normal text-[14px] text-text-secondary mb-2">All plans include secure checkout via Paddle</p>
            <p className="font-sans font-normal text-[13px] text-text-tertiary">Your data is safe and never shared</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
