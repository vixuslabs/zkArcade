"use client";

import React, { useEffect, useRef } from "react";
import { ExtendedXRMesh, TrackedMesh } from "@coconut-xr/natuerlich/react";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";

// import { SpacialBoxProps } from "@/utils/types";
import type { Mesh } from "three";

interface SpacialBox {
  mesh: ExtendedXRMesh;
  color?: string;
  name?: string;
  mass?: number;
}

function SpacialBox({ mesh, color = "red", name = "", mass = 1 }: SpacialBox) {
  const ref = useRef<Mesh>(null);
  const rigidRef = useRef<RapierRigidBody>(null);

  useEffect(() => {
    console.log(`box ref for ${name}`, ref.current);
    if (ref.current) {
      const world = ref.current.getWorldPosition(ref.current.position);
      console.log(`world position for mesh named ${name}`, world);
    }
  });

  return (
    <>
      <TrackedMesh ref={ref} mesh={mesh}>
        {color ? (
          <meshBasicMaterial
            wireframe
            color={name === "global mesh" ? "purple" : color}
          />
        ) : (
          <meshBasicMaterial wireframe color="white" /> // will eventually just make it transparent
        )}
      </TrackedMesh>
    </>
  );
}

export default React.memo(SpacialBox);
