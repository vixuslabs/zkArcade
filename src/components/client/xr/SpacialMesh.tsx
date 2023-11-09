"use client";

import React, { useRef } from "react";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";

import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";
import RoomShadow from "./RoomShadow";

interface SpacialBox {
  mesh: ExtendedXRMesh;
  color?: string;
  name?: string;
  mass?: number;
}

function SpacialBox({ mesh, color = "red", name = "", mass = 1 }: SpacialBox) {
  const ref = useRef<Mesh>(null);
  const rigidRef = useRef<RapierRigidBody>(null);
  // const [test, setTest] = React.useState<Vector3>();
  // const id = useId();

  // useEffect(() => {
  //   if (ref.current) {
  //     const world = ref.current.getWorldPosition(ref.current.position);
  //     setTest(world);
  //   }
  // });

  if (name === "global mesh") {
    return <RoomShadow mesh={mesh} />;
  }

  return (
    <RigidBody
      name={name}
      ref={rigidRef}
      colliders={"trimesh"}
      canSleep={false}
      type={"fixed"}
    >
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
    </RigidBody>
  );
}

export default React.memo(SpacialBox);
