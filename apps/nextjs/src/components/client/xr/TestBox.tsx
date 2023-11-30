"use client";

"use client";


import React, { useRef } from "react";
import { vec3 } from "@react-three/rapier";


import type { ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh, Vector3 } from "three";

function TestBox({
  color = "red",
  position = [0, 0, 0],
}: {
  color?: string;
  position?: [number, number, number];
}) {
  const rigidRef = useRef<RapierRigidBody>(null);
  const ref = useRef<Mesh>(null);
  const rigidAndMeshRef = useRef({
    rigidRef: rigidRef,
    ref: ref,
  });

  const handleGrab = (e: ThreeEvent<PointerEvent>) => {
    if (rigidRef.current) {
      rigidRef.current.setTranslation(vec3(e.point), true);
      rigidRef.current.resetTorques(true);
      rigidRef.current.resetForces(true);
      rigidRef.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }), true);
      rigidRef.current.setGravityScale(0, true);
    } else {
      console.log("rigidRef.current is not set");
    }
  };

  const handleRelease = (e: ThreeEvent<PointerEvent>, velocity?: Vector3) => {
    if (rigidRef.current) {
      rigidRef.current?.setGravityScale(1, true);
      rigidRef.current.setLinvel(vec3(velocity), true);
    } else {
      console.log("rigidRef.current is not set");
    }
  };

  // quick fix for lint warnigs
  if (!rigidAndMeshRef.current || !handleGrab || !handleRelease) return null;

  return (
    <mesh position={position}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export default React.memo(TestBox);
