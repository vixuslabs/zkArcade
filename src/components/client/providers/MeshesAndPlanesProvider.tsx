"use client";

import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useRef,
} from "react";

import type { Mesh } from "three";
import type {
  ExtendedXRPlane,
  ExtendedXRMesh,
} from "@coconut-xr/natuerlich/react";
import { useLobbyContext } from "./LobbyProvider";

const MeshesAndPlanesContext = createContext();

export const useMeshesAndPlanesContext = () => {
  const context = useContext(MeshesAndPlanesContext);
  if (!context) {
    throw new Error(
      "useMeshesAndPlanesContext must be used within a MeshesAndPlanesProvider",
    );
  }
  return context;
};

function MeshesAndPlanesProvider({ children }: { children: React.ReactNode }) {
  const { channel } = useLobbyContext();
  const [myMeshes, setMyMeshes] = useState<Mesh[]>([]);
  const [myPlanes, setMyPlanes] = useState<Mesh[]>([]);
  const [enemyMeshes, setEnemyMeshes] = useState<Mesh[]>([]);
  const [enemyPlanes, setEnemyPlanes] = useState<Mesh[]>([]);

  const values = useMemo(() => {
    return {
      setMyMeshes,
      setMyPlanes,
      enemyMeshes,
      enemyPlanes,
    };
  }, [setMyMeshes, setMyPlanes, enemyPlanes, enemyMeshes]);

  // will be sending these meshes and planes to
  // the other client, who you are playing with

  return (
    <MeshesAndPlanesContext.Provider value={values}>
      {children}
    </MeshesAndPlanesContext.Provider>
  );
}

export default MeshesAndPlanesProvider;
