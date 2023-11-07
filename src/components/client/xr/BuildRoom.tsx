"use client";

import {
  useTrackedMeshes,
  useTrackedPlanes,
} from "@coconut-xr/natuerlich/react";
import SpacialMesh from "./SpacialMesh";
import SpacialPlane from "./SpacialPlane";
import { useId, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import _ from "lodash";

import fs from "fs";

function BuildRoom() {
  const meshes = useTrackedMeshes();
  const planes = useTrackedPlanes();
  const key = useId();

  console.log("rerender build room");
  const [init, setInit] = useState(false);

  // useEffect(() => {
  //   let timeout;

  //   if (!meshes || !planes) return;

  //   const timeoutFunc = () => {
  //     timeout = setTimeout(() => {
  //       console.log(planes);
  //       console.log(meshes);

  //       const _planes = planes.map((plane) => {
  //         const { initialPose, ...rest } = plane;
  //         const { transform, ...all } = initialPose!;

  //         return rest;
  //       });

  //       console.log(_planes);

  //       const body = JSON.stringify({ planes: _planes }, null, 2);

  //       console.log(body);

  //       void fetch("/api/room", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: body,
  //       });
  //     }, 5000);
  //   };

  //   if (
  //     meshes.length === 7 &&
  //     planes.length === 17 &&
  //     planes[0]?.polygon &&
  //     meshes[0]?.vertices
  //   ) {
  //     timeoutFunc();
  //   }

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [meshes, planes]);

  if (!meshes || !planes) return null;

  return (
    <>
      <group key="meshes">
        {meshes.map((mesh, index) => (
          <SpacialMesh
            key={key + `${index}`}
            mesh={mesh}
            name={mesh.semanticLabel}
          />
        ))}
      </group>

      <group key={"planes"}>
        {/* <SpacialPlane /> */}
        {planes.map((plane, index) => (
          <SpacialPlane
            key={key + `${index}`}
            plane={plane}
            name={plane.semanticLabel}
          />
        ))}
      </group>
    </>
  );
}

export default BuildRoom;
