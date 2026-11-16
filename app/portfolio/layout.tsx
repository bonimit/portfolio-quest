import type { ReactNode } from "react";
import { PortfolioSort } from "@/components/home/portfolio-sort";
import "./corrections.css";

/** Approved additive corrections; keep the protected page and effect components intact. */
export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PortfolioSort />
    </>
  );
}
