export default function Badge({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "teal";
}) {
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${
        tone === "amber" ? "bg-amber" : "bg-teal"
      }`}
    >
      {children}
    </span>
  );
}
