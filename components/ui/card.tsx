import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className={cn("glass-panel rounded-lg p-6", className)}>
      {children}
    </div>
  );
}
