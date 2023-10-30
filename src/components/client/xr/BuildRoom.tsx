"use client";

import {
  useTrackedMeshes,
  useTrackedPlanes,
} from "@coconut-xr/natuerlich/react";
import { TrackedMesh, TrackedPlane } from "@coconut-xr/natuerlich/react";
import SpacialMesh from "./SpacialMesh";
import SpacialPlane from "./SpacialPlane";
import { useId } from "react";

function BuildRoom() {
  const meshes = useTrackedMeshes();
  const planes = useTrackedPlanes();
  const key = useId();

  console.log("rerender build room");

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

          //   <TrackedMesh key={mesh.semanticLabel + `${index}`} mesh={mesh}>
          //     <meshBasicMaterial wireframe color="red" />
          //   </TrackedMesh>
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

          //   <TrackedPlane key={plane.semanticLabel + `${index}`} plane={plane}>
          //     <meshPhongMaterial color="gray" wireframe />
          //   </TrackedPlane>
        ))}
      </group>
    </>
  );
}

export default BuildRoom;
