import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Loader2, Check, Zap, Building2, Gift } from 'lucide-react';

const PLANS = [
  { id: 'free',   label: 'Free',   desc: 'Browse & download free workflows',       icon: Gift },
  { id: 'pro',    label: 'Pro',    desc: 'Full access to all premium workflows',    icon: Zap },
  { id: 'agency', label: 'Agency', desc: 'Team access + commercial usage rights',  icon: Building2 },
];

export default function Pricing() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro' | 'agency'>('pro');
  const [useCase, setUseCase] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const { error } = await (supabase.from('pricing_waitlist') as any).insert({
        email: email.trim().toLowerCase(),
        plan_interest: plan,
        use_case: useCase.trim() || null,
      });
      if (error && error.code !== '23505') throw error;
      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <Navbar />

      <main className="pt-[96px] pb-24 px-6">
        {/* Hero */}
        <div className="text-center mb-14 max-w-[600px] mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 h-[28px] rounded-full bg-primary/10 border border-primary/20 text-primary font-sans font-medium text-[12px] uppercase tracking-wider mb-6">
            <Zap className="w-3 h-3" />
            Paid Plans Coming Soon
          </span>
          <h1 className="font-display font-extrabold text-[40px] md:text-[52px] leading-tight text-text-primary mb-4">
            Simple, transparent pricing
          </h1>
          <p className="font-sans font-normal text-[18px] text-text-secondary leading-relaxed">
            We're finalising our plans. Join the waitlist and get early access + a special launch discount.
          </p>
        </div>

        {/* Plan preview cards */}
        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {PLANS.map(({ id, label, desc, icon: Icon }) => (
            <div
              key={id}
              className={`rounded-xl p-6 border transition-colors ${
                id === 'pro'
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-[20px] text-text-primary mb-1">{label}</h3>
              <p className="font-sans text-[14px] text-text-secondary mb-4">{desc}</p>
              <span className="font-display font-bold text-[28px] text-text-primary">
                {id === 'free' ? 'Free' : 'Coming soon'}
              </span>
            </div>
          ))}
        </div>

        {/* Waitlist form */}
        <div className="max-w-[520px] mx-auto">
          <div className="bg-surface border border-border rounded-2xl p-8">
            {status === 'done' ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-display font-bold text-[20px] text-text-primary mb-2">You're on the list!</h3>
                <p className="font-sans text-[15px] text-text-secondary">
                  We'll email you when paid plans launch — with an exclusive early-bird discount.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display font-bold text-[22px] text-text-primary mb-1">Join the waitlist</h2>
                <p className="font-sans text-[14px] text-text-secondary mb-6">
                  Get notified first + unlock an early-bird deal.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide mb-1.5 block">
                      Email address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-[44px] px-4 bg-background border border-border rounded-input font-sans text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide mb-2 block">
                      Which plan interests you?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLANS.map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPlan(id as typeof plan)}
                          className={`h-[38px] rounded-lg font-sans font-medium text-[13px] transition-colors cursor-pointer border ${
                            plan === id
                              ? 'bg-primary/15 border-primary/50 text-primary'
                              : 'bg-background border-border text-text-secondary hover:border-primary/30'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-sans font-medium text-[12px] text-text-tertiary uppercase tracking-wide mb-1.5 block">
                      What will you use it for? (optional)
                    </label>
                    <textarea
                      value={useCase}
                      onChange={(e) => setUseCase(e.target.value)}
                      placeholder="e.g. automating my agency's client onboarding..."
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border rounded-input font-sans text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="font-sans text-[13px] text-danger">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="h-[48px] bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-sans font-semibold text-[15px] rounded-input transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Waitlist →'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="font-sans text-[13px] text-text-tertiary">
            No credit card required · Free to browse · Paid plans launching soon
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
