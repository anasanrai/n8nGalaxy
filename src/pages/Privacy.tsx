import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1 pt-[96px] pb-[80px] px-6">
        <div className="max-w-[760px] mx-auto">
          <h1 className="font-display font-extrabold text-[40px] mb-2">Privacy Policy</h1>
          <p className="text-text-tertiary text-[14px] mb-12">Last updated: May 20, 2026</p>

          <section className="space-y-10 text-[15px] leading-relaxed text-text-secondary">

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">1. Overview</h2>
              <p>n8nGalaxy ("we", "us", "our") operates the website n8ngalaxy.com and the services available through it (the "Service"). This Privacy Policy explains how we collect, use, and share information about you when you use our Service. By using n8nGalaxy you agree to the collection and use of information in accordance with this policy.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">2. Information We Collect</h2>
              <p className="mb-3"><strong className="text-text-primary">Account information.</strong> When you create an account we collect your email address, name, and profile picture via Clerk authentication. You may sign up with an email/password or a third-party OAuth provider (Google, GitHub).</p>
              <p className="mb-3"><strong className="text-text-primary">Purchase information.</strong> When you purchase a workflow or subscription, Paddle processes your payment. We receive a transaction ID, the amount paid, and your email. We do not store raw card numbers or full payment credentials.</p>
              <p className="mb-3"><strong className="text-text-primary">Usage information.</strong> We use PostHog to collect anonymous analytics about how you interact with the site — pages visited, clicks, session duration. This data does not personally identify you by default.</p>
              <p><strong className="text-text-primary">Submitted content.</strong> If you submit a workflow, we store the title, description, category, tags, and file you upload, linked to your account.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide and operate the Service (authentication, purchases, downloads).</li>
                <li>To process payments and send receipts via Paddle.</li>
                <li>To send transactional emails related to your account or purchases.</li>
                <li>To improve the Service using aggregated analytics data.</li>
                <li>To detect and prevent fraud or abuse.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">4. Third-Party Services</h2>
              <p className="mb-3"><strong className="text-text-primary">Clerk</strong> — handles user authentication and stores your email and profile. See <a href="https://clerk.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">clerk.com/privacy</a>.</p>
              <p className="mb-3"><strong className="text-text-primary">Supabase</strong> — stores your profile, purchases, submissions, and subscription data in a PostgreSQL database hosted on AWS. See <a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.</p>
              <p className="mb-3"><strong className="text-text-primary">Paddle</strong> — processes all payments as our Merchant of Record. Paddle handles PCI compliance, tax calculation, and payment data. See <a href="https://www.paddle.com/legal/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">paddle.com/legal/privacy</a>.</p>
              <p><strong className="text-text-primary">PostHog</strong> — provides product analytics. Data is anonymized and used only in aggregate. See <a href="https://posthog.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">posthog.com/privacy</a>.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">5. Cookies</h2>
              <p>We use cookies and similar technologies for authentication (Clerk session tokens), analytics (PostHog), and preferences. You can control cookies through your browser settings. Disabling cookies may affect functionality.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">6. Data Retention</h2>
              <p>We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal purposes (e.g., financial records for tax compliance).</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">7. Your Rights</h2>
              <p className="mb-3">Depending on your location, you may have the right to access, correct, export, or delete your personal data. To exercise these rights, email us at <a href="mailto:hello@n8ngalaxy.com" className="text-primary hover:underline">hello@n8ngalaxy.com</a>.</p>
              <p>If you are in the EU/UK, you have rights under GDPR/UK GDPR. If you are in California, you have rights under CCPA.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">8. Security</h2>
              <p>We use industry-standard security practices including HTTPS, row-level security in Supabase, and rely on Clerk and Paddle for secure credential and payment handling. No system is completely secure; we cannot guarantee absolute security.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">9. Children</h2>
              <p>n8nGalaxy is not directed at children under 16. We do not knowingly collect personal data from children. If we learn we have collected data from a child, we will delete it promptly.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">10. Changes to This Policy</h2>
              <p>We may update this policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of the Service after changes constitutes acceptance.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">11. Contact</h2>
              <p>Questions about this Privacy Policy? Email us at <a href="mailto:hello@n8ngalaxy.com" className="text-primary hover:underline">hello@n8ngalaxy.com</a>.</p>
            </div>

          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
