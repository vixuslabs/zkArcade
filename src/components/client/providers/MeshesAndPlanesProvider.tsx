"use client";

import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";

import type { Mesh } from "three";
import type {
  ExtendedXRPlane,
  ExtendedXRMesh,
} from "@coconut-xr/natuerlich/react";
import { useLobbyContext } from "./LobbyProvider";

interface MeshInfo {
  mesh: Mesh;
  name: string;
}

interface PlaneInfo {
  plane: Mesh;
  name: string;
}

interface MeshesAndPlanesContextValue {
  setMyMeshes: React.Dispatch<React.SetStateAction<MeshInfo[]>>;
  setMyPlanes: React.Dispatch<React.SetStateAction<PlaneInfo[]>>;
  enemyMeshes: Mesh[];
  enemyPlanes: Mesh[];
}

const MeshesAndPlanesContext = createContext<MeshesAndPlanesContextValue>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMyMeshes: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMyPlanes: () => {},
  enemyMeshes: [],
  enemyPlanes: [],
});

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
  const [myMeshes, setMyMeshes] = useState<MeshInfo[]>([]);
  const [myPlanes, setMyPlanes] = useState<PlaneInfo[]>([]);
  const [enemyMeshes, setEnemyMeshes] = useState<Mesh[]>([]);
  const [enemyPlanes, setEnemyPlanes] = useState<Mesh[]>([]);

  useEffect(() => {
    if (myMeshes.length > 0 && myPlanes.length > 0) {
      console.log("sending room layout");
      console.log("myMeshes: ", myMeshes);
      console.log("myPlanes: ", myPlanes);
      console.log("channel: ", channel);

      const formatedMeshes = myMeshes.map(({ mesh, name }) => {
        // const { mesh, name } = _mesh;

        return {
          geometry: {
            position: mesh.geometry.attributes.position,
            index: mesh.geometry.index,
          },
          matrix: mesh.matrix,
          name: name,
        };
      });

      const formatedPlanes = myPlanes.map(({ plane, name }) => {
        // const { plane, name } = _plane;

        return {
          geometry: {
            position: plane.geometry.attributes.position,
            index: plane.geometry.index,
          },
          matrix: plane.matrix,
          name: name,
        };
      });

      channel?.trigger("client-game-roomLayout", {
        roomLayout: {
          meshes: formatedMeshes,
          planes: formatedPlanes,
        },
      });
    }
  }, [myMeshes, myPlanes]);

  const values = useMemo(() => {
    return {
      setMyMeshes,
      setMyPlanes,
      enemyMeshes,
      enemyPlanes,
    };
  }, [setMyMeshes, setMyPlanes, enemyPlanes, enemyMeshes]);

  // console.log("meshes and planes values: ", values);

  // will be sending these meshes and planes to
  // the other client, who you are playing with

  return (
    <MeshesAndPlanesContext.Provider value={values}>
      {children}
    </MeshesAndPlanesContext.Provider>
  );
}

export default MeshesAndPlanesProvider;
