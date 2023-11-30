import { AccountUpdate, Mina, PrivateKey } from "o1js";

import { HotnCold } from "./HotnCold.js";
import { boxes, planes, realWorldHiddenObject } from "./scene.js";
import { Box, Matrix, Object3D, Plane } from "./structs.js";
// import { meshes } from './meshes.js';
import {
  computeInverseMatrix,
  computeTranslationToOriginMatrix,
  computeTranslationToPositiveCoordsMatrix,
} from "./utils.js";

// const boxes: { vertices: number[], matrix: number[] }[] = [];
//     Object.values(meshes).forEach(item => {
//       const geometry = item?.mesh?.geometries?.[0]?.data?.attributes?.position?.array;
//       const matrixData = item?.mesh?.object?.matrix;
//       if (geometry && matrixData) {
//         boxes.push({
//           vertices: geometry,
//           matrix: matrixData
//         });
//       }
//     });

const boxesAndObjects: Box[] = [];
boxes.forEach((b) => {
  const vertices = new Float32Array(Object.values(b.vertices));
  const inverseMatrix = computeInverseMatrix(b.matrix);
  const o1jsMatrix = Matrix.fromMatrix4(inverseMatrix).invert();
  console.log("inverseMatrix", inverseMatrix);
  console.log("o1jsMatrix", o1jsMatrix);
  const translationToOriginMatrix = computeTranslationToOriginMatrix(vertices);
  const translationToPositiveCoordsMatrix =
    computeTranslationToPositiveCoordsMatrix(realWorldHiddenObject, {
      inverseMatrix,
      translationToOriginMatrix,
    });
  const object = Object3D.fromObjectAndTranslationMatrices(
    realWorldHiddenObject,
    {
      inverseMatrix,
      translationToOriginMatrix,
      translationToPositiveCoordsMatrix,
    },
  );
  const box = Box.fromVerticesTranslationMatricesAndObject(
    vertices,
    { translationToOriginMatrix, translationToPositiveCoordsMatrix },
    object,
  );
  boxesAndObjects.push(box);
});

const planesAndObjects: Plane[] = [];
planes.forEach((p) => {
  const vertices = new Float32Array(Object.values(p.position));
  const inverseMatrix = computeInverseMatrix(p.matrix);
  const translationToOriginMatrix = computeTranslationToOriginMatrix(vertices);
  const translationToPositiveCoordsMatrix =
    computeTranslationToPositiveCoordsMatrix(realWorldHiddenObject, {
      inverseMatrix,
      translationToOriginMatrix,
    });
  const object = Object3D.fromObjectAndTranslationMatrices(
    realWorldHiddenObject,
    {
      inverseMatrix,
      translationToOriginMatrix,
      translationToPositiveCoordsMatrix,
    },
  );
  const plane = Plane.fromVerticesTranslationMatricesAndObject(
    vertices,
    { translationToOriginMatrix, translationToPositiveCoordsMatrix },
    object,
  );
  planesAndObjects.push(plane);
});

// const dummyObject = Object3D.fromPointAndRadius(new Point({x: Field(1000), y: Field(1000), z: Field(1000)}), Field(100));
// const dummyPlane = Plane.fromPoints(new Point({x: Field(0), y: Field(0), z: Field(0)}), new Point({x: Field(0), y: Field(0), z: Field(1)}), new Point({x: Field(0), y: Field(1), z: Field(0)}), dummyObject);
// const room = Room.fromPlanesAndBoxes([dummyPlane], boxesAndObjects);
// const room = Room.fromPlanesAndBoxes(planesAndObjects, boxesAndObjects);
// room.assertNoCollisions();
// room.assertObjectIsInside();

const objectHash = Object3D.getHashFromRealWorldCoordinates(
  realWorldHiddenObject.coords[0],
  realWorldHiddenObject.coords[1],
  realWorldHiddenObject.coords[2],
);

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
  for (const boxAndObject of boxesAndObjects) {
    zkAppInstance.validateObjectIsOutsideBox(boxAndObject);
  }
  for (const planeAndObject of planesAndObjects) {
    zkAppInstance.validateObjectIsInsideRoom(planeAndObject);
  }
});
await txn.prove();
await txn.sign([senderKey]).send();
