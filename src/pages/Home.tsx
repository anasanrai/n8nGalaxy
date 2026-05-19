import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-[#7c3aed] selection:text-white overflow-x-hidden relative">
      <Navbar />

      {/* Global Background overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>

      <main className="relative z-10">
        {/* HOMEPAGE HERO */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 flex items-center justify-center px-6 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed]/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 translate-x-[10%] -translate-y-[20%] w-[500px] h-[500px] bg-[#3b82f6]/20 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="text-[13px] font-medium text-gray-300">✦ The n8n Workflow Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.1] tracking-tight mb-6">
              Download. Automate.
              <br />
              Ship <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]">Faster.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Production-ready n8n workflows built by automation engineers. Download JSON, import, done.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-10">
              <button
                onClick={() => navigate('/marketplace')}
                className="py-3 px-8 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-[1.02] cursor-pointer"
              >
                Browse Workflows →
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="py-3 px-8 bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                View Pricing
              </button>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-gray-500 text-sm">
              <span>No subscription required</span>
              <span className="hidden sm:inline">·</span>
              <span>Instant download</span>
              <span className="hidden sm:inline">·</span>
              <span>Import-ready JSON</span>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/5">
              {[
                { number: '50+', label: 'Workflows' },
                { number: '500+', label: 'Members' },
                { number: '10+', label: 'Courses' },
                { number: 'Free', label: 'to start' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center px-4">
                  <span className="font-display font-bold text-3xl md:text-4xl text-white mb-2">{stat.number}</span>
                  <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION "Why n8nGalaxy?" */}
        <section className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-[#7c3aed] text-sm font-semibold uppercase tracking-wider mb-3">Why n8nGalaxy?</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Built for actual production.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">⚡</div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Import</h3>
                <p className="text-gray-400 leading-relaxed">
                  Download JSON, go to n8n, import. Done in 60 seconds.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">🛠</div>
                <h3 className="text-xl font-bold text-white mb-3">Production-Ready</h3>
                <p className="text-gray-400 leading-relaxed">
                  Built and tested by real automation engineers. Not tutorial-quality.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">🔄</div>
                <h3 className="text-xl font-bold text-white mb-3">All Niches</h3>
                <p className="text-gray-400 leading-relaxed">
                  Real estate, clinic, SMB, finance, HR. Every workflow has a use case.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-[#7c3aed] text-sm font-semibold uppercase tracking-wider mb-3">How it works</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Three steps to live automation</h2>
            </div>

            <div className="relative flex flex-col md:flex-row gap-12 md:gap-8 justify-between max-w-4xl mx-auto">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {[
                { step: '1', title: 'Browse', desc: 'Find the workflow for your use case' },
                { step: '2', title: 'Download', desc: 'Get the JSON file instantly' },
                { step: '3', title: 'Import', desc: 'Paste into n8n and go live' },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-xl flex items-center justify-center mb-6 text-[#7c3aed] font-display font-bold text-2xl group-hover:border-[#7c3aed]/50 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 max-w-[200px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
