interface CardInput {
  name: string;
  number: string;
  exp: string; // "MM/YY"
  cvv: string;
}

interface ChargeResult {
  success: boolean;
  id?: string;
  message?: string;
}

export function hasLiveMoyasarKey() {
  return !!process.env.MOYASAR_SECRET_KEY && !process.env.MOYASAR_SECRET_KEY.includes("xxxx");
}

// Real charge via Moyasar's Payments API (https://moyasar.com/docs).
// Amounts are in halalas (SAR minor unit), so multiply by 100.
export async function chargeCard(amountSar: number, description: string, card: CardInput): Promise<ChargeResult> {
  const [month, year] = card.exp.split("/").map((s) => s.trim());

  const res = await fetch("https://api.moyasar.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${process.env.MOYASAR_SECRET_KEY}:`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amountSar * 100),
      currency: "SAR",
      description,
      source: {
        type: "creditcard",
        name: card.name,
        number: card.number.replace(/\s+/g, ""),
        cvc: card.cvv,
        month,
        year: year?.length === 2 ? `20${year}` : year,
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/post`,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data?.message || "فشلت عملية الدفع" };
  }
  if (data.status !== "paid" && data.status !== "authorized") {
    return { success: false, message: `حالة الدفع: ${data.status}` };
  }
  return { success: true, id: data.id };
}
