"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";

import { ArcadeScene } from "./ArcadeScene";
import { useInView } from "@react-spring/three";

export default function ArcadeBackground() {
  const [loaded, setLoaded] = React.useState(false);
  const [ref, inView] = useInView({ once: true });

  return (
    <div
      ref={ref}
      className={`absolute w-full h-full pointer-events-none -z-40 transition-opacity duration-1000 ${
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
