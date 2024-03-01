"use client";

import React, { useEffect, useRef, useState } from "react";
import { useHotnCold } from "@/lib/stores";
import { HotnColdGameStatus } from "@/lib/types";
import { TrackedPlane } from "@coconut-xr/natuerlich/react";
import type { ExtendedXRPlane } from "@coconut-xr/natuerlich/react";
import { RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";

import { useMeshesAndPlanesContext } from "../../providers/MeshesAndPlanesProvider";

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
  const { status } = useHotnCold();

  const [init, setInit] = useState(false);

  useEffect(() => {
    if (init) {
      return;
    } else if (!plane) {
      // console.log("no plane");
      return;
    } else if (!ref.current) {
      // console.log("no ref");
      return;
    }

    if (status !== HotnColdGameStatus.LOADINGROOMS) return;

    void (() => {
      // console.log("inside IIFE");
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
  }, [ref, init, plane, setMyPlanes, name, status]);

  if (status === HotnColdGameStatus.SEEKING) {
    return null;
  }

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
            // wireframe
            color={color ?? "black"}
          />
        </TrackedPlane>
      </RigidBody>
    </>
  );
}
export default React.memo(GamePlane);
