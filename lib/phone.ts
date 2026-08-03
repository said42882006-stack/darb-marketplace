// Normalizes an Omani phone number to E.164 format (+968XXXXXXXX).
// Accepts local 8-digit numbers, numbers with a leading 0, or already-international numbers.
export function toE164Oman(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 8) digits = `968${digits}`;
  return `+${digits}`;
}

// Same normalization but without the leading "+", for wa.me links.
export function toWhatsAppDigits(phone: string): string {
  return toE164Oman(phone).replace("+", "");
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
