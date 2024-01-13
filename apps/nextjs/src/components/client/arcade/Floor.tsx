"use client";

import React from "react";
import { useTexture } from "@react-three/drei";

function Floor() {
  const textures = useTexture({
    diffuseMap: "./assets/arcadeFloor/concrete/diffuse.jpg",
    roughnessMap: "./assets/arcadeFloor/concrete/roughness.jpg",
    armMap: "./assets/arcadeFloor/concrete/arm.jpg",
    normalMap: "./assets/arcadeFloor/concrete/normal.jpg",
    aoMap: "./assets/arcadeFloor/concrete/ao.jpg",
    displacementMap: "./assets/arcadeFloor/concrete/displacement.jpg",
  });

  // const textures = useTexture({
  //   diffuseMap: "./assets/arcadeFloor/rubber/diffuse.jpg",
  //   armMap: "./assets/arcadeFloor/rubber/arm.jpg",
  //   aoMap: "./assets/arcadeFloor/rubber/ao.jpg",
  //   normalMap: "./assets/arcadeFloor/rubber/normal.jpg",
  //   displacementMap: "./assets/arcadeFloor/rubber/displacement.jpg",
  // });

  console.log("textures", textures);

  if (!textures) {
    console.log("no textures");
    return null;
  }

  return (
    <mesh receiveShadow position-y={-0.56} position-z={20}>
      <boxGeometry args={[10, 0.1, 55]} />

      <meshStandardMaterial
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
