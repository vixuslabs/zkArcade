import React from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    mesh: THREE.Mesh;
  };
  materials: {
    base_material: THREE.MeshStandardMaterial;
  };
};

export function Missile(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/assets/zkBattleships/missile.glb",
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.mesh.geometry}
        material={materials.base_material}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.3}
      />
    </group>
  );
}

useGLTF.preload("/assets/zkBattleships/missile.glb");
