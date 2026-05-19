import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/config";
import { TeamInviteForm } from "@/components/TeamInviteForm";
import { FloralDivider } from "@/components/FloralDivider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team-Einladung",
};

export default async function TeamInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await prisma.teamInvite
    .findUnique({ where: { token: params.token } })
    .catch(() => null);
  const valid = !!invite && !invite.revoked;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-12">
      <div className="card w-full p-8 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-soft ${
            valid
              ? "bg-gradient-to-br from-gold to-golddeep text-ivory"
              : "bg-blush/60 text-rosedeep"
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3.5 20a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
            <path d="M18 8v6M21 11h-6" strokeLinecap="round" />
          </svg>
        </div>

        {valid ? (
          <>
            <p className="mt-5 eyebrow">{siteConfig.projectName}</p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              Du wurdest ins Team eingeladen
            </h1>
            <p className="mt-2 text-sm text-cocoa">
              {siteConfig.coupleNames} möchten, dass du beim Verwalten der
              Hochzeitsgalerie hilfst. Mit einem Klick erhältst du Zugriff auf
              den Admin-Bereich.
            </p>
            {invite?.label && (
              <p className="mt-3 text-sm text-muted">
                Einladung für: <strong className="text-cocoa">{invite.label}</strong>
              </p>
            )}
            <FloralDivider className="mt-5" />
            <TeamInviteForm token={params.token} />
          </>
        ) : (
          <>
            <h1 className="mt-5 font-display text-3xl text-ink">
              Einladung ungültig
            </h1>
            <p className="mt-2 text-sm text-cocoa">
              Dieser Einladungslink ist nicht (mehr) gültig oder wurde
              zurückgezogen. Bitte wende dich an das Brautpaar.
            </p>
            <Link href="/" className="btn-outline mt-6">
              Zur Startseite
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
