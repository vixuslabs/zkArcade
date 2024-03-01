import React, { useRef } from "react";
import { getPlaneId } from "@coconut-xr/natuerlich";
import type { ExtendedXRPlane } from "@coconut-xr/natuerlich/react";
import { TrackedPlane } from "@coconut-xr/natuerlich/react";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";

interface RapierPlanesProps {
  planes: readonly ExtendedXRPlane[] | undefined;
  children?: React.ReactNode;
  debug?: boolean;
}

export function RapierPlanes({
  planes,
  children,
  debug = false,
}: RapierPlanesProps) {
  const planeRef = useRef<THREE.Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  return (
    <group name="room-planes">
      {planes?.map((plane) => (
        <RigidBody
          key={getPlaneId(plane)}
          // using same rigidBodyRef for all meshes
          // NEED TO CHANGE
          ref={rigidBodyRef}
          colliders="cuboid"
          type="fixed"
          collisionGroups={interactionGroups([6], [0, 1, 2, 3, 4, 5, 8])}
        >
          <TrackedPlane
            plane={plane}
            ref={planeRef}
            // meshRef={meshRef}
            // rigidBodyRef={rigidBodyRef}
          >
            {children ? (
              children
            ) : (
              <meshPhongMaterial
                wireframe={debug}
                opacity={debug ? 100 : 0}
                transparent={!debug}
                color={debug ? "red" : "white"}
              />
            )}
          </TrackedPlane>
        </RigidBody>
      ))}
    </group>
  );
}
