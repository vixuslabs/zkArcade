"use client";

import React, { useEffect, useRef } from "react";

import { RigidBody, vec3 } from "@react-three/rapier";

import type { RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";

import type { Mesh, Vector3 } from "three";
import { GrabPhysics } from "@/components/client/xr/physics";
import { useControllerStateContext } from "../../providers/ControllerStateProvider";

function TestSphere({
  ...props
}: {
  name?: string;
  position?: [number, number, number];
  color?: string;
  // matrix?: number[];
}) {
  const { pointers } = useControllerStateContext();
  const rigidRef = useRef<RapierRigidBody>(null);
  const ref = useRef<Mesh>(null);
  const rigidAndMeshRef = useRef({
    rigidRef: rigidRef,
    ref: ref,
  });

  const handleGrab = (e: ThreeEvent<PointerEvent>) => {
    if (rigidRef.current) {
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
      // rigidRef.current?.setGravityScale(1, true);
      // rigidRef.current.setLinvel(vec3(velocity), true);
    } else {
      console.log("rigidRef.current is not set");
    }
  };

  console.log("TestSphere rendered");
  console.log("position", props.position);

  // @ts-expect-error - hehehehehehhe
  const { x, y, z } = props.position;

  console.log("x", x);
  console.log("y", y);
  console.log("z", z);

  return (
    <RigidBody
      name={"testBox-physics"}
      ref={rigidRef}
      colliders={"cuboid"}
      type={props.name === "hiddenObject" ? "fixed" : "dynamic"}
      position={
        props.name === "hiddenObject" ? [x, y, z] : props.position ?? [0, 0, 0]
      }
      // position={[0, 0, -0.2]}
      gravityScale={0}
      canSleep={false}
      linearDamping={0.5}
      angularDamping={0.7}
      ccd={true}
    >
      <GrabPhysics
        id={props.name ?? "testBox"}
        isAnchorable={true}
        ref={rigidAndMeshRef}
        handleGrab={handleGrab}
        handleRelease={handleRelease}
      >
        {/* <boxGeometry args={[0.1, 0.1, 0.1]} /> */}
        <sphereGeometry args={[0.05, 50, 50]} />
        {props.name !== "hiddenObject" ? (
          <meshBasicMaterial color={props.color ?? "red"} />
        ) : pointers.right.heldObject?.name === "hiddenObject" ? (
          <meshBasicMaterial color={props.color ?? "red"} />
        ) : (
          <meshStandardMaterial transparent opacity={0.5} color={"black"} />
        )}
      </GrabPhysics>
    </RigidBody>
  );
}

export default React.memo(TestSphere);
