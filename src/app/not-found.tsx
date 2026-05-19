import Link from "next/link";
import { FloralDivider } from "@/components/FloralDivider";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-12">
      <div className="card w-full p-8 text-center">
        <p className="font-display text-6xl text-gold">404</p>
        <FloralDivider className="mt-4" />
        <h1 className="mt-5 font-display text-3xl text-ink">
          Diese Seite haben wir verlegt
        </h1>
        <p className="mt-2 text-cocoa">
          Hier ist leider nichts zu finden – aber unsere schönsten Momente
          warten an anderer Stelle auf dich.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold">
            Zur Startseite
          </Link>
          <Link href="/galerie" className="btn-outline">
            Zur Galerie
          </Link>
        </div>
      </div>
    </div>
  );
}
