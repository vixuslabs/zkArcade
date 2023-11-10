"use client";

import { useId, useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  Matrix4,
  BufferAttribute,
  Uint16BufferAttribute,
  MeshBasicMaterial,
  MeshPhongMaterial,
} from "three";

import type { InterleavedBufferAttribute } from "three";

function FriendPlane({
  positionData,
  indexData,
  matrixData,
  worldMatrixData,
}: {
  positionData: { itemSize: number; array: number[] };
  indexData: { itemSize: number; array: number[] };
  matrixData: { elements: number[] };
  worldMatrixData?: { elements: number[] };
}) {
  // Use Three.js constructors to convert raw data to Three.js data types
  const positionAttribute = new Float32BufferAttribute(
    positionData.array,
    positionData.itemSize,
  );
  const indexAttribute = new Uint16BufferAttribute(
    indexData.array,
    indexData.itemSize,
  );
  const matrix = new Matrix4().fromArray(matrixData.elements);

  console.log(worldMatrixData);

  // Create the geometry and set its attributes
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", positionAttribute);
  geometry.setIndex(indexAttribute);

  // Create a standard mesh material (you can customize this)
  // const material = new MeshBasicMaterial({ color: "purple" });
  const material = new MeshPhongMaterial({ color: "purple", side: 2 });

  const mesh = new Mesh(geometry, material);

  mesh.applyMatrix4(matrix);

  // mesh.matrixWorld.fromArray(worldMatrixData.elements);

  // Return mesh JSX element, Three Fiber will handle creating and updating the underlying Three.js mesh
  // return <mesh geometry={geometry} material={material} matrix={matrix} />;
  return <primitive object={mesh} />;
}

export default FriendPlane;
