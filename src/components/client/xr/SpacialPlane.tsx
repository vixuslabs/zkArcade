"use client";

import React, { useRef, useEffect } from "react";
import { ExtendedXRPlane, TrackedPlane } from "@coconut-xr/natuerlich/react";
import type { Mesh, Vector3 } from "three";
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
  const [test, setTest] = React.useState<Vector3>();

  useEffect(() => {
    // console.log(`plane ref for ${name}`, ref.current);
    if (ref.current) {
      const world = ref.current.getWorldPosition(ref.current.position);
      setTest(world);
      // console.log(`world position for plane named ${name}`, world);
    }
  });

  return (
    <>
      {/* {test && (
        <mesh position={test}>
          <sphereGeometry args={[0.1, 50, 50]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )} */}
      <TrackedPlane ref={ref} plane={plane}>
        {color ? (
          <meshPhongMaterial wireframe color={color} />
        ) : (
          <meshPhongMaterial wireframe color="black" />
        )}
      </TrackedPlane>
    </>
  );
}
export default React.memo(SpacialPlane);
