import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Uint16BufferAttribute,
  Mesh,
  MeshStandardMaterial,
} from "three";

function FriendMesh({
  positionData,
  indexData,
  matrixData,
}: {
  positionData: { itemSize: number; array: number[] };
  indexData: { itemSize: number; array: number[] };
  matrixData: { elements: number[] };
}) {
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

  const material = new MeshStandardMaterial({
    color: "orange",
  });

  const mesh = new Mesh(geometry, material);

  mesh.applyMatrix4(matrix);

  return <primitive object={mesh} />;
}

export default FriendMesh;
