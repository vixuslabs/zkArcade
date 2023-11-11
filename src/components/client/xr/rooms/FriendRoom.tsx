"use client";

import { useLobbyContext } from "@/components/client/providers/LobbyProvider";
import { FriendMesh, FriendPlane } from "@/components/client/xr/rooms";

function FriendRoom() {
  const { gameState } = useLobbyContext();

  if (
    !gameState?.opponent.info?.roomLayout?.meshes ||
    !gameState?.opponent.info?.roomLayout?.planes
  )
    return null;

  return (
    <>
      <group key="meshes">
        {gameState.opponent.info.roomLayout.meshes.map(
          ({ geometry, matrix, name }, index) => (
            <FriendMesh
              key={name + `${index}`}
              positionData={geometry.position}
              indexData={geometry.index!}
              matrixData={matrix}
            />
          ),
        )}
      </group>

      <group key={"planes"}>
        {/* <SpacialPlane /> */}
        {gameState?.opponent.info?.roomLayout?.planes.map(
          ({ geometry, matrix, worldMatrix, name }, index) => (
            <FriendPlane
              key={name + `${index}`}
              positionData={geometry.position}
              indexData={geometry.index!}
              matrixData={matrix}
              // worldMatrixData={worldMatrix}
            />
          ),
        )}
      </group>
    </>
  );
}

export default FriendRoom;
