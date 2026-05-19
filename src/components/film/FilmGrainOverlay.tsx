/**
 * Dezente Filmkörnung über der gesamten Seite – verleiht den analogen
 * Look. Reine CSS-Ebene, blockiert keine Klicks. Die Bewegung wird bei
 * `prefers-reduced-motion` automatisch gestoppt (siehe globals.css).
 */
export function FilmGrainOverlay() {
  return (
    <div aria-hidden="true" className="film-grain pointer-events-none fixed inset-0 z-[58]" />
  );
}
