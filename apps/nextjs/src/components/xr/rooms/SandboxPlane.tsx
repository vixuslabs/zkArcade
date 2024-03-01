"use client";

import React, { useRef } from "react";
import { TrackedPlane } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";

import type { ExtendedXRPlane } from "@coconut-xr/natuerlich/react";
import type { Mesh } from "three";
import type { RapierRigidBody } from "@react-three/rapier";

interface SpacialPlaneProps {
  plane: ExtendedXRPlane;
  color?: string;
  name?: string;
}

function SandboxPlane({
  plane,
  name = "",
  color = "black",
}: SpacialPlaneProps) {
  const ref = useRef<Mesh>(null);
  const rigidRef = useRef<RapierRigidBody>(null);

  return (
    <>
      <RigidBody
        name={name}
        ref={rigidRef}
        colliders={"trimesh"}
        canSleep={false}
        type="fixed"
      >
        <TrackedPlane ref={ref} plane={plane}>
          <meshPhongMaterial opacity={0} transparent color={color} />
        </TrackedPlane>
      </RigidBody>
    </>
  );
}
export default React.memo(SandboxPlane);
