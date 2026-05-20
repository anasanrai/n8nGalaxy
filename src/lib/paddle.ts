import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddle: Paddle | undefined;

async function buildPaddle(): Promise<Paddle> {
  const env = (import.meta.env.VITE_PADDLE_ENVIRONMENT || 'production') as
    'sandbox' | 'production';
  const token: string | undefined = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

  if (!token) {
    throw new Error('VITE_PADDLE_CLIENT_TOKEN is not set.');
  }
  if (!token.startsWith('live_') && !token.startsWith('test_')) {
    throw new Error(
      `Paddle token "${token.slice(0, 12)}..." is a backend API key, not a client token. ` +
      'Get a client-side token (starts with live_ or test_) from ' +
      'Paddle Dashboard → Developer Tools → Authentication.'
    );
  }

  const instance = await initializePaddle({ environment: env, token });

  if (!instance) {
    throw new Error(
      'Paddle failed to initialize. Check: (1) token matches environment ' +
      '(live_ = production, test_ = sandbox), (2) your Paddle account is ' +
      'approved for live payments, (3) n8ngalaxy.com is in your Paddle approved domains.'
    );
  }

  return instance;
}

export async function getPaddle(): Promise<Paddle> {
  if (paddle) return paddle;
  paddle = await buildPaddle();
  return paddle;
}

export async function openPaddleCheckout(params: {
  priceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  customData: Record<string, string>;
}): Promise<void> {
  let p: Paddle;
  try {
    p = await getPaddle();
  } catch (err) {
    paddle = undefined; // reset so next attempt reinitialises fresh
    throw err;
  }

  try {
    await p.Checkout.open({
      items: [{ priceId: params.priceId, quantity: 1 }],
      customer: { email: params.userEmail },
      customData: params.customData,
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'en',
        successUrl: `${window.location.origin}/dashboard`,
      },
    });
  } catch (err: any) {
    paddle = undefined; // reset so next attempt reinitialises fresh
    // Give a specific message for the checkoutFrontEndBase failure
    if (err?.message?.includes('checkoutFrontEndBase')) {
      throw new Error(
        'Paddle checkout config missing. Your Paddle account may not be approved ' +
        'for live payments yet, or n8ngalaxy.com is not in your allowed domains. ' +
        'Check Paddle Dashboard → Checkout → Allowed Domains.'
      );
    }
    throw err;
  }
}
