"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import type { Group } from "three";

/** Der rotierende Sternenhimmel (Three.js). */
function Sky({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (animate && group.current) {
      group.current.rotation.y += delta * 0.014;
      group.current.rotation.x += delta * 0.004;
    }
  });

  return (
    <group ref={group}>
      <Stars
        radius={120}
        depth={60}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={animate ? 0.7 : 0}
      />
      <Stars
        radius={80}
        depth={40}
        count={1200}
        factor={6}
        saturation={0}
        fade
        speed={animate ? 0.4 : 0}
      />
    </group>
  );
}

/** Canvas-Wrapper – wird nur clientseitig geladen (kein SSR). */
export default function StarrySkyCanvas() {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Sky animate={animate} />
    </Canvas>
  );
}
