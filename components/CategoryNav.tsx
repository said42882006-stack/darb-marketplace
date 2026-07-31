import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryNav({ active }: { active?: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/"
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
          !active ? "bg-teal text-white border-teal" : "bg-white text-ink border-line hover:border-teal"
        }`}
      >
        الكل
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.id}`}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
            active === c.id ? "bg-teal text-white border-teal" : "bg-white text-ink border-line hover:border-teal"
          }`}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
