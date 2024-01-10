"use client";

import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  // MeshPhongMaterial,
  Uint16BufferAttribute,
} from "three";

function FriendPlane({
  positionData,
  indexData,
  matrixData,
  name,
}: {
  positionData: { itemSize: number; array: number[] };
  indexData: { itemSize: number; array: number[] };
  matrixData: { elements: number[] };
  worldMatrixData?: { elements: number[] };
  name?: string;
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

  // let material = new MeshLambertMaterial({
  //   color: "blue",
  //   side: 2,
  // });

  let color = "#FAF9F6"; // off-white default

  switch (name) {
    case "floor":
      color = "#C0C0C0"; // silverish
      break;
    case "ceiling":
      color = "#F5F5F5"; // very lightlight grey
      break;
  }

  const material = new MeshLambertMaterial({
    color,
    side: 2,
  });

  const mesh = new Mesh(geometry, material);

  mesh.applyMatrix4(matrix);

  return <primitive object={mesh} />;
}

export default FriendPlane;
