"use client";

import React, { useRef } from "react";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";

import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";

interface SandboxMesh {
  mesh: ExtendedXRMesh;
  color?: string;
  name?: string;
}

function SandboxMesh({ mesh, color = "red", name = "" }: SandboxMesh) {
  const ref = useRef<Mesh>(null);
  const rigidRef = useRef<RapierRigidBody>(null);

  return (
    <RigidBody
      name={name}
      ref={rigidRef}
      colliders={"trimesh"}
      canSleep={false}
      type={"fixed"}
    >
      <TrackedMesh ref={ref} mesh={mesh}>
        <meshBasicMaterial transparent opacity={0} color={color ?? "white"} />
      </TrackedMesh>
    </RigidBody>
  );
}

export default React.memo(SandboxMesh);
