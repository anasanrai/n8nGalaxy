import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1 pt-[96px] pb-[80px] px-6">
        <div className="max-w-[760px] mx-auto">
          <h1 className="font-display font-extrabold text-[40px] mb-2">Terms of Service</h1>
          <p className="text-text-tertiary text-[14px] mb-12">Last updated: May 20, 2026</p>

          <section className="space-y-10 text-[15px] leading-relaxed text-text-secondary">

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using n8nGalaxy ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms form a binding agreement between you and Anasan Rai, the operator of n8nGalaxy.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">2. The Service</h2>
              <p>n8nGalaxy is a marketplace for n8n workflow templates and automation courses. We provide a platform for creators to sell their n8n workflows and for buyers to discover and purchase automation solutions. We are not affiliated with n8n GmbH.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">3. Account Registration</h2>
              <p className="mb-3">You must create an account to make purchases or submit workflows. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>
              <p>You must be at least 16 years old (or the age of digital consent in your jurisdiction) to use this Service.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">4. Purchases and Payments</h2>
              <p className="mb-3">All purchases are processed by Paddle, our Merchant of Record. By completing a purchase you agree to Paddle's terms of service. Paddle handles payment processing, tax calculation, and compliance on our behalf.</p>
              <p className="mb-3"><strong className="text-text-primary">Workflow purchases</strong> are one-time payments granting you a non-exclusive, non-transferable license to use the purchased workflow for your own or your clients' automation needs.</p>
              <p><strong className="text-text-primary">Subscription plans</strong> grant access to premium content for the duration of the subscription. Subscriptions renew automatically unless cancelled before the renewal date.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">5. Refund Policy</h2>
              <p className="mb-3">We offer a <strong className="text-text-primary">7-day refund</strong> on all individual workflow and course purchases, provided you have not downloaded the file more than once. Refund requests must be submitted to <a href="mailto:hello@n8ngalaxy.com" className="text-primary hover:underline">hello@n8ngalaxy.com</a> within 7 days of purchase.</p>
              <p>Subscription refunds are evaluated on a case-by-case basis. Refunds are not provided for partial subscription periods after the renewal date.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">6. Intellectual Property — Purchased Content</h2>
              <p className="mb-3">When you purchase a workflow or course, you receive a license to use the content. You may not:</p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li>Resell, redistribute, or sublicense the content to third parties.</li>
                <li>Repackage the content and sell it as your own product.</li>
                <li>Share download links publicly.</li>
              </ul>
              <p>You may use purchased workflows in client projects and internal tools without restriction.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">7. Workflow Submissions</h2>
              <p className="mb-3">By submitting a workflow to n8nGalaxy, you grant us a non-exclusive license to host, display, and distribute the workflow on the platform. You represent that you own or have the right to submit the content.</p>
              <p className="mb-3">Submitted workflows are reviewed before approval. We reserve the right to reject any submission without explanation. Approved workflows may be featured or promoted at our discretion.</p>
              <p>Revenue sharing for seller submissions is agreed separately in a creator agreement. Without such an agreement, submissions are provided as free community contributions.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">8. Prohibited Conduct</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the Service for unlawful purposes.</li>
                <li>Attempt to circumvent payment or access controls.</li>
                <li>Upload malicious code, viruses, or harmful content.</li>
                <li>Scrape or systematically copy content without permission.</li>
                <li>Impersonate other users or n8nGalaxy staff.</li>
                <li>Attempt to reverse-engineer or copy the platform.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">9. Disclaimer of Warranties</h2>
              <p>The Service is provided "as is" without warranties of any kind. We do not guarantee that workflows will work for your specific use case, that the Service will be uninterrupted, or that results will be error-free. Use of automation workflows in production is at your own risk.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, n8nGalaxy's total liability to you for any claims arising from use of the Service is limited to the amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">11. Governing Law</h2>
              <p>These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by email or prominent notice on the site. Continued use after notice constitutes acceptance of the updated Terms.</p>
            </div>

            <div>
              <h2 className="font-display font-bold text-[22px] text-text-primary mb-3">13. Contact</h2>
              <p>Questions about these Terms? Email <a href="mailto:hello@n8ngalaxy.com" className="text-primary hover:underline">hello@n8ngalaxy.com</a>.</p>
            </div>

          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
