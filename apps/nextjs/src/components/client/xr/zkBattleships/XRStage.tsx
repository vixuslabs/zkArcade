"use client";

import { RigidBody } from "@react-three/rapier";
import { Board } from "./Board";
import { Carrier } from "./Carrier";
import type { Vector3 } from "@react-three/fiber";

export default function XRStage() {
  return (
    <>
      {/* <Board position={[0, 0, 0]} /> */}

      <PhysicsBoard position={[0, 1.5, 0]} />

      <PhysicsCarrier position={[-0.3, 1.5, 0.2]} />

      <PhysicsCarrier position={[-0, 1.5, 0.2]} />

      <PhysicsCarrier position={[0.3, 1.5, 0.2]} />
    </>
  );
}

const PhysicsBoard = ({ position }: { position: Vector3 }) => {
  return (
    <RigidBody type="fixed" density={10} colliders="cuboid" position={position}>
      <Board />
    </RigidBody>
  );
};

const PhysicsCarrier = ({ position }: { position: Vector3 }) => {
  return (
    <RigidBody
      type="dynamic"
      density={10}
      colliders="trimesh"
      position={position}
    >
      <Carrier />
    </RigidBody>
  );
};
