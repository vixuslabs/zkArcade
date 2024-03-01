"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHotnCold } from "@/lib/stores";

import type {
  MeshesAndPlanesContextValue,
  MeshInfo,
  MyMeshInfo,
  MyPlaneInfo,
  PlaneInfo,
} from "@/lib/types";
import { HotnColdGameStatus } from "@/lib/types";
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
  const { setRoomLayout, me, opponent, setGameStatus, status } = useHotnCold();
  const meshes = useTrackedMeshes();
  const planes = useTrackedPlanes();
  const [myMeshes, setMyMeshes] = useState<MyMeshInfo[]>([]);
  const [myPlanes, setMyPlanes] = useState<MyPlaneInfo[]>([]);

  useEffect(() => {
    if (!me || !opponent) return;

    if (status !== HotnColdGameStatus.LOADINGROOMS) return;

    if (
      opponent.roomLayout.meshes.length === 0 ||
      opponent.roomLayout.planes.length === 0
    ) {
      // console.log(
      //   "MeshesAndPlanesProvider: opponent.roomLayout exists already",
      // );
      return;
    }

    if (
      me.roomLayout.meshes.length === 0 ||
      me.roomLayout.planes.length === 0
    ) {
      // console.log("MeshesAndPlanesProvider: me.roomLayout exists already");
      return;
    }

    setGameStatus(HotnColdGameStatus.BOTHHIDING);
  }, [me, opponent, setGameStatus, status]);

  useEffect(() => {
    if (!me) return;

    if (me.roomLayout.meshes.length > 0 && me.roomLayout.planes.length > 0) {
      console.log("MeshesAndPlanesProvider: me.roomLayout exists already");
      return;
    }

    if (!meshes || !planes) return;
    /**
     * The reasoning for this is that we are not including the global mesh inside of myMeshes, and planes does not have a global mesh, so it should be the same size
     * Revisiting this, much of this is uneeded, since we can just use the meshes and planes from the useTracked hooks and send them to the server
     * We do not need to store them inside of meshes and planes context
     */
    if (
      meshes.length - 1 === myMeshes.length &&
      planes.length === myPlanes.length &&
      meshes.length > 0 &&
      planes.length > 0
    ) {
      const formatedMeshes: MeshInfo[] = myMeshes.map(({ mesh, name }) => {
        if (!mesh.geometry.attributes.position) {
          throw new Error("MeshesAndPlanesProvider: no position attribute");
        }

        if (!mesh.geometry.index) {
          throw new Error("MeshesAndPlanesProvider: no index attribute");
        }

        if (!mesh.matrix) {
          throw new Error("MeshesAndPlanesProvider: no matrix attribute");
        }

        return {
          geometry: {
            position: {
              array: mesh.geometry.attributes.position.array,
              itemSize: mesh.geometry.attributes.position.itemSize,
            },
            index: {
              array: mesh.geometry.index.array,
              itemSize: mesh.geometry.index.itemSize,
            },
          },
          matrix: {
            elements: mesh.matrix.elements,
          },
          name: name,
        };
      });

      const formatedPlanes: PlaneInfo[] = myPlanes.map(({ plane, name }) => {
        if (!plane.geometry.attributes.position) {
          throw new Error(
            "MeshesAndPlanesProvider - planes: no position attribute",
          );
        }

        if (!plane.geometry.index) {
          throw new Error(
            "MeshesAndPlanesProvider - planes: no index attribute",
          );
        }

        if (!plane.matrix) {
          throw new Error(
            "MeshesAndPlanesProvider - planes: no matrix attribute",
          );
        }

        return {
          geometry: {
            position: {
              array: plane.geometry.attributes.position.array,
              itemSize: plane.geometry.attributes.position.itemSize,
            },
            index: {
              array: plane.geometry.index.array,
              itemSize: plane.geometry.index.itemSize,
            },
          },
          matrix: {
            elements: plane.matrix.elements,
          },
          name: name,
        };
      });

      void setRoomLayout(
        {
          meshes: formatedMeshes,
          planes: formatedPlanes,
        },
        "me",
      );

      console.log("MeshesAndPlanesProvider: sending roomLayout to server");

      channel.trigger("client-roomLayout-meshes", {
        meshes: formatedMeshes,
      });

      channel.trigger("client-roomLayout-planes", {
        planes: formatedPlanes,
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
