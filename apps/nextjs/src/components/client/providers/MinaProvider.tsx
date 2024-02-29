"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { MeshInfo, PlaneInfo, Player } from "@/lib/types";
import type { Vector3Object } from "@react-three/rapier";
import type { PrivateKey, PublicKey, VerificationKey } from "o1js";
import type { Vector3 as ZkVector3 } from "@zkarcade/mina/src/zk3d";

import type { RoomAndObjectCommitment, ValidateRoom } from "@zkarcade/mina";
import type {
  Box as BoxType,
  Object3D as Object3DType,
  Plane as PlaneType,
  Room as RoomType,
} from "@zkarcade/mina/src/structs";

export interface CommitRoomAndObjectProps {
  objectPosition: Vector3Object;
  objectRadius: number;
}

interface MinaState {
  zkProgram: typeof ValidateRoom | null;
  verificationKey: VerificationKey | null;
  pubKey: string;
  privKey: string;
  isPlayerOne: boolean;
  zkAppPublicKey?: PublicKey;
  zkAppPrivateKey?: PrivateKey;
}

interface InitializeRoomProps {
  boxes: MeshInfo[];
  planes: PlaneInfo[];
}

interface HotnColdMinaState extends MinaState {
  room: RoomType | null;
  object: Object3DType | null;
  roomAndObjectCommitment: RoomAndObjectCommitment | null;
}

export interface CommitRoomAndObjectReturn {
  roomAndObjectCommitment: RoomAndObjectCommitment;
  object: Object3DType;
}

interface MinaContextValues {
  initialized: boolean;
  mina: HotnColdMinaState | null;
  setMina: React.Dispatch<React.SetStateAction<HotnColdMinaState>> | null;
  initZkProgram: () => Promise<void>;
  initializeRoom:
    | (({ boxes, planes }: InitializeRoomProps) => Promise<RoomType>)
    | null;
  commitRoomAndObject:
    | (({
        objectRadius,
        objectPosition,
      }: CommitRoomAndObjectProps) => Promise<CommitRoomAndObjectReturn>)
    | null;
  runValidateRoom:
    | ((
        roomAndObjectCommitment: RoomAndObjectCommitment,
        object: Object3DType,
      ) => Promise<boolean>)
    | null;
  isReadyToProve: boolean;
}

const MinaContext = createContext<MinaContextValues>({
  initialized: false,
  mina: null,
  setMina: null,
  initZkProgram: () => Promise.resolve(),
  initializeRoom: null,
  commitRoomAndObject: null,
  runValidateRoom: null,
  isReadyToProve: false,
});

export const useMinaContext = () => {
  const context = useContext(MinaContext);

  // if (!context) {
  //   throw new Error("useMinaContext must be used within a MinaProvider");
  // }

  return context;
};

