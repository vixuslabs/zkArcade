import { AccountUpdate, Mina, PrivateKey, Field } from "o1js";

import { HotnCold } from "./HotnCold.js";
import { boxes, planes, realWorldHiddenObject } from "./scene.js";
import { o1Box, Object3D, Vector3, o1Plane, AffineTransformationMatrix } from "./structs.js";
// import { meshes } from './meshes.js';

const SCALE = 1000000;

const objectVector = new Vector3({
  x: Field(Math.round(realWorldHiddenObject.coords[0] * SCALE + 10*SCALE)).mul(SCALE),
  y: Field(Math.round(realWorldHiddenObject.coords[1] * SCALE + 10*SCALE)).mul(SCALE),
  z: Field(Math.round(realWorldHiddenObject.coords[2] * SCALE + 10*SCALE)).mul(SCALE),
})
console.log('Field-typed object vector: ', objectVector.x.toJSON(), objectVector.y.toJSON(), objectVector.z.toJSON());
const objectRadius = Field(Math.round(realWorldHiddenObject.radius * SCALE)).mul(SCALE);
const object = Object3D.fromPointAndRadius(objectVector, objectRadius);

const o1Boxes: o1Box[] = [];
boxes.forEach((b) => {
  const vertices = new Float32Array(Object.values(b.vertices));
  // Translate and scale the original box so that all its vertices are positive integers
  const scaledAndTranslatedVertices = vertices.map((v) => Math.round(v * SCALE + 10*SCALE));
  console.log('Scaled and Translated Vertices: ', scaledAndTranslatedVertices);
  // Create an array of 8 Vector3 objects from the vertices
  const vertexPoints: Vector3[] = [];
  for (let i = 0; i < scaledAndTranslatedVertices.length; i += 3) {
    vertexPoints.push(
      new Vector3({
        x: Field(scaledAndTranslatedVertices[i]),
        y: Field(scaledAndTranslatedVertices[i + 1]),
        z: Field(scaledAndTranslatedVertices[i + 2]),
      }),
    );
  }
  console.log('Field-typed vertex points:');
  for (const p of vertexPoints) {
    console.log(p.x.toJSON(), p.y.toJSON(), p.z.toJSON());
  }
  // Scale the matrix elements and set the last element to 1 to keep it affine
  const matrixElements = b.matrix.map(x => (Math.round(x * SCALE)));
  matrixElements[15] = 1;
  // Apply the affine transformation matrix to each vertex
  const translatedVertexPoints = vertexPoints.map((p) => {
    return p.applyATM(AffineTransformationMatrix.fromElements(matrixElements));
  });
  console.log("\nTranslated Vertex Points:");
  for (const p of translatedVertexPoints) {
    console.log(p.x.toJSON(), p.y.toJSON(), p.z.toJSON());
  }
  let minX = translatedVertexPoints[0].x;
  let maxX = translatedVertexPoints[0].x;
  let minY = translatedVertexPoints[0].y;
  let maxY = translatedVertexPoints[0].y;
  let minZ = translatedVertexPoints[0].z;
  let maxZ = translatedVertexPoints[0].z;
  for (const p of translatedVertexPoints) {
    if (p.x.toBigInt() < minX.toBigInt()) {
      minX = p.x;
    }
    if (p.x.toBigInt() > maxX.toBigInt()) {
      maxX = p.x;
    }
    if (p.y.toBigInt() < minY.toBigInt()) {
      minY = p.y;
    }
    if (p.y.toBigInt() > maxY.toBigInt()) {
      maxY = p.y;
    }
    if (p.z.toBigInt() < minZ.toBigInt()) {
      minZ = p.z;
    }
    if (p.z.toBigInt() > maxZ.toBigInt()) {
      maxZ = p.z;
    }
  }
  const box = o1Box.fromMinMax(minX, maxX, minY, maxY, minZ, maxZ);
  console.log('Box:', 
    minX.toBigInt()/1000000000n,
    maxX.toBigInt()/1000000000n,
    minY.toBigInt()/1000000000n,
    maxY.toBigInt()/1000000000n,
    minZ.toBigInt()/1000000000n,
    maxZ.toBigInt()/1000000000n,
  );
  console.log('Object: ', object.center.x.toBigInt()/1000000000n, object.center.y.toBigInt()/1000000000n, object.center.z.toBigInt()/1000000000n, object.radius.toBigInt()/1000000000n);
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
