"use client";

import React, { useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RepeatWrapping, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { Water } from "three/examples/jsm/Addons.js";

// const BOARD_URL = new URL(
//   "../../public/battleships_board.glb",
//   import.meta.url,
// ).toString();

// const WATER_NORMAL_URL = new URL(
//   "../../public/waternormals.jpg",
//   import.meta.url,
// ).toString();

const BOARD_URL = "assets/zkBattleships/battleships_board.glb";
const WATER_NORMAL_URL = "assets/zkBattleships/waternormals.jpg";

type GLTFResult = GLTF & {
  nodes: {
    water: THREE.Mesh;
    board: THREE.Mesh;
  };
  materials: {
    Material_0: THREE.MeshStandardMaterial;
  };
};

export function Battleships(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(BOARD_URL) as GLTFResult;
  const water = useRef<THREE.Mesh>(null);

  useTexture(WATER_NORMAL_URL, (texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    const waterMesh = new Water(nodes.water.geometry, {
      textureHeight: 512,
      textureWidth: 512,
      waterNormals: texture,
      sunDirection: new Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x00faff,
      distortionScale: 3.7,
      fog: false,
    });
    waterMesh.position.copy(nodes.water.position);
    nodes.water.material = waterMesh.material;
    water.current?.copy(waterMesh);
  });

  useFrame((state, delta) => {
    // @ts-expect-error - unfiforms is there
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    nodes.water.material.uniforms.time.value += delta;
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={water}
        castShadow
        receiveShadow
        geometry={nodes.water.geometry}
        material={water.current?.material}
        position={[-0.06, 0.119, -0.081]}
        scale={0.435}
      >
        {/* <meshStandardMaterial map={tex} /> */}
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.board.geometry}
        material={materials.Material_0}
        position={[-0.057, 0.062, -0.078]}
        rotation={[0, -0.002, -0.002]}
        scale={0.01}
      />
    </group>
  );
}

useGLTF.preload(BOARD_URL);
