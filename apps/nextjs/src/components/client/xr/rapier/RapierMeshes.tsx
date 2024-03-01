import React, { useRef } from "react";
import { getMeshId } from "@coconut-xr/natuerlich";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";

interface RapierMeshesProps {
  meshes: readonly ExtendedXRMesh[] | undefined;
  children?: React.ReactNode;
  excludeGlobalMesh?: boolean;
  debug?: boolean;
}

export function RapierMeshes({
  children,
  excludeGlobalMesh = false,
  debug = false,
  meshes,
}: RapierMeshesProps) {
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
