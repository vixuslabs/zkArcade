"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHotnCold } from "@/components/client/stores";
import type {
  MeshesAndPlanesContextValue,
  MyMeshInfo,
  MyPlaneInfo,
} from "@/lib/types";
import {
  useTrackedMeshes,
  useTrackedPlanes,
} from "@coconut-xr/natuerlich/react";

const MeshesAndPlanesContext = createContext<MeshesAndPlanesContextValue>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMyMeshes: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMyPlanes: () => {},
});

export const useMeshesAndPlanesContext = () => {
  const context = useContext(MeshesAndPlanesContext);

  // disabling because this is used outside of game
  // if (!context) {
  //   throw new Error(
  //     "useMeshesAndPlanesContext must be used within a MeshesAndPlanesProvider",
  //   );
  // }
  return context;
};

function MeshesAndPlanesProvider({ children }: { children: React.ReactNode }) {
  const channel = useHotnCold().getGameChannel();
  const meshes = useTrackedMeshes();
  const planes = useTrackedPlanes();
  const [myMeshes, setMyMeshes] = useState<MyMeshInfo[]>([]);
  const [myPlanes, setMyPlanes] = useState<MyPlaneInfo[]>([]);

  useEffect(() => {
    if (!meshes || !planes) return;
    if (meshes.length > 0 && planes.length > 0) {
      const formatedMeshes = myMeshes.map(({ mesh, name }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myMeshes, myPlanes]);

  const values = useMemo(() => {
    return {
      setMyMeshes,
      setMyPlanes,
    };
  }, [setMyMeshes, setMyPlanes]);

  return (
    <MeshesAndPlanesContext.Provider value={values}>
      {children}
    </MeshesAndPlanesContext.Provider>
  );
}

export default MeshesAndPlanesProvider;
