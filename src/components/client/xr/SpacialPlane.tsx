"use client";

import React, { useRef, useEffect } from "react";
import { ExtendedXRPlane, TrackedPlane } from "@coconut-xr/natuerlich/react";
import type { Mesh } from "three";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";

// import { SpacialPlaneProps } from "@/utils/types";

interface SpacialPlane {
  plane: ExtendedXRPlane;
  color?: string;
  name?: string;
  mass?: number;
}

function SpacialPlane({
  plane,
  name = "",
  mass = 1,
  color = "black",
}: SpacialPlane) {
  const ref = useRef<Mesh>(null);

  useEffect(() => {
    console.log(`plane ref for ${name}`, ref.current);
    if (ref.current) {
      const world = ref.current.getWorldPosition(ref.current.position);
      console.log(`world position for plane named ${name}`, world);
    }
  });

  return (
    <TrackedPlane ref={ref} plane={plane}>
      {color ? (
        <meshPhongMaterial wireframe color={color} />
      ) : (
        <meshPhongMaterial wireframe color="black" />
      )}
    </TrackedPlane>
  );
}
export default React.memo(SpacialPlane);
