"use client";

import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  Matrix4,
  Uint16BufferAttribute,
  MeshPhongMaterial,
} from "three";

function FriendPlane({
  positionData,
  indexData,
  matrixData,
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

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", positionAttribute);
  geometry.setIndex(indexAttribute);

  const material = new MeshPhongMaterial({
    color: "blue",
    side: 2,
  });

  const mesh = new Mesh(geometry, material);

  mesh.applyMatrix4(matrix);

  return <primitive object={mesh} />;
}

export default FriendPlane;
