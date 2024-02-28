"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
// import { GAME_VERIFICATION_KEYS } from "@/lib/constants";
import type { HotnColdPlayer, MeshInfo, PlaneInfo } from "@/lib/types";
import type { Vector3Object } from "@react-three/rapier";
import type { PrivateKey, PublicKey, VerificationKey } from "o1js";
import type { Vector3 as ZkVector3 } from "@zkarcade/mina/src/zk3d";

import type { RoomAndObjectCommitment, ValidateRoom } from "@zkarcade/mina";
import type { Box as BoxType, Object3D as Object3DType, Plane as PlaneType, Room as RoomType } from "@zkarcade/mina/src/structs";


interface CommitRoomAndObjectProps {
  room: RoomType;
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

interface MinaContextValues {
  initialized: boolean;
  mina: HotnColdMinaState | null;
  setMina: React.Dispatch<React.SetStateAction<HotnColdMinaState>> | null;
  initZkProgram: () => Promise<void>;
  initializeRoom: (({ boxes, planes }: InitializeRoomProps) => Promise<RoomType>) | null;
  commitRoomAndObject:
  | (({
    room,
    objectRadius,
    objectPosition,
  }: CommitRoomAndObjectProps) => Promise<RoomAndObjectCommitment>)
  | null;
  runValidateRoom: () => Promise<boolean>;
  isReadyToProve: boolean;
}

const MinaContext = createContext<MinaContextValues>({
  initialized: false,
  mina: null,
  setMina: null,
  initZkProgram: () => Promise.resolve(),
  initializeRoom: null,
  commitRoomAndObject: null,
  runValidateRoom: () => Promise.resolve(false),
  isReadyToProve: false,
});

export const useMinaContext = () => {
  const context = useContext(MinaContext);

  if (!context) {
    throw new Error("useMinaContext must be used within a MinaProvider");
  }

  return context;
};

function MinaProvider({
  //   gameName,
  children,
  localPlayer,
}: {
  //   gameName: GameNames;
  children: React.ReactNode;
  // leaving as optional for now
  localPlayer?: HotnColdPlayer;
}) {
  // should be defining the type of the useState dynamically
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
  // const [zkProgram, _] = useState<typeof ValidateRoom>(null);

  const initZkProgram = useCallback(async () => {

    const { ValidateRoom } = await import("@zkarcade/mina");

    const { verificationKey } = await ValidateRoom.compile();


    setMina((prev) => ({
      ...prev,
      zkProgram: ValidateRoom,
      verificationKey,
    }));


  }, [])

  const initializeRoom = useCallback(
    async ({ boxes, planes }: InitializeRoomProps) => {

      const { Real64, Vector3, Matrix4 } = await import("@zkarcade/mina/src/zk3d");
      const { Box, Room, Plane } = await import("@zkarcade/mina/src/structs");

      const zkBoxes: BoxType[] = boxes.map((box) => {
        const vertices = box.geometry.position.array;

        if (!vertices) {
          console.error("No vertices found for box: ", box);
          throw new Error("No vertices found for box");
        }

        const vertexPoints: ZkVector3[] = [];
        for (let i = 0; i < vertices.length; i += 3) {
          if (!vertices[i] || !vertices[i + 1] || !vertices[i + 2]) {
            console.error("One or more vertices are undefined: ", vertices);
            throw new Error("One or more vertices are undefined");
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

      const zkPlanes: PlaneType[] = planes.map((plane) => {
        const vertices = plane.geometry.position.array;

        if (!vertices) {
          console.error("No vertices found for plane: ", plane);
          throw new Error("No vertices found for plane");
        }

        const vertexPoints: ZkVector3[] = [];
        for (let i = 0; i < vertices.length; i += 3) {
          if (!vertices[i] || !vertices[i + 1] || !vertices[i + 2]) {
            console.error("One or more vertices are undefined: ", vertices);
            throw new Error("One or more vertices are undefined");
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

      const room = Room.fromPlanesAndBoxes(zkPlanes, zkBoxes);

      setMina((prev) => ({ ...prev, room }));

      return room;
    },
    [],
  );

  const commitRoomAndObject = useCallback(
    async ({ room, objectRadius, objectPosition }: CommitRoomAndObjectProps) => {

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

      const roomAndObjectCommitment = new RoomAndObjectCommitment({
        room: room,
        objectCommitment: object.getHash(),
      });

      setMina((prev) => ({ ...prev, object, roomAndObjectCommitment }));

      return roomAndObjectCommitment;
    },
    [],
  );

  const runValidateRoom = useCallback(async () => {
    if (!mina) {
      throw new Error("Mina is not initialized");
    }

    const { verify } = await import("o1js")

    const { object, roomAndObjectCommitment, zkProgram, verificationKey } = mina;

    if (!zkProgram || !verificationKey) {
      throw new Error("zkProgram is not initialized or verificationKey not set");
    }

    if (!roomAndObjectCommitment || !object) {
      throw new Error("Must commit room and object before validating room");
    }

    const proof = (await zkProgram.run(
      roomAndObjectCommitment,
      object,
    ))

    const proved = await verify(proof, verificationKey);

    return proved;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mina.object, mina.roomAndObjectCommitment, mina.zkProgram, mina.verificationKey]);

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
  }, [mina, setMina, runValidateRoom, initializeRoom, commitRoomAndObject, initZkProgram]);

  return <MinaContext.Provider value={value}>{children}</MinaContext.Provider>;
}

export default React.memo(MinaProvider);
