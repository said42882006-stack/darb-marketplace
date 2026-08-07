import { CategoryId } from "./constants";

export interface AttributeOption {
  value: string;
  label: string;
}

export interface AttributeDef {
  key: string;
  label: string;
  options: AttributeOption[];
}

export const CATEGORY_ATTRIBUTES: Partial<Record<CategoryId, AttributeDef>> = {
  real_estate: {
    key: "property_type",
    label: "نوع العقار",
    options: [
      { value: "apartment", label: "شقة" },
      { value: "villa", label: "فيلا" },
      { value: "office", label: "مكتب" },
      { value: "shop", label: "محل تجاري" },
    ],
  },
  chalets: {
    key: "bedrooms",
    label: "عدد الغرف",
    options: [
      { value: "1", label: "غرفة واحدة" },
      { value: "2", label: "غرفتان" },
      { value: "3", label: "3 غرف" },
      { value: "4+", label: "4 غرف فأكثر" },
    ],
  },
  resorts: {
    key: "rating",
    label: "تصنيف النجوم",
    options: [
      { value: "3", label: "3 نجوم" },
      { value: "4", label: "4 نجوم" },
      { value: "5", label: "5 نجوم" },
    ],
  },
  hotels: {
    key: "stars",
    label: "تصنيف الفندق",
    options: [
      { value: "3", label: "3 نجوم" },
      { value: "4", label: "4 نجوم" },
      { value: "5", label: "5 نجوم" },
    ],
  },
  cars: {
    key: "transmission",
    label: "ناقل الحركة",
    options: [
      { value: "automatic", label: "أوتوماتيك" },
      { value: "manual", label: "عادي" },
    ],
  },
  transport: {
    key: "vehicle_type",
    label: "نوع المركبة",
    options: [
      { value: "box_truck", label: "شاحنة صندوق" },
      { value: "flatbed", label: "دبل/ستيك" },
      { value: "pickup", label: "بكب" },
      { value: "other", label: "أخرى" },
    ],
  },
};

export function attributeOptionLabel(categoryId: string, value: string): string | null {
  const def = CATEGORY_ATTRIBUTES[categoryId as CategoryId];
  return def?.options.find((o) => o.value === value)?.label ?? null;
}
