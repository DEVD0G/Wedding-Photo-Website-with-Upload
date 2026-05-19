"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Music, Pause } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/lib/config";

/**
 * Eleganter Musik-Schalter. Die Musik startet ausschließlich nach einem
 * Klick des Besuchers (kein Autoplay). Während die Musik läuft, wird eine
 * kleine Soundwave-Animation gezeigt; die Lautstärke ist regelbar.
 */
export function MusicController() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Im Admin-Bereich und auf der Live-Wall keinen Musik-Schalter zeigen.
  if (pathname.startsWith("/admin")) return null;

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      toast.error(
        "Es ist noch kein Lied hinterlegt. Lege eine Audiodatei unter „public/music.mp3“ ab.",
      );
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
      <audio ref={audioRef} src={siteConfig.musicUrl} loop preload="none" />

      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="glass flex items-center gap-2.5 rounded-full py-2.5 pl-3 pr-4 text-sm font-medium text-ink shadow-card"
        aria-label={playing ? "Musik pausieren" : "Musik starten"}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-golddeep text-ivory">
          {playing ? (
            <Pause size={15} fill="currentColor" />
          ) : (
            <Music size={15} />
          )}
        </span>
        {playing ? <Soundwave /> : <span>Musik starten</span>}
      </motion.button>

      {/* Lautstärke – erscheint, während die Musik läuft */}
      <AnimatePresence>
        {playing && (
          <motion.input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 80 }}
            exit={{ opacity: 0, width: 0 }}
            className="h-1.5 cursor-pointer accent-gold"
            aria-label="Lautstärke"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Soundwave() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-golddeep"
          animate={{ height: [4, 14, 7, 16, 4] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  );
}
