"use client";

import React from "react";
import { useInView } from "@react-spring/three";
import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { ArcadeScene } from "./ArcadeScene";

export default function ArcadeBackground() {
  const [loaded, setLoaded] = React.useState(false);
  const [ref, inView] = useInView({ once: true });

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute -z-40 h-full w-full transition-opacity duration-1000 ${
        inView && loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <Canvas
        onCreated={() => {
          console.log("loaded");
          setLoaded(true);
        }}
      >
        <ambientLight intensity={1} />
        <ArcadeScene />
        <Preload all />
      </Canvas>
    </div>
  );
}
