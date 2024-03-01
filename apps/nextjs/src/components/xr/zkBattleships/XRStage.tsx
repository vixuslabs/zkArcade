"use client";

// import { Preload } from "@react-three/drei";
import type { Vector3 } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";

import { Board, Carrier, Missile } from ".";

export default function XRStage() {
  return (
    <>
      {/* <Board position={[0, 0, 0]} /> */}

      <PhysicsBoard position={[0, 1.5, 0]} />

      <PhysicsCarrier position={[-0.3, 1.5, 0.2]} />

      <PhysicsCarrier position={[-0, 1.5, 0.2]} />

      <PhysicsCarrier position={[0.3, 1.5, 0.2]} />

      <PhysicsMissile position={[0, 1.7, 0]} />

      {/* <Preload all /> */}
    </>
  );
}

export const PhysicsMissile = ({ position }: { position: Vector3 }) => {
  return (
    <RigidBody
      type="dynamic"
      density={10}
      colliders="cuboid"
      position={position}
    >
      <Missile />
    </RigidBody>
  );
};

export const PhysicsBoard = ({ position }: { position: Vector3 }) => {
  return (
    <RigidBody type="fixed" density={10} colliders="cuboid" position={position}>
      <Board />
    </RigidBody>
  );
};

export const PhysicsCarrier = ({ position }: { position: Vector3 }) => {
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
