import { AccountUpdate, Mina, PrivateKey, Int64 } from "o1js";

import { HotnCold } from "./HotnCold.js";
import { boxes, planes, realWorldHiddenObject } from "./scene.js";
import { Box, Object3D, Vector3, Plane, AffineTransformationMatrix, SCALE } from "./structs.js";
// import { meshes } from './meshes.js';

// Import the hidden object coordinates
const objectVector = new Vector3({
  x: Int64.from(Math.round(realWorldHiddenObject.coords[0] * SCALE )),
  y: Int64.from(Math.round(realWorldHiddenObject.coords[1] * SCALE )),
  z: Int64.from(Math.round(realWorldHiddenObject.coords[2] * SCALE )),
})
const objectRadius = Int64.from(Math.round(realWorldHiddenObject.radius * SCALE ));
const object = Object3D.fromPointAndRadius(objectVector, objectRadius);

const sceneBoxes: Box[] = [];
boxes.forEach((b) => {
  const vertices = new Float32Array(Object.values(b.vertices));
  // Scale the original box so that all its vertices are integers
  const scaledVertices = vertices.map((v) => Math.round(v * SCALE));
  // Create an array of 8 Vector3 objects from the scaled vertices
  const vertexPoints: Vector3[] = [];
  for (let i = 0; i < scaledVertices.length; i += 3) {
    vertexPoints.push(
      new Vector3({
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
  const box = Box.fromVertexPointsAndATM(vertexPoints, AffineTransformationMatrix.fromElements(matrixElements));
  // box.assertObjectIsOutside(object);
  sceneBoxes.push(box);
});

const scenePlanes: Plane[] = [];
planes.forEach((p) => {
  const vertices = new Float32Array(Object.values(p.position));
  // Scale the original plane so that all its vertices are integers
  const scaledVertices = vertices.map((v) => Math.round(v * SCALE));
  // Create an array of 4 Vector3 objects from the scaled vertices
  const vertexPoints: Vector3[] = [];
  for (let i = 0; i < scaledVertices.length; i += 3) {
    vertexPoints.push(
      new Vector3({
        x: Int64.from(scaledVertices[i]),
        y: Int64.from(scaledVertices[i + 1]),
        z: Int64.from(scaledVertices[i + 2]),
      }),
    );
  }
  // Scale the matrix elements and set the last element to 1 to keep it affine
  const matrixElements = p.matrix.map(x => (Math.round(x * SCALE)));
  matrixElements[15] = 1;
  // Instantiate the plane from the vertices and the matrix
  const plane = Plane.fromVertexPointsAndATM(vertexPoints, AffineTransformationMatrix.fromElements(matrixElements));
  // plane.assertObjectIsOnInnerSide(object);
  scenePlanes.push(plane);
});

// const dummyObject = Object3D.fromPointAndRadius(new Point({x: Field(1000), y: Field(1000), z: Field(1000)}), Field(100));
// const dummyPlane = Plane.fromPoints(new Point({x: Field(0), y: Field(0), z: Field(0)}), new Point({x: Field(0), y: Field(0), z: Field(1)}), new Point({x: Field(0), y: Field(1), z: Field(0)}), dummyObject);
// const room = Room.fromPlanesAndBoxes([dummyPlane], boxesAndObjects);
// const room = Room.fromPlanesAndBoxes(planesAndObjects, boxesAndObjects);
// room.assertNoCollisions();
// room.assertObjectIsInside();

// ----------------------------------------------------

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
  // for (const box of sceneBoxes) {
  //   zkAppInstance.validateObjectIsOutsideBox(box, object);
  // }
  for (const plane of scenePlanes) {
    zkAppInstance.validateObjectIsInsideRoom(plane, object);
  }
});
await txn.prove();
await txn.sign([senderKey]).send();
