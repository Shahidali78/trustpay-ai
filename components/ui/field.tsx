import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: Readonly<{
  label: string;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <label className={cn("block text-sm font-medium text-slate-300", className)}>
      <span>{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClassName =
  "focus-ring w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-500";

export const textareaClassName =
  "focus-ring min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-500";
