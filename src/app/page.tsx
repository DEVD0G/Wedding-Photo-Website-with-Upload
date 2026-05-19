import { Clapperboard, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { siteConfig, maxFileSizeMb, requireApproval } from "@/lib/config";
import { getVisibleMedia, getVisitorId, serializeGuestbook } from "@/lib/media";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import { ScrollStorySection } from "@/components/home/ScrollStorySection";
import { HorizontalMoments } from "@/components/home/HorizontalMoments";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";
import { AnimatedFloralLine } from "@/components/animation/AnimatedFloralLine";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { MotionButton } from "@/components/animation/MotionButton";
import { AnimatedUploadCard } from "@/components/AnimatedUploadCard";
import { MasonryGallery } from "@/components/MasonryGallery";
import { GuestbookWall } from "@/components/GuestbookWall";

export const dynamic = "force-dynamic";

const STORY = [
  {
    eyebrow: "Der Anfang",
    title: "Ein Tag voller Liebe",
    script: "Liebe",
    body: "Es begann mit einem Versprechen und einem Strahlen, das sich auf alle übertrug. Ein Tag, an dem die Zeit kurz innehielt, um diesen einen Moment für immer zu bewahren.",
    tone: "light" as const,
  },
  {
    eyebrow: "Wenn der Tag sich neigt",
    title: "Ein Abend voller Erinnerungen",
    script: "Erinnerungen",
    body: "Kerzenlicht, leise Musik und das Lachen der Liebsten. Während der Himmel sich golden färbte, wurde aus einem Fest eine Sammlung unvergesslicher Augenblicke.",
    tone: "dark" as const,
  },
  {
    eyebrow: "Deine Sicht",
    title: "Eure Perspektive zählt",
    script: "Perspektive",
    body: "Jeder von euch hat etwas gesehen, das wir verpasst haben – ein Lächeln, eine Träne, eine Umarmung. Genau diese Blickwinkel machen unsere Geschichte vollständig.",
    tone: "light" as const,
  },
  {
    eyebrow: "Gemeinsam",
    title: "Jeder Moment wird Teil unserer Geschichte",
    script: "Geschichte",
    body: "Aus euren Fotos und Videos entsteht ein gemeinsames Album voller Wärme. Teile deine schönsten Aufnahmen – und schreibe mit uns an dieser Erinnerung.",
    tone: "dark" as const,
  },
];

export default async function HomePage() {
  const visitorId = getVisitorId();
  const [media, guestbookRows] = await Promise.all([
    getVisibleMedia(visitorId).catch(() => []),
    prisma.guestbookEntry
      .findMany({ orderBy: { createdAt: "desc" }, take: 6 })
      .catch(() => []),
  ]);
  const guestbook = guestbookRows.map(serializeGuestbook);

  return (
    <div className="overflow-x-clip">
      <AnimatedHero />

      <AnimatedFloralLine className="py-6" />

      {/* ---------- Story-Scroll ---------- */}
      <div>
        {STORY.map((s, i) => (
          <ScrollStorySection
            key={s.title}
            index={i}
            eyebrow={s.eyebrow}
            title={s.title}
            script={s.script}
            body={s.body}
            tone={s.tone}
          />
        ))}
      </div>

      {/* ---------- Horizontale Momente ---------- */}
      <HorizontalMoments />

      {/* ---------- Upload-CTA ---------- */}
      <section className="relative py-20" id="upload">
        <div className="mx-auto max-w-2xl px-5">
          <AnimatedSectionTitle
            eyebrow="Sei dabei"
            title="Teile deinen Moment"
            subtitle="Danke, dass du diesen besonderen Tag mit uns festhältst. Ziehe deine Fotos und Videos einfach hierher."
          />
          <ScrollReveal className="mt-10" delay={0.1}>
            <AnimatedUploadCard
              maxFileSizeMb={maxFileSizeMb}
              requireApproval={requireApproval}
            />
          </ScrollReveal>
        </div>
      </section>

      <AnimatedFloralLine className="py-6" />

      {/* ---------- Galerie-Vorschau ---------- */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-5">
          <AnimatedSectionTitle
            eyebrow="Unsere Erinnerungen"
            title="Galerie der Momente"
            subtitle="Ein erster Blick in die Augenblicke, die unsere Gäste mit uns geteilt haben."
          />
          <div className="mt-12">
            <MasonryGallery initialMedia={media} limit={8} />
          </div>
        </div>
      </section>

      {/* ---------- Gästebuch ---------- */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-5">
          <AnimatedSectionTitle
            eyebrow="Worte, die bleiben"
            title="Unser Gästebuch"
            script="mit Liebe geschrieben"
            subtitle="Eure Glückwünsche begleiten uns auf unserem gemeinsamen Weg."
          />
          <div className="mt-12">
            <GuestbookWall initialEntries={guestbook} preview />
          </div>
        </div>
      </section>

      {/* ---------- Slideshow-Teaser ---------- */}
      <section className="relative py-20">
        <div className="mx-auto max-w-5xl px-5">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-5xl border border-white/12 bg-noir px-7 py-14 text-center shadow-card sm:px-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(26rem 26rem at 50% 18%, rgba(198,162,75,0.32), transparent 62%)",
                }}
              />
              <div className="relative">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Clapperboard size={28} />
                </span>
                <p className="mt-5 eyebrow">Für Beamer & Fernseher</p>
                <h2 className="mt-2 font-display text-4xl text-ivory sm:text-5xl">
                  Der cineastische Slideshow-Modus
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-ivory/70">
                  Lehn dich zurück und lass alle Momente mit weichen Ken-Burns-
                  Übergängen an dir vorüberziehen – im eleganten Vollbild.
                </p>
                <div className="mt-7 flex justify-center">
                  <MotionButton href="/slideshow" variant="gold">
                    <Sparkles size={18} />
                    Slideshow starten
                  </MotionButton>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- Schluss ---------- */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <AnimatedFloralLine />
        <ScrollReveal className="mt-8">
          <p className="font-display text-3xl italic leading-relaxed text-ink sm:text-4xl">
            „Die schönsten Erinnerungen entstehen, wenn viele Augen denselben
            Moment einfangen.“
          </p>
          <p className="mt-5 font-script text-4xl text-rosedeep">
            {siteConfig.coupleNames}
          </p>
        </ScrollReveal>
      </section>
    </div>
  );
}
