import { AccountUpdate, Mina, PrivateKey, Field, Int64, Provable } from "o1js";

import { HotnCold } from "./HotnCold.js";
import { boxes, planes, realWorldHiddenObject } from "./scene.js";
import { o1Box, Object3D, Int64Vector3, o1Plane, Int64AffineTransformationMatrix, Int64Object3D, Int64o1Box } from "./structs.js";
// import { meshes } from './meshes.js';

const SCALE = 1000000;

// Import the hidden object coordinates
const objectVector = new Int64Vector3({
  x: Int64.from(Math.round(realWorldHiddenObject.coords[0] * SCALE * SCALE)),
  y: Int64.from(Math.round(realWorldHiddenObject.coords[1] * SCALE * SCALE)),
  z: Int64.from(Math.round(realWorldHiddenObject.coords[2] * SCALE * SCALE)),
})
const objectRadius = Int64.from(Math.round(realWorldHiddenObject.radius * SCALE * SCALE));
const object = Int64Object3D.fromPointAndRadius(objectVector, objectRadius);

const o1Boxes: Int64o1Box[] = [];
boxes.forEach((b) => {
  const vertices = new Float32Array(Object.values(b.vertices));
  // Scale the original box so that all its vertices are integers
  const scaledVertices = vertices.map((v) => Math.round(v * SCALE));
  // Create an array of 8 Vector3 objects from the scaled vertices
  const vertexPoints: Int64Vector3[] = [];
  for (let i = 0; i < scaledVertices.length; i += 3) {
    vertexPoints.push(
      new Int64Vector3({
        x: Int64.from(scaledVertices[i]),
        y: Int64.from(scaledVertices[i + 1]),
        z: Int64.from(scaledVertices[i + 2]),
      }),
    );
  }
  // Scale the matrix elements and set the last element to 1 to keep it affine
  const matrixElements = b.matrix.map(x => (Math.round(x * SCALE)));
  matrixElements[15] = 1;
  // Instantiate the box from the vertices and the matrix
  const box = Int64o1Box.fromVertexPointsAndATM(vertexPoints, Int64AffineTransformationMatrix.fromElements(matrixElements));
  // box.assertObjectIsOutside(object);
  o1Boxes.push(box);
});

// const planesAndObjects: Plane[] = [];
// planes.forEach((p) => {
//   const vertices = new Float32Array(Object.values(p.position));
//   const inverseMatrix = computeInverseMatrix(p.matrix);
//   const translationToOriginMatrix = computeTranslationToOriginMatrix(vertices);
//   const translationToPositiveCoordsMatrix =
//     computeTranslationToPositiveCoordsMatrix(realWorldHiddenObject, {
//       inverseMatrix,
//       translationToOriginMatrix,
//     });
//   const object = Object3D.fromObjectAndTranslationMatrices(
//     realWorldHiddenObject,
//     {
//       inverseMatrix,
//       translationToOriginMatrix,
//       translationToPositiveCoordsMatrix,
//     },
//   );
//   const plane = Plane.fromVerticesTranslationMatricesAndObject(
//     vertices,
//     { translationToOriginMatrix, translationToPositiveCoordsMatrix },
//     object,
//   );
//   planesAndObjects.push(plane);
// });

// const dummyObject = Object3D.fromPointAndRadius(new Point({x: Field(1000), y: Field(1000), z: Field(1000)}), Field(100));
// const dummyPlane = Plane.fromPoints(new Point({x: Field(0), y: Field(0), z: Field(0)}), new Point({x: Field(0), y: Field(0), z: Field(1)}), new Point({x: Field(0), y: Field(1), z: Field(0)}), dummyObject);
// const room = Room.fromPlanesAndBoxes([dummyPlane], boxesAndObjects);
// const room = Room.fromPlanesAndBoxes(planesAndObjects, boxesAndObjects);
// room.assertNoCollisions();
// room.assertObjectIsInside();

const objectHash = object.getHash();

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// ----------------------------------------------------

// create a destination we will deploy the smart contract to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new HotnCold(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.commitObject(objectHash);
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// ----------------------------------------------------

const txn = await Mina.transaction(senderAccount, () => {
  for (const box of o1Boxes) {
    zkAppInstance.validateObjectIsOutsideBox(box, object);
  }
  // for (const planeAndObject of planesAndObjects) {
  //   zkAppInstance.validateObjectIsInsideRoom(planeAndObject);
  // }
});
await txn.prove();
await txn.sign([senderKey]).send();
