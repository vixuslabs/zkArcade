"use client";

import { useId } from "react";
import {
  GameMesh,
  GamePlane,
  SandboxMesh,
  SandboxPlane,
} from "@/components/xr/rooms";
import {
  useTrackedMeshes,
  useTrackedPlanes,
} from "@coconut-xr/natuerlich/react";

import RoomShadow from "./RoomShadow";

function BuildRoom({
  inGame,
  syncingRoom,
}: {
  inGame: boolean;
  syncingRoom?: boolean;
}) {
  const meshes = useTrackedMeshes();
  const planes = useTrackedPlanes();
  // ik this is a bad idea im sorry
  const key = useId();

  if (!meshes || !planes) return null;

  if (inGame) {
    return (
      <>
        <group key="meshes">
          {meshes.map((mesh, index) => {
            if (mesh.semanticLabel === "global mesh") {
              if (syncingRoom) {
                return null;
              }

              return <RoomShadow key={mesh.semanticLabel} mesh={mesh} />;
            } else {
              return (
                <GameMesh
                  key={key + `${index}`}
                  mesh={mesh}
                  name={mesh.semanticLabel}
                />
              );
            }
          })}
        </group>

        <group key={"planes"}>
          {planes.map((plane, index) => (
            <GamePlane
              key={key + `${index}`}
              plane={plane}
              name={plane.semanticLabel}
            />
          ))}
        </group>
      </>
    );
  } else {
    return (
      <>
        <group key="meshes">
          {meshes.map((mesh, index) => (
            <SandboxMesh
              key={key + `${index}`}
              mesh={mesh}
              name={mesh.semanticLabel}
            />
          ))}
        </group>

        <group key={"planes"}>
          {planes.map((plane, index) => (
            <SandboxPlane
              key={key + `${index}`}
              plane={plane}
              name={plane.semanticLabel}
            />
          ))}
        </group>
      </>
    );
  }
}

export default BuildRoom;
