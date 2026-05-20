import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/signin"
        forceRedirectUrl="/marketplace"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#0a0a0f',
            colorInputBackground: '#13131f',
            colorText: '#ffffff',
            colorTextSecondary: '#94a3b8',
            borderRadius: '0.75rem',
          },
          elements: {
            card: 'shadow-2xl border border-white/10',
            headerTitle: 'text-white font-bold',
            socialButtonsBlockButton: 'border border-white/10 hover:bg-white/5',
          }
        }}
      />
    </div>
  );
}