import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddle: Paddle | undefined;

export async function getPaddle(): Promise<Paddle> {
  if (paddle) return paddle;

  const env = (import.meta.env.VITE_PADDLE_ENVIRONMENT || 'production') as
    'sandbox' | 'production';
  const token: string | undefined = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

  if (!token) {
    throw new Error('Paddle client token is not configured (VITE_PADDLE_CLIENT_TOKEN missing).');
  }

  // API keys (pdl_live_apikey_ / pdl_sdbx_apikey_) are backend-only.
  // Client tokens must start with "live_" or "test_".
  if (!token.startsWith('live_') && !token.startsWith('test_')) {
    throw new Error(
      `Invalid Paddle token format ("${token.slice(0, 18)}..."). ` +
      'You need a client-side token (starts with "live_" or "test_"), not an API key. ' +
      'Get it from Paddle Dashboard → Developer Tools → Authentication → Client-side tokens.'
    );
  }

  paddle = await initializePaddle({ environment: env, token });

  if (!paddle) throw new Error('Paddle failed to initialize — check that the token matches the environment (live_ = production, test_ = sandbox).');
  return paddle;
}

export async function openPaddleCheckout(params: {
  priceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  customData: Record<string, string>;
}): Promise<void> {
  const p = await getPaddle();
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
}
