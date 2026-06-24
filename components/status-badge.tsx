import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Created: "border-slate-500/30 bg-slate-500/12 text-slate-200",
  Funded: "border-cyan-300/30 bg-cyan-300/12 text-cyan-100",
  Submitted: "border-amber-300/30 bg-amber-300/12 text-amber-100",
  Completed: "border-emerald-300/30 bg-emerald-300/12 text-emerald-100",
  Disputed: "border-rose-300/30 bg-rose-300/12 text-rose-100",
  Refunded: "border-violet-300/30 bg-violet-300/12 text-violet-100",
  Open: "border-rose-300/30 bg-rose-300/12 text-rose-100",
  Resolved: "border-emerald-300/30 bg-emerald-300/12 text-emerald-100",
};

export function StatusBadge({
  status,
  className,
}: Readonly<{ status: string; className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusStyles[status] || statusStyles.Created,
        className,
      )}
    >
      {status}
    </span>
  );
}
