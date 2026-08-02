import { Search } from "lucide-react";
import { CategoryDef } from "@/lib/constants";
import { CATEGORY_ATTRIBUTES } from "@/lib/categoryAttributes";

export default function Filters({
  category,
  defaults,
  attrValue,
}: {
  category: CategoryDef;
  defaults: { q?: string; min?: string; max?: string; sort?: string };
  attrValue?: string;
}) {
  const attrDef = CATEGORY_ATTRIBUTES[category.id as keyof typeof CATEGORY_ATTRIBUTES];

  return (
    <form
      method="get"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-white border border-line rounded-2xl p-4"
    >
      <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-line px-3 py-2">
        <Search className="w-4 h-4 text-muted shrink-0" />
        <input
          type="text"
          name="q"
          defaultValue={defaults.q}
          placeholder={`ابحث في ${category.label}...`}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </label>

      <label className="text-xs font-medium text-muted flex flex-col gap-1">
        أقل سعر
        <input
          type="number"
          name="min"
          defaultValue={defaults.min}
          placeholder="0"
          className="rounded-xl border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </label>

      <label className="text-xs font-medium text-muted flex flex-col gap-1">
        أعلى سعر
        <input
          type="number"
          name="max"
          defaultValue={defaults.max}
          placeholder="بدون حد"
          className="rounded-xl border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </label>

      {attrDef && (
        <label className="text-xs font-medium text-muted flex flex-col gap-1">
          {attrDef.label}
          <select
            name={attrDef.key}
            defaultValue={attrValue ?? ""}
            className="rounded-xl border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white"
          >
            <option value="">الكل</option>
            {attrDef.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      )}

      <label className="text-xs font-medium text-muted flex flex-col gap-1">
        الترتيب
        <select
          name="sort"
          defaultValue={defaults.sort ?? "newest"}
          className="rounded-xl border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white"
        >
          <option value="newest">الأحدث</option>
          <option value="price_asc">السعر: من الأقل للأعلى</option>
          <option value="price_desc">السعر: من الأعلى للأقل</option>
        </select>
      </label>

      <button
        type="submit"
        className="lg:col-span-6 sm:col-span-2 rounded-xl py-2.5 font-bold bg-navy text-white hover:bg-navy-deep transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
      >
        تطبيق الفلاتر
      </button>
    </form>
  );
}
