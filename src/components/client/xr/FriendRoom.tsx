"use client";

import {
  useTrackedMeshes,
  useTrackedPlanes,
} from "@coconut-xr/natuerlich/react";
import SpacialMesh from "./SpacialMesh";
import SpacialPlane from "./SpacialPlane";
import { useId, useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  Matrix4,
} from "three";

import { useLobbyContext } from "../providers/LobbyProvider";

import { FriendMesh, FriendPlane } from ".";

function FriendRoom() {
  const { gameState } = useLobbyContext();

  console.log("inside friendRoom");
  console.log(
    "gameState?.opponent.info?.roomLayout",
    gameState?.opponent.info?.roomLayout,
  );

  // Apply the geometry and material to the mesh
  useEffect(() => {
    console.log("inside useEffect");
    console.log(gameState);
    console.log(
      "gameState?.opponent.info?.roomLayout?.meshes",
      gameState?.opponent.info?.roomLayout?.meshes,
    );
    console.log(
      "gameState?.opponent.info?.roomLayout?.meshes",
      gameState?.opponent.info?.roomLayout?.planes,
    );
  }, [
    gameState?.opponent.info?.roomLayout?.meshes,
    gameState?.opponent.info?.roomLayout?.planes,
    gameState,
  ]);

  if (
    !gameState?.opponent.info?.roomLayout?.meshes ||
    !gameState?.opponent.info?.roomLayout?.planes
  )
    return null;

  return (
    <>
      <group key="meshes">
        {gameState.opponent.info.roomLayout.meshes.map(
          ({ geometry, matrix, worldMatrix, name }, index) => (
            <FriendMesh
              key={name + `${index}`}
              positionData={geometry.position}
              indexData={geometry.index!}
              matrixData={matrix}
              // worldMatrixData={worldMatrix}
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
