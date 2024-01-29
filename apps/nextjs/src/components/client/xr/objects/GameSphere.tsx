"use client";

import React, { useRef } from "react";
import { GrabPhysics } from "@/components/client/xr/physics";
import { useHotnCold } from "@/lib/stores";
import { HotnColdGameStatus } from "@/lib/types";
// import { useHotnCold } from "@/lib/stores";
import type { ThreeEvent } from "@react-three/fiber";
import { RigidBody, vec3 } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Mesh, Vector3 } from "three";

import { useControllerStateContext } from "../../providers/ControllerStateProvider";

function GameSphere({
  name,
  position,
  color,
  inGame,
  gameStatus,
}: {
  name?: string;
  position?: [number, number, number];
  color?: string;
  inGame: boolean;
  gameStatus?: "hiding" | "seeking";
}) {
  const { pointers } = useControllerStateContext();
  const { getGameChannel } = useHotnCold();
  // const { me } = useHotnCold();
  const rigidRef = useRef<RapierRigidBody>(null);
  const ref = useRef<Mesh>(null);
  const rigidAndMeshRef = useRef({
    rigidRef: rigidRef,
    ref: ref,
  });

  const handleGrab = (e: ThreeEvent<PointerEvent>) => {
    if (rigidRef.current) {
      if (gameStatus === "seeking") {
        const channel = getGameChannel();
        const { setGameStatus } = useHotnCold.getState();

        channel.trigger("client-found-object", {
          objectPosition: vec3(e.point),
        });

        useHotnCold.setState((state) => {
          if (!state.me) return state;
          return {
            me: {
              ...state.me,
              foundObject: true,
            },
          };
        });

        setGameStatus(HotnColdGameStatus.GAMEOVER);
      }

      rigidRef.current.setTranslation(vec3(e.point), true);
      rigidRef.current.resetTorques(true);
      rigidRef.current.resetForces(true);
      rigidRef.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }), true);
      rigidRef.current.setGravityScale(0, true);
    } else {
      console.log("rigidRef.current is not set");
    }
  };

  const handleRelease = (e: ThreeEvent<PointerEvent>, velocity?: Vector3) => {
    if (rigidRef.current) {
      if (!inGame) {
        rigidRef.current?.setGravityScale(1, true);
        rigidRef.current.setLinvel(vec3(velocity), true);
      }
    } else {
      console.log("rigidRef.current is not set");
    }
  };

  return (
    <RigidBody
      name={"GameSphere-physics"}
      ref={rigidRef}
      colliders={"ball"}
      type={name === "hiddenObject" ? "fixed" : "dynamic"}
      position={
        name === "hiddenObject"
          ? // @ts-expect-error - positions from websocket are passed as an object
            [position.x, position.y, position.z]
          : position ?? [0, 0, 0]
      }
      gravityScale={inGame ? 0 : 0.5}
      canSleep={false}
      linearDamping={0.5}
      angularDamping={0.7}
      ccd={true}
    >
      <GrabPhysics
        id={name ?? "sphere"}
        isAnchorable={true}
        ref={rigidAndMeshRef}
        handleGrab={handleGrab}
        handleRelease={handleRelease}
      >
        <sphereGeometry args={[0.05, 50, 50]} />
        {!inGame && <meshBasicMaterial color={color ?? "red"} />}
        {inGame &&
          (name !== "hiddenObject" ? (
            <meshBasicMaterial color={color ?? "red"} />
          ) : pointers.right.heldObject?.name === "hiddenObject" ? (
            <meshBasicMaterial color={color ?? "red"} />
          ) : (
            <meshStandardMaterial transparent opacity={0.5} color={"black"} />
          ))}
      </GrabPhysics>
    </RigidBody>
  );
}

export default React.memo(GameSphere);
