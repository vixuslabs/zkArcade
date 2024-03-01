import React, { useRef } from "react";
import { getMeshId } from "@coconut-xr/natuerlich";
import { TrackedMesh, useTrackedMeshes } from "@coconut-xr/natuerlich/react";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";

interface RapierMeshesProps {
  children?: React.ReactNode;
  excludeGlobalMesh?: boolean;
  debug?: boolean;
}

export function RapierMeshes({
  children,
  excludeGlobalMesh = false,
  debug = false,
}: RapierMeshesProps) {
  const meshes = useTrackedMeshes();
  const meshRef = useRef<THREE.Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  return (
    <group name="room-meshes">
      {meshes?.map((mesh) => {
        if (excludeGlobalMesh && mesh.semanticLabel === "global mesh")
          return null;

        return (
          <RigidBody
            name={mesh.semanticLabel}
            key={getMeshId(mesh)}
            type="fixed"
            colliders={
              mesh.semanticLabel === "global mesh" ? "trimesh" : "hull"
            }
            ref={rigidBodyRef}
            collisionGroups={interactionGroups([7], [0, 1, 2, 3, 4, 5, 8])}
          >
            <TrackedMesh mesh={mesh} ref={meshRef}>
              {children ? (
                children
              ) : (
                <meshBasicMaterial
                  wireframe={debug}
                  transparent={!debug}
                  opacity={debug ? 100 : 0}
                  color={debug ? "purple" : "white"}
                />
              )}
            </TrackedMesh>
          </RigidBody>
        );
      })}
    </group>
  );
}
