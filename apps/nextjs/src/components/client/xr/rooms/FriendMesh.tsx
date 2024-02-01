import type { GeometryData } from "@/lib/types";
import {
  // BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  // Float32BufferAttribute,
  Matrix4,
  Mesh,
  // MeshBasicMaterial,
  MeshStandardMaterial,
  // MeshStandardMaterial,
  // Uint16BufferAttribute,
} from "three";

interface FriendMeshProps extends GeometryData {
  name: string;
  matrix: {
    elements: number[];
  };
}

export const questFurnitureNames: QuestFurnitureNames[] = [
  "couch",
  "bed",
  "screen",
  "table",
  "lamp",
  "plant",
  "shelf",
  "other",
];

// interface QuestFurnitureNames {
//   names: QuestFurnitureNamess;
// }

type QuestFurnitureNames =
  | "couch"
  | "bed"
  | "screen"
  | "table"
  | "lamp"
  | "plant"
  | "shelf"
  | "other";

const colorSelector = (name: QuestFurnitureNames) => {
  switch (name) {
    case "couch":
      return "#0000FF"; // blue
    case "bed":
      return "#FF0000"; // red
    case "screen":
      return "#FFFF00"; // yellow
    case "table":
      return "#FF6600"; // orange
    case "lamp":
      return "#00FF00"; // green
    case "plant":
      return "#6600FF"; // purple
    case "shelf":
      return "#FF00FF"; // magenta
    case "other":
      return "#00FFFF"; // cyan
    default:
      return "#CC4F4F";
  }
};

function FriendMesh({ position, index, matrix, name }: FriendMeshProps) {
  // console.log("\n-------------\n");
  // console.log("name:", name);
  // console.log("inside FriendMesh component");
  // console.log("position:", position);
  // console.log("indexData:", index);
  // console.log("matrix:", matrix);

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

  // const material = new MeshBasicMaterial({
  //   side: 2,
  //   color: "#CC4F4F", // soft red for all furniture (global mesh not included)
  // });

  const color = colorSelector(name as QuestFurnitureNames);

  const material = new MeshStandardMaterial({
    side: 2,
    color,
  });

  const mesh = new Mesh(geometry, material);

  mesh.matrixAutoUpdate = false;

  mesh.applyMatrix4(matrixFour);

  // console.log("FriendMesh - friend generated mesh:", mesh);

  return <primitive object={mesh} />;
}

export default FriendMesh;
