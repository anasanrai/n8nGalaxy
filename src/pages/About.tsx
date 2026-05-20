import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const stats = [
  { value: '500+', label: 'Workflows' },
  { value: '2,000+', label: 'Members' },
  { value: '15+', label: 'Courses' },
  { value: '50+', label: 'Countries' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="pt-[96px] pb-[64px] px-6 text-center">
          <div className="max-w-[760px] mx-auto">
            <h1 className="font-display font-extrabold text-[52px] leading-tight mb-6">
              Making n8n automation<br />
              <span className="text-[#7c3aed]">accessible to everyone</span>
            </h1>
            <p className="font-sans text-[18px] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
              n8nGalaxy is a marketplace and learning hub for n8n workflow automation. We believe powerful automation should not require a software engineering degree.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-surface py-[64px] px-6">
          <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display font-extrabold text-[44px] text-primary leading-none mb-2">{s.value}</div>
                <div className="font-sans text-[14px] text-text-secondary">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-[80px] px-6">
          <div className="max-w-[760px] mx-auto">
            <h2 className="font-display font-extrabold text-[32px] mb-8">The story</h2>
            <div className="space-y-5 text-[16px] text-text-secondary leading-relaxed">
              <p>
                n8nGalaxy was built by <strong className="text-text-primary">Anasan Rai</strong>, an automation engineer who spent years building n8n workflows for clients across real estate, finance, and SaaS. After building the same patterns over and over, the idea was simple: create a place where the best workflows live and can be shared.
              </p>
              <p>
                n8n is one of the most powerful open-source automation tools available — but getting started is hard. There are thousands of nodes, complex data structures, and no standardized way to share solutions. n8nGalaxy fixes that.
              </p>
              <p>
                We curate, review, and publish production-ready workflow templates built by engineers who have already solved the hard problems. You buy the template, import it, and automate your workflow in minutes — not days.
              </p>
              <p>
                Beyond templates, we run n8n courses, a Discord community of builders, and a weekly newsletter covering the best automation patterns and AI integrations.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-surface py-[80px] px-6">
          <div className="max-w-[760px] mx-auto">
            <h2 className="font-display font-extrabold text-[32px] mb-6">Our mission</h2>
            <p className="text-[18px] text-text-secondary leading-relaxed mb-8">
              To make professional-grade n8n automation accessible to every business, freelancer, and developer — regardless of their technical background.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Quality over quantity', desc: 'Every workflow is reviewed before it goes live. No broken JSON, no untested flows.' },
                { title: 'Community first', desc: 'The best ideas come from the community. We reward contributors and surface great work.' },
                { title: 'Education matters', desc: 'Templates are only half the picture. Our courses teach you how to build and adapt workflows yourself.' },
              ].map((v) => (
                <div key={v.title} className="bg-background border border-border rounded-card p-6">
                  <h3 className="font-display font-bold text-[17px] text-text-primary mb-3">{v.title}</h3>
                  <p className="font-sans text-[14px] text-text-secondary leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-[80px] px-6 text-center">
          <div className="max-w-[500px] mx-auto">
            <h2 className="font-display font-extrabold text-[32px] mb-4">Ready to automate?</h2>
            <p className="font-sans text-[16px] text-text-secondary mb-8">Browse hundreds of production-ready n8n workflows or join the community of builders.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[15px] rounded-input transition-colors cursor-pointer"
              >
                Browse Marketplace
              </button>
              <button
                onClick={() => navigate('/community')}
                className="h-[48px] px-8 border border-border hover:border-primary/40 text-text-primary font-sans font-medium text-[15px] rounded-input transition-colors cursor-pointer"
              >
                Join Community
              </button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
