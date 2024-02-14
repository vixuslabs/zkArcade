import { Int64, verify } from "o1js";
import { boxes, planes, realWorldHiddenObject } from "./scene";
import {
  AffineTransformationMatrix,
  Box,
  Object3D,
  Plane,
  Room,
  SCALE,
  Vector3,
} from "./structs";
import { ValidateRoom, RoomAndObjectCommitment } from "./zkprogram";

// Import the hidden object coordinates
if (
  realWorldHiddenObject.coords[0] !== undefined &&
  realWorldHiddenObject.coords[1] !== undefined &&
  realWorldHiddenObject.coords[2] !== undefined
) {
  const objectVector = new Vector3({
    x: Int64.from(Math.round(realWorldHiddenObject.coords[0] * SCALE)),
    y: Int64.from(Math.round(realWorldHiddenObject.coords[1] * SCALE)),
    z: Int64.from(Math.round(realWorldHiddenObject.coords[2] * SCALE)),
  });
  const objectRadius = Int64.from(
    Math.round(realWorldHiddenObject.radius * SCALE),
  );
  const object = Object3D.fromPointAndRadius(objectVector, objectRadius);

  const sceneBoxes: Box[] = [];
  boxes.forEach((b) => {
    const vertices = Object.values(b.vertices);
    // Scale the original box so that all its vertices are integers
    const scaledVertices = vertices.map((v) => {
      if (typeof v === "number") {
        return Math.round(v * SCALE);
      }
      // if v is not a number, return 0
      return 0;
    });
    // Create an array of 8 Vector3 objects from the scaled vertices
    const vertexPoints: Vector3[] = [];
    for (let i = 0; i < scaledVertices.length; i += 3) {
      vertexPoints.push(
        new Vector3({
          x: Int64.from(scaledVertices[i]!),
          y: Int64.from(scaledVertices[i + 1]!),
          z: Int64.from(scaledVertices[i + 2]!),
        }),
      );
    }
    // Scale the matrix elements and set the last element to 1 to keep it affine
    const matrixElements = b.matrix.map((x) => Math.round(x * SCALE));
    matrixElements[15] = 1;
    // Instantiate the box from the vertices and the matrix
    const box = Box.fromVertexPointsAndATM(
      vertexPoints,
      AffineTransformationMatrix.fromElements(matrixElements),
    );
    sceneBoxes.push(box);
  });

  const scenePlanes: Plane[] = [];
  planes.forEach((p) => {
    const vertices = Object.values(p.position);
    // Scale the original plane so that all its vertices are integers
    const scaledVertices = vertices.map((v) => Math.round(v * SCALE));
    // Create an array of 4 Vector3 objects from the scaled vertices
    const vertexPoints: Vector3[] = [];
    for (let i = 0; i < scaledVertices.length; i += 3) {
      vertexPoints.push(
        new Vector3({
          x: Int64.from(scaledVertices[i]!),
          y: Int64.from(scaledVertices[i + 1]!),
          z: Int64.from(scaledVertices[i + 2]!),
        }),
      );
    }
    // Scale the matrix elements and set the last element to 1 to keep it affine
    const matrixElements = p.matrix.map((x) => Math.round(x * SCALE));
    matrixElements[15] = 1;
    // Instantiate the plane from the vertices and the matrix
    const plane = Plane.fromVertexPointsAndATM(
      vertexPoints,
      AffineTransformationMatrix.fromElements(matrixElements),
    );
    scenePlanes.push(plane);
  });

  // Instantiate the room from the planes and boxes
  const room = Room.fromPlanesAndBoxes(scenePlanes, sceneBoxes);

  const { verificationKey } = await ValidateRoom.compile();

  const roomAndObjectCommitment = new RoomAndObjectCommitment({ room: room, objectCommitment: object.getHash() });

  const begin = performance.now();
  const proof = await ValidateRoom.run(roomAndObjectCommitment, object);
  const end = performance.now();
  console.log("proof generation took: ", end - begin, " ms");

  const ok = await verify(proof, verificationKey);

  if (ok) {
    console.log("proof is valid");
  }
} else {
  throw new Error("Object coordinates are undefined");
}
