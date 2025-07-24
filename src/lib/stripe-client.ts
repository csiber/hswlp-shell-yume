import "server-only";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

interface StripePaymentIntent {
  id: string;
  client_secret?: string;
  status: string;
  metadata: Record<string, string>;
}

class StripeClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`https://api.stripe.com/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stripe API error: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    automatic_payment_methods?: { enabled: boolean; allow_redirects?: string };
    metadata?: Record<string, string>;
  }): Promise<StripePaymentIntent> {
    const body = new URLSearchParams();
    body.set("amount", params.amount.toString());
    body.set("currency", params.currency);
    if (params.automatic_payment_methods?.enabled) {
      body.set("automatic_payment_methods[enabled]", "true");
    }
    if (params.automatic_payment_methods?.allow_redirects) {
      body.set(
        "automatic_payment_methods[allow_redirects]",
        params.automatic_payment_methods.allow_redirects
      );
    }
    if (params.metadata) {
      for (const [key, value] of Object.entries(params.metadata)) {
        body.set(`metadata[${key}]`, value);
      }
    }
    return this.request<StripePaymentIntent>("/payment_intents", {
      method: "POST",
      body,
    });
  }

  async retrievePaymentIntent(id: string): Promise<StripePaymentIntent> {
    return this.request<StripePaymentIntent>(`/payment_intents/${id}`);
  }
}

let stripeClient: StripeClient | null = null;

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new StripeClient(STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

export type { StripePaymentIntent };
