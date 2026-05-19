import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserButton, useClerk, useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Menu, X, Shield, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { openSignIn, openSignUp } = useClerk();
  const { user } = useUser();

  const { data: profile } = useQuery<any>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data ?? null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Learn', path: '/learn' },
    { name: 'Community', path: '/community' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[64px] z-50 transition-all duration-300 border-b border-white/5 ${
        scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        <NavLink to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
          <span className="font-sans font-bold text-white text-xl">n8n</span>
          <span className="font-display font-extrabold text-[#7c3aed] text-xl ml-0.5">Galaxy</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `font-sans font-medium text-[14px] transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <button 
              onClick={() => openSignIn()} 
              className="px-4 py-2 font-sans font-medium text-[14px] text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => openSignUp()} 
              className="px-5 py-2 font-sans font-medium text-[14px] text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
                <LayoutDashboard size={20} />
              </button>
              {profile?.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="text-[#7c3aed] hover:text-[#6d28d9] transition-colors">
                  <Shield size={20} />
                </button>
              )}
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: 32, height: 32 },
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>

        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-[#0a0a0f] border-b border-white/5 p-4 flex flex-col gap-4 shadow-2xl">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl font-sans font-medium text-[15px] ${isActive ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              {link.name}
            </NavLink>
          ))}
          <div className="border-t border-white/5 my-2"></div>
          <SignedOut>
            <div className="flex flex-col gap-3 px-2">
              <button onClick={() => { setMobileMenuOpen(false); openSignIn(); }} className="w-full py-3 font-sans font-medium text-[14px] text-white rounded-xl border border-white/10 hover:bg-white/5 transition-colors">Sign In</button>
              <button onClick={() => { setMobileMenuOpen(false); openSignUp(); }} className="w-full py-3 font-sans font-medium text-[14px] text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl transition-colors">Get Started</button>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }} className="block w-full text-left px-4 py-3 rounded-xl font-sans font-medium text-[15px] text-gray-400 hover:bg-white/5 hover:text-white">Dashboard</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/submit'); }} className="block w-full text-left px-4 py-3 rounded-xl font-sans font-medium text-[15px] text-gray-400 hover:bg-white/5 hover:text-white">Submit Workflow</button>
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  );
}
