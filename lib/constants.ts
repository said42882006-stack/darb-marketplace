export type CategoryId = "homes" | "cars" | "chalets" | "resorts" | "delivery";

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
  { id: "homes", label: "منازل", labelEn: "Homes", labelSingular: "منزل", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#2F6F6B,#1B2A4A)" },
  { id: "cars", label: "سيارات", labelEn: "Cars", labelSingular: "سيارة", unit: "لليوم", unitEn: "/ day", isRoute: false, gradient: "linear-gradient(135deg,#C98A3E,#7A4F1E)" },
  { id: "chalets", label: "شاليهات", labelEn: "Chalets", labelSingular: "شاليه", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#3E8F82,#173B39)" },
  { id: "resorts", label: "منتجعات", labelEn: "Resorts", labelSingular: "منتجع", unit: "لليلة", unitEn: "/ night", isRoute: false, gradient: "linear-gradient(135deg,#2A5A8C,#12233D)" },
  { id: "delivery", label: "نقل وتوصيل", labelEn: "Delivery & Transport", labelSingular: "خدمة نقل", unit: "للرحلة", unitEn: "/ trip", isRoute: true, gradient: "linear-gradient(135deg,#8A6A2F,#3A2C10)" },
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

export interface Plan {
  id: "basic" | "pro" | "unlimited";
  name: string;
  nameEn: string;
  price: number;
  features: string[];
  featuresEn: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "أساسية",
    nameEn: "Basic",
    price: 49,
    features: ["إعلان واحد شهرياً", "ظهور عادي في نتائج البحث", "دعم عبر البريد الإلكتروني"],
    featuresEn: ["1 listing per month", "Standard search placement", "Email support"],
  },
  {
    id: "pro",
    name: "مميزة",
    nameEn: "Pro",
    price: 149,
    popular: true,
    features: ["حتى 10 إعلانات شهرياً", 'تمييز الإعلان بشارة "مميز"', "دعم مباشر عبر المحادثة"],
    featuresEn: ["Up to 10 listings per month", 'Featured "Premium" badge', "Live chat support"],
  },
  {
    id: "unlimited",
    name: "احترافية",
    nameEn: "Professional",
    price: 299,
    features: ["إعلانات غير محدودة", "أولوية ظهور في كل الأقسام", "مدير حساب مخصص"],
    featuresEn: ["Unlimited listings", "Priority placement everywhere", "Dedicated account manager"],
  },
];
