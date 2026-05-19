import type { Metadata } from "next";
import { UploadForm } from "@/components/UploadForm";
import { FloralDivider } from "@/components/FloralDivider";
import { maxFileSizeMb, requireApproval } from "@/lib/config";

export const metadata: Metadata = {
  title: "Foto oder Video hochladen",
};

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="text-center">
        <p className="eyebrow">Teile deinen Moment</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Foto oder Video hochladen
        </h1>
        <p className="mx-auto mt-3 max-w-md text-cocoa">
          Danke, dass du diesen besonderen Tag mit uns festhältst. Jeder
          Augenblick zählt – ob groß oder klein.
        </p>
        <FloralDivider className="mt-6" />
      </div>

      <div className="mt-8">
        <UploadForm
          maxFileSizeMb={maxFileSizeMb}
          requireApproval={requireApproval}
        />
      </div>
    </div>
  );
}
