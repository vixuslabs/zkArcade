"use client";

import React, { useRef } from "react";
import { TrackedPlane } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";

import type { ExtendedXRPlane } from "@coconut-xr/natuerlich/react";
import type { Mesh } from "three";
import type { RapierRigidBody } from "@react-three/rapier";

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
  const rigidRef = useRef<RapierRigidBody>(null);
  // const [test, setTest] = React.useState<Vector3>();

  // useEffect(() => {
  //   console.log(`plane ref for ${name}`, ref.current);
  //   if (ref.current) {
  //     const world = ref.current.getWorldPosition(ref.current.position);
  //     setTest(world);
  //     console.log(`world position for plane named ${name}`, world);
  //   }
  // });

  /**
   * ONLY NEEDS TO BE WALLS, FLOOR, AND CEILING
   */

  return (
    <>
      <RigidBody
        name={name}
        ref={rigidRef}
        colliders={"trimesh"}
        canSleep={false}
        type="fixed"
        // onCollisionEnter={(e) => console.log(e)}
      >
        <TrackedPlane ref={ref} plane={plane}>
          {color ? (
            <meshPhongMaterial wireframe color={color} />
          ) : (
            <meshPhongMaterial wireframe color="black" />
          )}

          {/* <meshPhysicalMaterial
          color={"#000000"}
          clearcoatRoughness={0.5}
          metalness={0}
          clearcoat={0.5}

        /> */}
        </TrackedPlane>
      </RigidBody>
    </>
  );
}
export default React.memo(SpacialPlane);
