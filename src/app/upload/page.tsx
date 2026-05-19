import type { Metadata } from "next";
import { AnimatedUploadCard } from "@/components/AnimatedUploadCard";
import { AnimatedSectionTitle } from "@/components/animation/AnimatedSectionTitle";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { maxFileSizeMb, requireApproval } from "@/lib/config";

export const metadata: Metadata = {
  title: "Foto oder Video hochladen",
};

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <AnimatedSectionTitle
        eyebrow="Teile deinen Moment"
        title="Foto oder Video hochladen"
        subtitle="Danke, dass du diesen besonderen Tag mit uns festhältst. Jeder Augenblick zählt – ob groß oder klein."
      />
      <ScrollReveal className="mt-10" delay={0.1}>
        <AnimatedUploadCard
          maxFileSizeMb={maxFileSizeMb}
          requireApproval={requireApproval}
        />
      </ScrollReveal>
    </div>
  );
}
