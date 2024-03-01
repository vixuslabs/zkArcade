"use client";

import React from "react";
import { useTexture } from "@react-three/drei";

// import type { Vector3 } from "@react-three/fiber";

type FloorMeshProps = JSX.IntrinsicElements["mesh"];

interface FloorProps extends FloorMeshProps {
  floorSize?: [number, number, number];
}

function Floor({ floorSize }: FloorProps) {
  const textures = useTexture({
    diffuseMap: "./assets/arcadeFloor/concrete/diffuse.jpg",
    roughnessMap: "./assets/arcadeFloor/concrete/roughness.jpg",
    armMap: "./assets/arcadeFloor/concrete/arm.jpg",
    normalMap: "./assets/arcadeFloor/concrete/normal.jpg",
    aoMap: "./assets/arcadeFloor/concrete/ao.jpg",
    displacementMap: "./assets/arcadeFloor/concrete/displacement.jpg",
  });

  if (!textures) {
    console.log("no textures");
    return null;
  }

  return (
    <mesh receiveShadow position-y={-0.56} position-z={20}>
      <boxGeometry args={floorSize ?? [10, 0.1, 55]} />

      <meshStandardMaterial
        transparent
        opacity={0.2}
        map={textures.diffuseMap}
        normalMap={textures.normalMap}
        aoMap={textures.aoMap}
        roughnessMap={textures.armMap}
        metalnessMap={textures.armMap}
      />
    </mesh>
  );
}

export default Floor;
