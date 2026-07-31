import { ArrowRight } from "lucide-react";

export default function RouteLine({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink">
      <div className="flex items-center gap-1 shrink-0">
        <span className="w-2 h-2 rounded-full bg-teal" />
        <span className="font-medium">{from}</span>
      </div>
      <div className="flex-1 border-t border-dashed border-line" />
      <ArrowRight className="w-3.5 h-3.5 shrink-0 rotate-180 text-muted" />
      <div className="flex-1 border-t border-dashed border-line" />
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-medium">{to}</span>
        <span className="w-2 h-2 rounded-full bg-amber" />
      </div>
    </div>
  );
}