function MinaProvider({
  children,
  localPlayer,
}: {
  children: React.ReactNode;
  localPlayer: Player | null;
}) {
  const [mina, setMina] = useState<HotnColdMinaState>({
    zkProgram: null,
    verificationKey: null,
    pubKey: localPlayer?.publicKey ?? "",
    privKey: localPlayer?.privateKey ?? "",
    isPlayerOne: localPlayer?.host ?? false,
    room: null,
    object: null,
    roomAndObjectCommitment: null,
  });
  const initZkProgram = useCallback(async () => {
    console.log("importing ValidateRoom from @zkarcade/mina...");
    const { ValidateRoom } = await import("@zkarcade/mina");
    console.log("compiling ValidateRoom...");

    const { verificationKey } = await ValidateRoom.compile({
      // cache: {
      //   canWrite: true,
      //   debug: true,
      //   write: (key, value) => {
      //     console.log("writing to cache: ", key, value);
      //     const localStorage = window.localStorage;
      //     const keyStr = key.persistentId;
      //     if (keyStr === undefined) {
      //       throw new Error("key.persistentId is undefined");
      //     }
      //     const decoder = new TextDecoder();
      //     console.log("converting from uint8array to string...");
      //     const valueStr = decoder.decode(value);
      //     console.log("done converting from uint8array to string...");
      //     console.log("valueStr:", valueStr);
      //     localStorage.setItem(key.persistentId, valueStr);
      //   },
      //   read: (key) => {
      //     console.log("reading from cache: ", key);
      //     const localStorage = window.localStorage;
      //     const encoder = new TextEncoder();
      //     if (key.persistentId === undefined) {
      //       throw new Error("key.persistentId is undefined");
      //     }
      //     const valueStr = localStorage.getItem(key.persistentId);
      //     console.log("valueStr:", valueStr);
      //     if (valueStr === null) {
      //       throw new Error("valueStr is null");
      //     }
      //     console.log("converyign from string to uint8array...");
      //     const value = encoder.encode(valueStr);
      //     console.log("done converting from string to uint8array...");
      //     console.log("value:", value);
      //     return value;
      //   },
      // },
      forceRecompile: true,
    });

    // console.log("Done compiling zk program");
    console.log("verification key: ", verificationKey);

    setMina((prev) => ({
      ...prev,
      zkProgram: ValidateRoom,
      verificationKey,
    }));
  }, []);

  const initializeRoom = useCallback(
    async ({ boxes, planes }: InitializeRoomProps) => {
      console.log(
        "inside initializeRoom, importing from @zkarcade/mina/src/zk3d...",
      );
      const { Real64, Vector3, Matrix4 } = await import(
        "@zkarcade/mina/src/zk3d"
      );
      console.log("done importing from @zkarcade/mina/src/zk3d");
      console.log("----");
      console.log("importing from @zkarcade/mina/src/structs...");
      const { Box, Room, Plane } = await import("@zkarcade/mina/src/structs");
      console.log("done importing from @zkarcade/mina/src/structs");

      console.log("creating zkBoxes...");
      const zkBoxes: BoxType[] = boxes.map((box) => {
        const vertices = box.geometry.position.array;

        if (!vertices) {
          console.error("No vertices found for box: ", box);
          throw new Error("No vertices found for box");
        }

        const vertexPoints: ZkVector3[] = [];
        for (let i = 0; i < vertices.length; i += 3) {
          if (
            typeof vertices[i] === "undefined" ||
            typeof vertices[i + 1] === "undefined" ||
            typeof vertices[i + 2] === "undefined"
          ) {
            console.error("One or more vertices are undefined: ", vertices);
            // throw new Error("One or more vertices are undefined");
          }

          vertexPoints.push(
            new Vector3({
              x: Real64.from(vertices[i]!),
              y: Real64.from(vertices[i + 1]!),
              z: Real64.from(vertices[i + 2]!),
            }),
          );
        }

        // matrixWorld or matrix?
        const matrixElements = box.matrix.elements.map((x) => Real64.from(x));

        return Box.fromVertexPointsAndMatrix(
          vertexPoints,
          Matrix4.fromElements(matrixElements),
        );
      });

      console.log("creating zkPlanes...");
      const zkPlanes: PlaneType[] = planes.map((plane) => {
        const vertices = plane.geometry.position.array;

        if (!vertices) {
          console.error("No vertices found for plane: ", plane);
          throw new Error("No vertices found for plane");
        }

        const vertexPoints: ZkVector3[] = [];
        for (let i = 0; i < vertices.length; i += 3) {
          if (
            typeof vertices[i] === "undefined" ||
            typeof vertices[i + 1] === "undefined" ||
            typeof vertices[i + 2] === "undefined"
          ) {
            console.error("One or more vertices are undefined: ", vertices);
            // throw new Error("One or more vertices are undefined");
          }

          vertexPoints.push(
            new Vector3({
              x: Real64.from(vertices[i]!),
              y: Real64.from(vertices[i + 1]!),
              z: Real64.from(vertices[i + 2]!),
            }),
          );
        }

        const matrixElements = plane.matrix.elements.map((x) => Real64.from(x));
        matrixElements[15] = Real64.from(1);

        return Plane.fromVertexPointsAndMatrix(
          vertexPoints,
          Matrix4.fromElements(matrixElements),
        );
      });

      console.log("running Room.fromPlanesAndBoxes...");

      const room = Room.fromPlanesAndBoxes(zkPlanes, zkBoxes);
      console.log("done running Room.fromPlanesAndBoxes");
      console.log("setting mina.room...");

      setMina((prev) => ({ ...prev, room }));
      console.log("done setting mina.room...");

      console.log("room", room);

      return room;
    },
    [],
  );

  const commitRoomAndObject = useCallback(
    async ({ objectRadius, objectPosition }: CommitRoomAndObjectProps) => {
      const { Real64, Vector3 } = await import("@zkarcade/mina/src/zk3d");
      const { Object3D } = await import("@zkarcade/mina/src/structs");
      const { RoomAndObjectCommitment } = await import("@zkarcade/mina");

      const objectVector = new Vector3({
        x: Real64.from(objectPosition.x),
        y: Real64.from(objectPosition.y),
        z: Real64.from(objectPosition.z),
      });
      const object = Object3D.fromPointAndRadius(
        objectVector,
        Real64.from(objectRadius),
      );

      if (!mina.room) {
        throw new Error("Room is not initialized");
      }

      const roomAndObjectCommitment = new RoomAndObjectCommitment({
        room: mina.room,
        objectCommitment: object.getHash(),
      });

      setMina((prev) => ({ ...prev, object, roomAndObjectCommitment }));

      return { roomAndObjectCommitment, object };
    },
    [mina.room],
  );

  const runValidateRoom = useCallback(
    async (
      roomAndObjectCommitment: RoomAndObjectCommitment,
      object: Object3DType,
    ) => {
      if (!mina) {
        throw new Error("Mina is not initialized");
      }

      const { verify } = await import("o1js");

      const { zkProgram, verificationKey } = mina;

      if (!zkProgram || !verificationKey) {
        throw new Error(
          "zkProgram is not initialized or verificationKey not set",
        );
      }

      console.log("running zkProgram.run...");

      console.log("roomAndObjectCommitment", roomAndObjectCommitment);
      console.log("object", object);

      const proof = await zkProgram.run(roomAndObjectCommitment, object);

      const proved = await verify(proof, verificationKey);

      return proved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      mina.object,
      mina.roomAndObjectCommitment,
      mina.zkProgram,
      mina.verificationKey,
    ],
  );

  const value = useMemo(() => {
    return {
      initialized: mina.verificationKey && mina.zkProgram ? true : false,
      mina: mina,
      setMina: setMina,
      initZkProgram: initZkProgram,
      initializeRoom: initializeRoom,
      commitRoomAndObject: commitRoomAndObject,
      runValidateRoom: runValidateRoom,
      isReadyToProve: !!mina.roomAndObjectCommitment && !!mina.object,
    };
  }, [
    mina,
    setMina,
    runValidateRoom,
    initializeRoom,
    commitRoomAndObject,
    initZkProgram,
  ]);

  return <MinaContext.Provider value={value}>{children}</MinaContext.Provider>;
}

export default React.memo(MinaProvider);
