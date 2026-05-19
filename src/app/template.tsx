import type { ReactNode } from "react";
import { PageTransition } from "@/components/animation/PageTransition";

/**
 * Next.js rendert dieses Template bei jeder Navigation neu –
 * dadurch entsteht ein eleganter Übergang zwischen den Seiten.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
