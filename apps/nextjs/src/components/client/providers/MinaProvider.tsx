"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { GAME_VERIFICATION_KEYS } from "@/lib/constants";
import type { HotnColdPlayer, MeshInfo, PlaneInfo } from "@/lib/types";
import type { Vector3Object } from "@react-three/rapier";
import type { PrivateKey, Proof, PublicKey } from "o1js";
import { verify } from "o1js";
import { Real64, Matrix4 as zkMatrix4, Vector3 as ZkVector3 } from "@zkarcade/mina/src/zk3d";

import { RoomAndObjectCommitment, ValidateRoom } from "@zkarcade/mina";
import { Box, Object3D, Plane, Room } from "@zkarcade/mina/src/structs";

interface CommitRoomAndObjectProps {
  room: Room;
  objectPosition: Vector3Object;
  objectRadius: number;
}

interface MinaState {
  verificationKey: string;
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
  room: Room | null;
  object: Object3D | null;
  roomAndObjectCommitment: RoomAndObjectCommitment | null;
}

interface MinaContextValues {
  mina: HotnColdMinaState | null;
  setMina: React.Dispatch<React.SetStateAction<HotnColdMinaState>> | null;
  initializeRoom: (({ boxes, planes }: InitializeRoomProps) => Room) | null;
  commitRoomAndObject:
    | (({
        room,
        objectRadius,
        objectPosition,
      }: CommitRoomAndObjectProps) => RoomAndObjectCommitment)
    | null;
  runValidateRoom: () => Promise<boolean>;
  isReadyToProve: boolean;
}

const MinaContext = createContext<MinaContextValues>({
  mina: null,
  setMina: null,
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
    verificationKey: GAME_VERIFICATION_KEYS.get("Hot 'n Cold") ?? "",
    pubKey: localPlayer?.publicKey ?? "",
    privKey: localPlayer?.privateKey ?? "",
    isPlayerOne: localPlayer?.host ?? false,
    room: null,
    object: null,
    roomAndObjectCommitment: null,
  });
  const [zkProgram, _] = useState<typeof ValidateRoom>(ValidateRoom);

  const initializeRoom = useCallback(
    ({ boxes, planes }: InitializeRoomProps) => {
      const zkBoxes: Box[] = boxes.map((box) => {
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
            new ZkVector3({
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
          zkMatrix4.fromElements(matrixElements),
        );
      });

      const zkPlanes: Plane[] = planes.map((plane) => {
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
            new ZkVector3({
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
          zkMatrix4.fromElements(matrixElements),
        );
      });

      const room = Room.fromPlanesAndBoxes(zkPlanes, zkBoxes);

      setMina((prev) => ({ ...prev, room }));

      return room;
    },
    [],
  );

  const commitRoomAndObject = useCallback(
    ({ room, objectRadius, objectPosition }: CommitRoomAndObjectProps) => {
      const objectVector = new ZkVector3({
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

    const { object, roomAndObjectCommitment } = mina;

    if (!roomAndObjectCommitment || !object) {
      throw new Error("Must commit room and object before validating room");
    }

    // @ts-expect-error - We are declaring the type of the proof due to the error with the args
    const proof = (await zkProgram.run(
      // @ts-expect-error - for some reason, the argument types are not being inferred correctly
      roomAndObjectCommitment,
      object,
    )) as Proof<RoomAndObjectCommitment, void>;

    const proved = await verify(proof, mina.verificationKey);

    return proved;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mina.object, mina.roomAndObjectCommitment, zkProgram]);

  const value = useMemo(() => {
    return {
      mina: mina,
      setMina: setMina,
      initializeRoom: initializeRoom,
      commitRoomAndObject: commitRoomAndObject,
      runValidateRoom: runValidateRoom,
      isReadyToProve: !!mina.roomAndObjectCommitment && !!mina.object,
    };
  }, [mina, setMina, runValidateRoom, initializeRoom, commitRoomAndObject]);

  return <MinaContext.Provider value={value}>{children}</MinaContext.Provider>;
}

export default React.memo(MinaProvider);
