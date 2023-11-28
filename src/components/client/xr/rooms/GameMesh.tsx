"use client";

import React, { useRef, useState, useEffect } from "react";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";

import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";
import RoomShadow from "../RoomShadow";
import { useMeshesAndPlanesContext } from "../../providers/MeshesAndPlanesProvider";

interface GameMeshProps {
  mesh: ExtendedXRMesh;
  color?: string;
  name?: string;
}

function GameMesh({ mesh, color = "red", name = "" }: GameMeshProps) {
  const { setMyMeshes } = useMeshesAndPlanesContext();
  const ref = useRef<Mesh>(null);
  const rigidRef = useRef<RapierRigidBody>(null);

  const [init, setInit] = useState(false);

  useEffect(() => {
    if (init) {
      return;
    } else if (!mesh) {
      console.log("no mesh");
      return;
    } else if (!ref.current) {
      console.log("no ref");
      return;
    }

    void (() => {
      console.log("inside IIFE");
      setInit(true);

      setMyMeshes((prev) => {
        if (name === "global mesh") {
          return prev;
        }

        const isUnique = prev.every(
          ({ mesh }) => mesh.uuid !== ref.current!.uuid,
        );

        if (!isUnique) {
          return prev;
        }

        return [
          ...prev,
          {
            mesh: ref.current!,
            name,
          },
        ];
      });
    })();
  }, [ref, init, mesh, setMyMeshes, name]);

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
        <meshBasicMaterial
          transparent
          opacity={0}
          wireframe
          color={color ?? "black"}
        />
      </TrackedMesh>
    </RigidBody>
  );
}

export default React.memo(GameMesh);
