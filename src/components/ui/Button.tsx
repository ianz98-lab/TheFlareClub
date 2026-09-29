import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "terracotta" | "light" | "text";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xs text-[12px] font-medium uppercase tracking-[0.14em] transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-espresso text-cream hover:bg-terracotta",
  terracotta: "bg-terracotta text-cream hover:bg-espresso",
  outline: "border border-espresso text-espresso hover:bg-espresso hover:text-cream",
  light: "bg-cream text-espresso hover:bg-cream-deep",
  text: "text-espresso underline underline-offset-4 decoration-1 hover:text-terracotta px-0",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-6",
  lg: "h-13 px-8",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${variant === "text" ? "" : sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className = "", children, href, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${variant === "text" ? "" : sizes[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
