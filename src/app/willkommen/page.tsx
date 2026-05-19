import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guestCodeEnabled } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { GuestGateForm } from "@/components/GuestGateForm";
import { FloralDivider } from "@/components/FloralDivider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Willkommen",
};

export default function WelcomePage() {
  // Ist kein Gaeste-Code konfiguriert, ist die Seite frei zugaenglich.
  if (!guestCodeEnabled()) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-12">
      <div className="card w-full p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose to-rosedeep text-ivory shadow-soft">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-7-4.35-9.5-9C1 8.5 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23 8.5 21.5 12 19 16.65 12 21 12 21Z" />
          </svg>
        </div>
        <p className="mt-5 eyebrow">{siteConfig.projectName}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">
          Schön, dass du da bist
        </h1>
        <p className="mt-2 text-sm text-cocoa">
          Diese Seite ist nur für geladene Gäste. Bitte gib den Code ein, den du
          mit deiner Einladung erhalten hast.
        </p>
        <FloralDivider className="mt-5" />
        <GuestGateForm />
      </div>
    </div>
  );
}
