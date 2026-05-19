import Link from "next/link";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/config";
import { FloralDivider } from "@/components/FloralDivider";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [mediaCount, guestbookCount] = await Promise.all([
    prisma.media.count({ where: { approved: true } }).catch(() => 0),
    prisma.guestbookEntry.count().catch(() => 0),
  ]);

  return (
    <div className="overflow-hidden">
      {/* ---------- Hero ---------- */}
      <section className="relative mx-auto max-w-4xl px-5 pb-10 pt-14 text-center sm:pt-20">
        <span className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-blush/40 blur-3xl" />
        <span className="pointer-events-none absolute -right-10 top-24 h-44 w-44 rounded-full bg-beige/50 blur-3xl" />

        <p className="animate-fade-up eyebrow">Herzlich willkommen</p>

        <div className="mt-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-ivory/80 shadow-soft">
            <span className="font-display text-3xl font-semibold text-gold">
              P
            </span>
          </div>
        </div>

        <h1
          className="mt-6 animate-fade-up font-display text-5xl font-semibold leading-[1.05] text-ink text-balance sm:text-6xl"
          style={{ animationDelay: "140ms" }}
        >
          Willkommen bei unseren
          <span className="mt-1 block script-accent text-6xl font-normal sm:text-7xl">
            Petersen-Momenten
          </span>
        </h1>

        {siteConfig.weddingDate && (
          <p
            className="mt-4 animate-fade-up text-sm uppercase tracking-wider2 text-gold"
            style={{ animationDelay: "200ms" }}
          >
            {siteConfig.coupleNames} · {siteConfig.weddingDate}
          </p>
        )}

        <p
          className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-cocoa text-balance"
          style={{ animationDelay: "260ms" }}
        >
          Willkommen bei unseren schönsten Momenten. Lade deine schönsten Fotos
          und Videos von unserem Hochzeitstag hoch und teile sie mit uns und
          unseren Gästen.
        </p>

        <div
          className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "320ms" }}
        >
          <Link href="/upload" className="btn-gold w-full text-base sm:w-auto">
            Foto oder Video hochladen
          </Link>
          <Link href="/galerie" className="btn-outline w-full text-base sm:w-auto">
            Galerie ansehen
          </Link>
        </div>

        <div
          className="mt-10 flex animate-fade-up items-center justify-center gap-8 text-center"
          style={{ animationDelay: "380ms" }}
        >
          <div>
            <p className="font-display text-3xl text-gold">{mediaCount}</p>
            <p className="text-xs uppercase tracking-wider text-muted">
              geteilte Momente
            </p>
          </div>
          <span className="h-10 w-px bg-beige" />
          <div>
            <p className="font-display text-3xl text-gold">{guestbookCount}</p>
            <p className="text-xs uppercase tracking-wider text-muted">
              liebe Grüße
            </p>
          </div>
        </div>
      </section>

      <FloralDivider className="my-4" />

      {/* ---------- So funktioniert's ---------- */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="text-center">
          <p className="eyebrow">In drei Schritten</p>
          <h2 className="mt-2 font-display text-4xl text-ink">
            So einfach geht&apos;s
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Hochladen",
              text: "Wähle deine Fotos und Videos vom Handy aus oder ziehe sie einfach ins Upload-Feld.",
              icon: (
                <path d="M12 16V5m0 0L7 10m5-5l5 5M5 19h14" />
              ),
            },
            {
              title: "Anschauen",
              text: "Stöbere in der Galerie durch alle Augenblicke, vergib Herzen und hinterlasse Kommentare.",
              icon: (
                <>
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M3 16l5-4 4 3 3-3 6 5" />
                </>
              ),
            },
            {
              title: "Herunterladen",
              text: "Lade deine Lieblingsmomente herunter und behalte die Erinnerungen für immer.",
              icon: <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />,
            },
          ].map((step, i) => (
            <div
              key={step.title}
              className="card animate-fade-up p-7 text-center"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-golddeep text-ivory shadow-soft">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {step.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-display text-2xl text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- QR-Hinweis ---------- */}
      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="card grid gap-6 p-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-beige bg-cream">
            <svg
              width="58"
              height="58"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="text-gold"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM20 14v3M14 20h7" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-display text-2xl text-ink">
              Per QR-Code mit dabei
            </h3>
            <p className="mt-2 text-cocoa">
              Über die kleinen Kärtchen auf den Tischen gelangst du mit einem
              Scan direkt hierher. Den passenden QR-Code findet das Brautpaar
              jederzeit im Admin-Bereich.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Schluss-Zitat ---------- */}
      <section className="mx-auto max-w-3xl px-5 py-14 text-center">
        <FloralDivider />
        <p className="mt-7 font-display text-3xl italic leading-relaxed text-ink sm:text-4xl">
          „Die schönsten Erinnerungen entstehen, wenn viele Augen denselben
          Moment einfangen.“
        </p>
        <p className="mt-4 font-script text-3xl text-rosedeep">
          {siteConfig.coupleNames}
        </p>
      </section>
    </div>
  );
}
