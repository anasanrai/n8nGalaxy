import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { NavLink } from 'react-router-dom';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0D0D14] flex flex-col items-center justify-center p-6 relative">
      <NavLink to="/" className="absolute top-6 left-6 text-[#9CA3AF] hover:text-[#F4F4F8] transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
      </NavLink>
      <div className="mb-8 flex items-center justify-center">
        <span className="font-sans font-medium text-[#9CA3AF] text-xl">n8n</span>
        <span className="font-display font-extrabold text-[#7C3AED] text-xl">Galaxy</span>
      </div>
      <SignIn
        routing="path"
        path="/signin"
        signUpUrl="/signup"
        afterSignInUrl="/marketplace"
        afterSignUpUrl="/marketplace"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#0f0f1a',
            colorInputBackground: '#1a1a2e',
            colorText: '#ffffff',
          },
          elements: {
            rootBox: { width: '100%', maxWidth: 400 },
            card: { background: '#13131F', border: '1px solid #1E1E30', borderRadius: 12, boxShadow: 'none' },
            headerTitle: { color: '#F4F4F8', fontFamily: '"Syne", sans-serif' },
            headerSubtitle: { color: '#9CA3AF' },
            socialButtonsBlockButton: { background: '#1E1E30', border: '1px solid #2A2A3E', color: '#F4F4F8', borderRadius: 8 },
            formButtonPrimary: { background: '#7C3AED', borderRadius: 8, '&:hover': { background: '#6D28D9' } },
            formFieldInput: { background: '#0D0D14', border: '1px solid #1E1E30', borderRadius: 8, color: '#F4F4F8' },
            formFieldLabel: { color: '#9CA3AF' },
            footerActionLink: { color: '#7C3AED' },
            dividerLine: { background: '#1E1E30' },
            dividerText: { color: '#6B7280' },
            identityPreviewText: { color: '#F4F4F8' },
            identityPreviewEditButton: { color: '#7C3AED' },
          },
        }}
      />
    </div>
  );
}
