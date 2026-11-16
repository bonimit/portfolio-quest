import Link from "next/link";
import type { ReactNode } from "react";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function ActionLink({ href, children, variant = "primary" }: ActionLinkProps) {
  const label = children === "View Portfolio" && href === "/work" ? "Selected Work" : children;
  return (
    <Link href={href} className={`action-link action-link--${variant}`}>
      <span className="action-link-label">{label}</span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
