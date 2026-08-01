// Thawani Pay integration (Oman) — hosted checkout flow.
// Docs: https://thawani-technologies.stoplight.io/docs/thawani-ecommerce-api
//
// Unlike a raw-card API, Thawani uses a redirect-based hosted checkout page:
// 1. We create a "session" server-side (createCheckoutSession)
// 2. We redirect the browser to Thawani's hosted payment page
// 3. Thawani redirects back to our success_url after payment
// 4. We verify the session's payment_status server-side (getSessionStatus) before fulfilling

const isLive = () => !!process.env.THAWANI_SECRET_KEY && !process.env.THAWANI_SECRET_KEY.includes("xxxx");

export function hasLiveThawaniKey() {
  return isLive();
}

function apiBase() {
  // UAT (test) vs production checkout API base URL.
  return process.env.THAWANI_MODE === "live"
    ? "https://checkout.thawani.om/api/v1"
    : "https://uatcheckout.thawani.om/api/v1";
}

function payPageBase() {
  return process.env.THAWANI_MODE === "live"
    ? "https://checkout.thawani.om/pay"
    : "https://uatcheckout.thawani.om/pay";
}

interface Product {
  name: string;
  unitAmountBaisa: number; // OMR minor unit — 1000 baisa = 1 OMR, integers only
  quantity?: number;
}

export async function createCheckoutSession({
  products,
  clientReferenceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  products: Product[];
  clientReferenceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; sessionId?: string; paymentUrl?: string; message?: string }> {
  const res = await fetch(`${apiBase()}/checkout/session`, {
    method: "POST",
    headers: {
      "thawani-api-key": process.env.THAWANI_SECRET_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_reference_id: clientReferenceId,
      mode: "payment",
      products: products.map((p) => ({
        name: p.name,
        unit_amount: Math.round(p.unitAmountBaisa),
        quantity: p.quantity ?? 1,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata ?? {},
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    return { success: false, message: data?.description || "تعذّر إنشاء جلسة الدفع" };
  }

  const sessionId = data.data.session_id as string;
  const paymentUrl = `${payPageBase()}/${sessionId}?key=${process.env.THAWANI_PUBLISHABLE_KEY}`;
  return { success: true, sessionId, paymentUrl };
}

export async function getSessionStatus(sessionId: string): Promise<{ paid: boolean; status?: string }> {
  const res = await fetch(`${apiBase()}/checkout/session/${sessionId}`, {
    headers: { "thawani-api-key": process.env.THAWANI_SECRET_KEY! },
  });
  const data = await res.json();
  const status = data?.data?.payment_status as string | undefined;
  return { paid: status === "paid", status };
}

// OMR helper — omrToBaisa(1.5) => 1500
export function omrToBaisa(omr: number) {
  return Math.round(omr * 1000);
}
