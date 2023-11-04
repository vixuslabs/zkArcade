"use client";

import React, { useState } from "react";
import { SpotLight } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/**
 * This componnent was made by the team at @coconut-xr thx!
 * @returns
 */
function Lamp({ position }: { position: [number, number, number] }) {
  const cameras = useThree((state) => state.camera);

  const [target] = useState(() => new THREE.Object3D());
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.5, 1.5, 2, 32]} />
      <meshStandardMaterial />
      <SpotLight
        target={target}
        penumbra={0.2}
        radiusTop={0.4}
        radiusBottom={40}
        distance={80}
        angle={0.45}
        attenuation={20}
        anglePower={5}
        intensity={1}
        opacity={0.5}
      />
      <primitive object={target} position={[0, -1, 0]} />
    </mesh>
  );
}

export default Lamp;
