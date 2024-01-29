import type { GeometryData } from "@/lib/types";
import {
  // BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  // Float32BufferAttribute,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  // MeshStandardMaterial,
  // Uint16BufferAttribute,
} from "three";

interface FriendMeshProps extends GeometryData {
  name?: string;
  matrix: {
    elements: number[];
  };
}

function FriendMesh({ position, index, matrix, name }: FriendMeshProps) {
  console.log("\n-------------\n");
  console.log("name:", name);
  console.log("inside FriendMesh component");
  console.log("position:", position);
  console.log("indexData:", index);
  console.log("matrix:", matrix);

  // const positionAttribute = new Float32BufferAttribute(
  //   position.array,
  //   position.itemSize,
  // );
  // const indexAttribute = new Uint16BufferAttribute(
  //   indexData.array,
  //   indexData.itemSize,
  // );
  const matrixFour = new Matrix4().fromArray(matrix.elements);

  const geometry = new BufferGeometry();
  // geometry.setAttribute("position", positionAttribute);

  geometry.setAttribute("position", new BufferAttribute(position.array, 3));

  index && geometry.setIndex(new BufferAttribute(index.array, 1));

  const material = new MeshBasicMaterial({
    side: 2,
    color: "#CC4F4F", // soft red for all furniture (global mesh not included)
  });

  const mesh = new Mesh(geometry, material);

  mesh.matrixAutoUpdate = false;

  mesh.applyMatrix4(matrixFour);

  console.log("FriendMesh - friend generated mesh:", mesh);

  return <primitive object={mesh} />;
}

export default FriendMesh;
