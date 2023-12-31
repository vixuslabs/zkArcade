"use client";

import React, { useRef, useState, useEffect } from "react";
import { TrackedPlane } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";
import { useMeshesAndPlanesContext } from "../../providers/MeshesAndPlanesProvider";

import type { ExtendedXRPlane } from "@coconut-xr/natuerlich/react";
import type { Mesh } from "three";
import type { RapierRigidBody } from "@react-three/rapier";

// import { SpacialPlaneProps } from "@/utils/types";

interface SpacialPlane {
  plane: ExtendedXRPlane;
  color?: string;
  name?: string;
}

function GamePlane({ plane, name = "", color = "black" }: SpacialPlane) {
  const { setMyPlanes } = useMeshesAndPlanesContext();
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

  const [init, setInit] = useState(false);

  useEffect(() => {
    if (init) {
      return;
    } else if (!plane) {
      console.log("no plane");
      return;
    } else if (!ref.current) {
      console.log("no ref");
      return;
    }

    void (() => {
      console.log("inside IIFE");
      setInit(true);

      setMyPlanes((prev) => {
        if (name === "global mesh") {
          return prev;
        }

        const isUnique = prev.every(
          ({ plane }) => plane.uuid !== ref.current!.uuid,
        );

        if (!isUnique) {
          return prev;
        }

        return [
          ...prev,
          {
            plane: ref.current!,
            name,
          },
        ];
      });
    })();
  }, [ref, init, plane, setMyPlanes, name]);

  return (
    <>
      <RigidBody
        name={name}
        ref={rigidRef}
        colliders={"trimesh"}
        canSleep={false}
        type="fixed"
      >
        <TrackedPlane ref={ref} plane={plane}>
          <meshPhongMaterial
            transparent
            opacity={0}
            wireframe
            color={color ?? "black"}
          />
        </TrackedPlane>
      </RigidBody>
    </>
  );
}
export default React.memo(GamePlane);
