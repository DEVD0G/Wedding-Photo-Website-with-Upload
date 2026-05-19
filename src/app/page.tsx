import { storyChapters } from "@/lib/story";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import { PolaroidScrollFilm } from "@/components/film/PolaroidScrollFilm";
import { StoryChapter } from "@/components/film/StoryChapter";
import { LoveReasonCards } from "@/components/film/LoveReasonCards";
import { BrideSurpriseSection } from "@/components/film/BrideSurpriseSection";
import { StarrySkySection } from "@/components/film/StarrySkySection";
import { ThailandEasterEgg } from "@/components/film/ThailandEasterEgg";
import { EmotionalFinale } from "@/components/film/EmotionalFinale";
import { AnimatedFloralLine } from "@/components/animation/AnimatedFloralLine";

/**
 * Die Startseite ist ein interaktiver Liebesfilm: filmische Polaroid-
 * Sequenz, sechs Story-Kapitel, „100 Gründe", eine versteckte
 * Überraschung, ein Sternenhimmel, das Thailand-Easter-Egg und ein
 * emotionaler Abschluss.
 */
export default function HomePage() {
  return (
    <div className="overflow-x-clip">
      <AnimatedHero />

      <AnimatedFloralLine className="py-6" />

      {/* Filmische Polaroid-Sequenz */}
      <PolaroidScrollFilm />

      {/* Unsere Geschichte – sechs Kapitel */}
      {storyChapters.map((chapter, index) => (
        <StoryChapter key={chapter.numeral} chapter={chapter} index={index} />
      ))}

      {/* 100 Gründe */}
      <LoveReasonCards />

      {/* Versteckte Überraschung für die Braut */}
      <BrideSurpriseSection />

      {/* Digitaler Sternenhimmel */}
      <StarrySkySection />

      {/* Thailand-Easter-Egg */}
      <ThailandEasterEgg />

      {/* Emotionaler Abschluss */}
      <EmotionalFinale />
    </div>
  );
}
