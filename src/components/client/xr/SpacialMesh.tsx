"use client";

import React, { useRef, useState, useEffect } from "react";
import { TrackedMesh } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";

import type { ExtendedXRMesh } from "@coconut-xr/natuerlich/react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";
import RoomShadow from "./RoomShadow";
import { useMeshesAndPlanesContext } from "../providers/MeshesAndPlanesProvider";
import { useLobbyContext } from "../providers/LobbyProvider";

interface SpacialBox {
  mesh: ExtendedXRMesh;
  color?: string;
  name?: string;
  mass?: number;
}

function SpacialBox({ mesh, color = "red", name = "", mass = 1 }: SpacialBox) {
  const { gameState } = useLobbyContext();
  const { setMyMeshes } = useMeshesAndPlanesContext();
  const ref = useRef<Mesh>(null);
  const rigidRef = useRef<RapierRigidBody>(null);
  // const [test, setTest] = React.useState<Vector3>();
  // const id = useId();

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
          ({ mesh, name }) => mesh.uuid !== ref.current!.uuid,
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

  // if (gameState && gameState.me.isHiding && gameState.opponent.room) {
  //   console.log("opponent room", gameState.opponent.room);
  //   const oppMeshes = gameState.opponent.room.meshes;

  //   return (
  //     <>
  //       {oppMeshes.map(({ mesh, name }) => {
  //         <primitive name={name} key={mesh.uuid} object={mesh} />;
  //       })}
  //     </>
  //   );
  // }

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
