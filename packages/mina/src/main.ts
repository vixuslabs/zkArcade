import { verify, Proof, Bool, Void } from "o1js";
import { boxes, planes, realWorldHiddenObject } from "./scene";
import { Box, Object3D, Plane } from "./structs";
import { Vector3, Real64, Matrix4 } from "./zk3d";
import { ValidatePlanes, ValidateBoxes, PlaneAndObjectCommitment, BoxAndObjectCommitment, ValidatePlanesProof, ValidateBoxesProof } from "./zkprogram";

// Import the hidden object coordinates
if (
  realWorldHiddenObject.coords[0] !== undefined &&
  realWorldHiddenObject.coords[1] !== undefined &&
  realWorldHiddenObject.coords[2] !== undefined
) {
  const objectVector = new Vector3({
    x: Real64.from(realWorldHiddenObject.coords[0]),
    y: Real64.from(realWorldHiddenObject.coords[1]),
    z: Real64.from(realWorldHiddenObject.coords[2]),
  });
  const objectRadius = Real64.from(realWorldHiddenObject.radius);

  const object = Object3D.fromPointAndRadius(objectVector, objectRadius);

  const sceneBoxes: Box[] = [];
  boxes.forEach((b) => {
    const vertices = Object.values(b.vertices);
    // Create an array of 8 Vector3 objects from the vertices
    const vertexPoints: Vector3[] = [];
    for (let i = 0; i < vertices.length; i += 3) {
      vertexPoints.push(
        new Vector3({
          x: Real64.from(vertices[i]!),
          y: Real64.from(vertices[i + 1]!),
          z: Real64.from(vertices[i + 2]!),
        }),
      );
    }
    // Get the matrix elements
    const matrixElements = b.matrix.map((x) => Real64.from(x));
    const box = Box.fromVertexPointsAndMatrix(
      vertexPoints,
      Matrix4.fromElements(matrixElements),
    );
    sceneBoxes.push(box);
  });

  const scenePlanes: Plane[] = [];
  planes.forEach((p) => {
    const vertices = Object.values(p.position);
    // Create an array of 4 Vector3 objects from the vertices
    const vertexPoints: Vector3[] = [];
    for (let i = 0; i < vertices.length; i += 3) {
      vertexPoints.push(
        new Vector3({
          x: Real64.from(vertices[i]!),
          y: Real64.from(vertices[i + 1]!),
          z: Real64.from(vertices[i + 2]!),
        }),
      );
    }
    // Scale the matrix elements and set the last element to 1 to keep it affine
    const matrixElements = p.matrix.map((x) => Real64.from(x));
    matrixElements[15] = Real64.from(1);
    // Instantiate the plane from the vertices and the matrix
    const plane = Plane.fromVertexPointsAndMatrix(
      vertexPoints,
      Matrix4.fromElements(matrixElements),
    );
    scenePlanes.push(plane);
  });

  // Validate the planes
  let { verificationKey } = await ValidatePlanes.compile();
  let dummyObject = new Object3D({
    center: new Vector3({
      x: Real64.from(0),
      y: Real64.from(0),
      z: Real64.from(0),
    }),
    radius: Real64.from(0),
  });
  let dummyPlaneAndObjectCommitment = new PlaneAndObjectCommitment({
    plane: scenePlanes[0],
    objectCommitment: dummyObject.getHash(),
  });
  let basePlaneProof: Proof<PlaneAndObjectCommitment, void>;
  let dummyPlaneProof = await ValidatePlanesProof.dummy(dummyPlaneAndObjectCommitment, Void, 1);
  basePlaneProof = await ValidatePlanes.run(
    dummyPlaneAndObjectCommitment,
    dummyObject,
    dummyPlaneProof,
    Bool(false)
  );
  let nextPlaneProof = basePlaneProof;

  for (let plane of scenePlanes) {
    const planeAndObjectCommitment = new PlaneAndObjectCommitment({
      plane: plane,
      objectCommitment: object.getHash(),
    });

    const begin = performance.now();
    nextPlaneProof = await ValidatePlanes.run(planeAndObjectCommitment, object, nextPlaneProof, Bool(true));
    const end = performance.now();
    console.log("proof generation took: ", end - begin, " ms");

    const ok = await verify(nextPlaneProof, verificationKey);
    if (ok) {
      console.log("proof is valid");
    }
  }

  // Validate the boxes
  ({ verificationKey } = await ValidateBoxes.compile());
  let dummyBoxAndObjectCommitment = new BoxAndObjectCommitment({
    box: sceneBoxes[0],
    objectCommitment: dummyObject.getHash(),
  });
  let baseBoxProof: Proof<BoxAndObjectCommitment, void>;
  let dummyBoxProof = await ValidateBoxesProof.dummy(dummyBoxAndObjectCommitment, Void, 1);
  baseBoxProof = await ValidateBoxes.run(
    dummyBoxAndObjectCommitment,
    dummyObject,
    dummyBoxProof,
    Bool(false)
  );
  let nextBoxProof = baseBoxProof;

  for (let box of sceneBoxes) {
    const boxAndObjectCommitment = new BoxAndObjectCommitment({
      box: box,
      objectCommitment: object.getHash(),
    });

    const begin = performance.now();
    nextBoxProof = await ValidateBoxes.run(boxAndObjectCommitment, object, nextBoxProof, Bool(true));
    const end = performance.now();
    console.log("proof generation took: ", end - begin, " ms");

    const ok = await verify(nextBoxProof, verificationKey);
    if (ok) {
      console.log("proof is valid");
    }
  }
} else {
  throw new Error("Object coordinates are undefined");
}

