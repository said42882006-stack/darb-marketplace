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
  homes: {
    key: "bedrooms",
    label: "عدد الغرف",
    options: [
      { value: "studio", label: "استوديو" },
      { value: "1", label: "غرفة واحدة" },
      { value: "2", label: "غرفتان" },
      { value: "3", label: "3 غرف" },
      { value: "4", label: "4 غرف" },
      { value: "5+", label: "5 غرف فأكثر" },
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
  cars: {
    key: "transmission",
    label: "ناقل الحركة",
    options: [
      { value: "automatic", label: "أوتوماتيك" },
      { value: "manual", label: "عادي" },
    ],
  },
  trucks: {
    key: "truck_type",
    label: "نوع الشاحنة",
    options: [
      { value: "box", label: "صندوق مغلق" },
      { value: "flatbed", label: "ستيك" },
      { value: "trailer", label: "بلت" },
      { value: "other", label: "أخرى" },
    ],
  },
  oil_transport: {
    key: "tanker_type",
    label: "نوع المشتق",
    options: [
      { value: "petrol", label: "بنزين" },
      { value: "diesel", label: "ديزل" },
      { value: "gas", label: "غاز" },
    ],
  },
  delivery: {
    key: "vehicle_type",
    label: "وسيلة التوصيل",
    options: [
      { value: "car", label: "سيارة" },
      { value: "motorcycle", label: "دراجة نارية" },
      { value: "small_truck", label: "شاحنة صغيرة" },
    ],
  },
  mandoob: {
    key: "service_type",
    label: "نوع الخدمة",
    options: [
      { value: "shopping", label: "تسوق" },
      { value: "documents", label: "أوراق رسمية" },
      { value: "general", label: "مهام عامة" },
    ],
  },
  taxi: {
    key: "car_type",
    label: "نوع السيارة",
    options: [
      { value: "sedan", label: "سيدان" },
      { value: "suv", label: "دفع رباعي" },
      { value: "van", label: "فان" },
    ],
  },
  bikes: {
    key: "bike_type",
    label: "نوع الدراجة",
    options: [
      { value: "bicycle", label: "هوائية" },
      { value: "motorcycle", label: "نارية" },
    ],
  },
  boats: {
    key: "boat_type",
    label: "نوع القارب",
    options: [
      { value: "fishing", label: "صيد" },
      { value: "leisure", label: "نزهة" },
      { value: "jetski", label: "جيت سكي" },
    ],
  },
};

export function attributeOptionLabel(categoryId: string, value: string): string | null {
  const def = CATEGORY_ATTRIBUTES[categoryId as CategoryId];
  return def?.options.find((o) => o.value === value)?.label ?? null;
}
