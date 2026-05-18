import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { Menu, X, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

function useSafeUser() {
  try {
    return useUser();
  } catch {
    return { isSignedIn: false as const, user: null, isLoaded: true };
  }
}

function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return { signOut: async () => {}, isLoaded: true };
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { isSignedIn, user } = useSafeUser();
  const { signOut } = useSafeAuth();

  const { data: profile } = useQuery<any>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return data ?? null;
    },
    enabled: !!isSignedIn && !!user?.id,
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

  // Show sign-in buttons UNLESS Clerk confirms user IS signed in.
  // This works even when Clerk hasn't initialized (isSignedIn = undefined).
  const showLoggedOut = !isSignedIn;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[64px] z-50 transition-colors duration-200 border-b border-border ${
        scrolled ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        <NavLink to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
          <span className="font-sans font-medium text-text-secondary">n8n</span>
          <span className="font-display font-extrabold text-primary">Galaxy</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `font-sans font-medium text-[14px] transition-colors duration-150 ${
                  isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {showLoggedOut ? (
            <>
              <button
                onClick={() => navigate('/signin')}
                className="h-[36px] px-4 font-sans font-medium text-[14px] text-text-primary rounded-input border border-border hover:bg-surface transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="h-[36px] px-4 font-sans font-medium text-[14px] text-white bg-primary hover:bg-primary-hover rounded-input transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: { width: 32, height: 32 },
                      userButtonPopoverCard: { background: '#13131F', border: '1px solid #1E1E30' },
                      userButtonPopoverActionButton: { color: '#F4F4F8' },
                      userButtonPopoverActionButtonText: { color: '#F4F4F8' },
                      userButtonPopoverFooter: { display: 'none' },
                    },
                  }}
                />
              </div>
              <div className="absolute right-0 mt-2 w-48 py-2 bg-surface border border-border rounded-card shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-left px-4 py-2 text-[14px] font-sans text-text-secondary hover:text-text-primary hover:bg-background transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/submit')}
                  className="w-full text-left px-4 py-2 text-[14px] font-sans text-text-secondary hover:text-text-primary hover:bg-background transition-colors cursor-pointer"
                >
                  Submit Workflow
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full text-left px-4 py-2 text-[14px] font-sans hover:bg-background transition-colors cursor-pointer flex items-center gap-2"
                    style={{ color: '#7C3AED' }}
                  >
                    <Shield size={13} />
                    Admin Panel
                  </button>
                )}
                <div className="my-1 border-t border-border"></div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-[14px] font-sans text-danger hover:bg-background transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-text-secondary hover:text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-surface border-b border-border p-4 flex flex-col gap-4 shadow-2xl">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-input font-sans font-medium text-[15px] ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="border-t border-border my-2"></div>
          {showLoggedOut ? (
            <div className="flex flex-col gap-3 px-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/signin'); }}
                className="w-full h-[40px] font-sans font-medium text-[14px] text-text-primary rounded-input border border-border hover:bg-background transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}
                className="w-full h-[40px] font-sans font-medium text-[14px] text-white bg-primary hover:bg-primary-hover rounded-input transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                className="block w-full text-left px-4 py-3 rounded-input font-sans font-medium text-[15px] text-text-secondary hover:bg-background hover:text-text-primary"
              >
                Dashboard
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/submit'); }}
                className="block w-full text-left px-4 py-3 rounded-input font-sans font-medium text-[15px] text-text-secondary hover:bg-background hover:text-text-primary"
              >
                Submit Workflow
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
