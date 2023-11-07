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

  /**
   * ONLY NEEDS TO BE WALLS, FLOOR, AND CEILING
   */

  return (
    <>
      {/* {test && (
        <mesh position={test}>
          <sphereGeometry args={[0.1, 50, 50]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )} */}
      <TrackedPlane ref={ref} plane={plane}>
        {/* {color ? (
          <meshPhongMaterial transparent opacity={0.1} color={color} />
        ) : (
          <meshPhongMaterial transparent opacity={0.2} color="black" />
        )} */}

        <meshPhysicalMaterial
          color={"#000000"}
          clearcoatRoughness={0.5}
          metalness={0}
          clearcoat={0.5}
          // transparent
          // opacity={0.5}
        />
      </TrackedPlane>
    </>
  );
}
export default React.memo(SpacialPlane);
