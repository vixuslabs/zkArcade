"use client";

import type { GeometryData } from "@/lib/types";
import {
  BufferAttribute,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  ShapeGeometry,
} from "three";

interface FriendPlaneProps extends GeometryData {
  name?: string;
  matrix: {
    elements: number[];
  };
}

function FriendPlane({ position, index, matrix, name }: FriendPlaneProps) {
  console.log("\n-------------\n");
  console.log("inside FriendPlane component");
  console.log("name:", name);
  console.log("position:", position);
  console.log("index:", index);
  console.log("matrixData:", matrix);

  const matrixFour = new Matrix4().fromArray(matrix.elements);

  const geometry = new ShapeGeometry();

  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(position.array, 3),
  );

  index && geometry.setIndex(new BufferAttribute(index.array, 1));

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

  // const material = new MeshBasicMaterial({
  //   color,
  //   side: 2,
  // });

  const mesh = new Mesh(geometry, material);

  mesh.matrixAutoUpdate = false;

  mesh.applyMatrix4(matrixFour);

  console.log("FriendPlane - friend generated mesh:", mesh);

  return <primitive object={mesh} />;
}

export default FriendPlane;
