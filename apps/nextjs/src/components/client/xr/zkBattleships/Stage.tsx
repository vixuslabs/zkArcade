"use client";

// import dynamic from "next/dynamic";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

// import { Int64 } from "o1js";

// import { Vector3 } from "@zkarcade/mina/src/structs";

// const Vector3 = dynamic(() => import("@zkarcade/mina/src/structs"));

import { Board } from "./Board";

export function Stage() {
  return (
    <Canvas>
      <OrbitControls />

      <Board />
    </Canvas>
  );
}
