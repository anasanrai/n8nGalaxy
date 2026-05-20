import { PricingTable } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <Navbar />

      <main className="pt-[96px] pb-24 px-6">
        {/* Hero */}
        <div className="text-center mb-14 max-w-[600px] mx-auto">
          <h1 className="font-display font-extrabold text-[40px] md:text-[52px] leading-tight text-text-primary mb-4">
            Simple, transparent pricing
          </h1>
          <p className="font-sans font-normal text-[18px] text-text-secondary leading-relaxed">
            Choose the plan that fits your workflow. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Clerk PricingTable — reads plans from Clerk dashboard */}
        <div className="max-w-[1100px] mx-auto">
          <PricingTable
            newSubscriptionRedirectUrl="/dashboard"
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#7C3AED',
                colorBackground: '#13131F',
                colorInputBackground: '#0D0D14',
                colorText: '#F4F4F8',
                colorTextSecondary: '#9CA3AF',
                borderRadius: '0.75rem',
              },
              elements: {
                pricingTableCard: 'border border-white/10 shadow-none',
              },
            }}
            checkoutProps={{
              appearance: {
                baseTheme: dark,
                variables: {
                  colorPrimary: '#7C3AED',
                  colorBackground: '#0D0D14',
                  colorText: '#F4F4F8',
                  borderRadius: '0.75rem',
                },
              },
            }}
          />
        </div>

        {/* Trust footer */}
        <div className="mt-16 text-center">
          <p className="font-sans text-[13px] text-text-tertiary">
            Billed monthly · Cancel anytime · Secure checkout via Clerk
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
