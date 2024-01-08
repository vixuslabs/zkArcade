"use client";

import { useHotnCold } from "@/components/client/stores";
import { FriendMesh, FriendPlane } from "@/components/client/xr/rooms";

function FriendRoom() {
  const { opponent } = useHotnCold();

  if (!opponent || !opponent.roomLayout !== null) return null;

  return (
    <>
      <group key="meshes">
        {opponent.roomLayout?.meshes.map(
          ({ geometry, matrix, name }, index) => (
            <FriendMesh
              key={name + `${index}`}
              positionData={geometry.position}
              indexData={geometry.index!}
              matrixData={matrix}
              name={name}
            />
          ),
        )}
      </group>

      <group key={"planes"}>
        {/* <SpacialPlane /> */}
        {opponent.roomLayout?.planes.map(
          ({ geometry, matrix, name }, index) => (
            <FriendPlane
              key={name + `${index}`}
              positionData={geometry.position}
              indexData={geometry.index!}
              matrixData={matrix}
              name={name}
            />
          ),
        )}
      </group>
    </>
  );
}

export default FriendRoom;
