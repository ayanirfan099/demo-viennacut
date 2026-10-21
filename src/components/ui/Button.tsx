
import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline";
  className?: string;
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-7 py-3 font-medium transition-colors";

  const variants = {
    primary:
      "bg-foreground text-white hover:bg-accent",
    outline:
      "border border-foreground text-foreground hover:bg-foreground hover:text-white",
  };

  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
