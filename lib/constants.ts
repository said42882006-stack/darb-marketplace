export type CategoryId =
  | "real_estate" | "land" | "chalets" | "resorts" | "hotels"
  | "cars" | "bikes" | "boats"
  | "mandoob" | "transport" | "cranes" | "heavy_equipment" | "caravan"
  | "other";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  labelEn: string;
  labelSingular: string;
  unit: string;
  unitEn: string;
  isRoute: boolean; // true => uses from/to instead of a single location
  gradient: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "real_estate", label: "عقارات", labelEn: "Real Estate", labelSingular: "عقار", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#2F6F6B,#1B2A4A)" },
  { id: "land", label: "أراضٍ", labelEn: "Land", labelSingular: "أرض", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#6E8F3E,#25381A)" },
  { id: "chalets", label: "شاليهات", labelEn: "Chalets", labelSingular: "شاليه", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#3E8F82,#173B39)" },
  { id: "resorts", label: "منتجعات", labelEn: "Resorts", labelSingular: "منتجع", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#2A5A8C,#12233D)" },
  { id: "hotels", label: "فنادق", labelEn: "Hotels", labelSingular: "فندق", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#4A5A8C,#161C38)" },
  { id: "cars", label: "سيارات", labelEn: "Cars", labelSingular: "سيارة", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#C98A3E,#7A4F1E)" },
  { id: "bikes", label: "دراجات", labelEn: "Bikes", labelSingular: "دراجة", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#3E8F6B,#153B2A)" },
  { id: "boats", label: "قوارب", labelEn: "Boats", labelSingular: "قارب", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#2A6E8C,#0E2C3A)" },
  { id: "mandoob", label: "مندوب ومشاوير", labelEn: "Errand Agent", labelSingular: "مندوب", unit: "للمهمة", unitEn: "/ task", isRoute: false, gradient: "linear-gradient(135deg,#4A6E8A,#16283A)" },
  { id: "transport", label: "نقل عام", labelEn: "General Transport", labelSingular: "خدمة نقل", unit: "للرحلة", unitEn: "/ trip", isRoute: true, gradient: "linear-gradient(135deg,#8A6A2F,#3A2C10)" },
  { id: "cranes", label: "رافعات", labelEn: "Cranes", labelSingular: "رافعة", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#B5651D,#4A2A0C)" },
  { id: "heavy_equipment", label: "معدات ثقيلة", labelEn: "Heavy Equipment", labelSingular: "معدة", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#6B6B4A,#2A2A1B)" },
  { id: "caravan", label: "كرفان", labelEn: "Caravan", labelSingular: "كرفان", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#8C6E4A,#3A2C18)" },
  { id: "other", label: "أخرى", labelEn: "Other", labelSingular: "عنصر", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#6B6B6B,#2B2B2B)" },
];

export const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export function categoryLabel(c: CategoryDef, locale: "ar" | "en") {
  return locale === "en" ? c.labelEn : c.label;
}
export function categoryUnit(c: CategoryDef, locale: "ar" | "en") {
  return locale === "en" ? c.unitEn : c.unit;
}

export const FREE_LISTINGS_LIMIT = 3;
export const MAX_LISTING_IMAGES = 10;
export const LISTING_LIFETIME_DAYS = 14;

export interface Plan {
  id: "basic" | "pro" | "unlimited";
  name: string;
  nameEn: string;
  monthlyPriceOMR: number;
  yearlyPriceOMR: number; // discounted vs. monthlyPriceOMR * 12
  features: string[];
  featuresEn: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "أساسية",
    nameEn: "Basic",
    monthlyPriceOMR: 2,
    yearlyPriceOMR: 20,
    features: ["نشر إعلانات غير محدود طوال الاشتراك", "ظهور عادي في نتائج البحث", "دعم عبر البريد الإلكتروني"],
    featuresEn: ["Unlimited listings while subscribed", "Standard search placement", "Email support"],
  },
  {
    id: "pro",
    name: "مميزة",
    nameEn: "Pro",
    monthlyPriceOMR: 5,
    yearlyPriceOMR: 50,
    popular: true,
    features: ["كل مزايا الباقة الأساسية", 'تمييز كل إعلاناتك بشارة "مميز"', "دعم مباشر عبر المحادثة"],
    featuresEn: ["Everything in Basic", 'All listings get a "Featured" badge', "Live chat support"],
  },
  {
    id: "unlimited",
    name: "احترافية",
    nameEn: "Professional",
    monthlyPriceOMR: 10,
    yearlyPriceOMR: 100,
    features: ["كل مزايا الباقة المميزة", "أولوية ظهور في كل الأقسام", "مدير حساب مخصص"],
    featuresEn: ["Everything in Pro", "Priority placement everywhere", "Dedicated account manager"],
  },
];
