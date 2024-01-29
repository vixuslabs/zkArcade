"use client";

import React, { useId } from "react";
import { FriendMesh, FriendPlane } from "@/components/client/xr/rooms";
import { useHotnCold } from "@/lib/stores";
import { useShallow } from "zustand/react/shallow";

function FriendRoom() {
  const opponent = useHotnCold(useShallow((state) => state.opponent));
  const id = useId();

  if (!opponent) {
    throw new Error("FriendRoom: opponent is null");
    return;
  }

  if (opponent.roomLayout === null) {
    throw new Error("FriendRoom: opponent.roomLayout is null");
    return;
  }

  if (opponent.roomLayout.meshes === null) {
    throw new Error("FriendRoom: opponent.roomLayout.meshes is null");
    return;
  }

  if (opponent.roomLayout.planes === null) {
    throw new Error("FriendRoom: opponent.roomLayout.planes is null");
    return;
  }

  console.log("\n-------------\n");

  console.log(
    "Inside FriendRoom component with opp roomlayout:",
    opponent.roomLayout,
  );

  return (
    <>
      <group key="meshes">
        {opponent.roomLayout.meshes.map(({ geometry, matrix, name }) => (
          <FriendMesh
            key={id}
            position={geometry.position}
            index={geometry.index}
            matrix={matrix}
            name={name}
          />
        ))}
      </group>

      <group key={"planes"}>
        {/* <SpacialPlane /> */}
        {opponent.roomLayout.planes.map(({ geometry, matrix, name }) => (
          <FriendPlane
            key={id}
            position={geometry.position}
            index={geometry.index}
            matrix={matrix}
            name={name}
          />
        ))}
      </group>
    </>
  );
}

export default React.memo(FriendRoom);
