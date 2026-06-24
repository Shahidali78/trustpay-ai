import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: false;
  href?: never;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild: true;
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-cyan-300 text-slate-950 hover:bg-cyan-200 border border-cyan-200",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 border border-slate-700",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/8 border border-slate-700/60",
  danger:
    "bg-rose-400 text-slate-950 hover:bg-rose-300 border border-rose-300",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

function buttonClassName({
  className,
  variant = "primary",
  size = "md",
}: {
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  const { className, variant, size } = props;

  if (props.asChild) {
    return (
      <Link
        href={props.href}
        className={buttonClassName({ className, variant, size })}
        target={props.target}
        rel={props.rel}
        title={props.title}
        aria-label={props["aria-label"]}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClassName({ className, variant, size })}
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
      name={props.name}
      value={props.value}
      aria-label={props["aria-label"]}
    >
      {props.children}
    </button>
  );
}
