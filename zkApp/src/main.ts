/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Point, Object3D, Plane, Box, Room, ThreeBox, ThreeObject } from './structs.js';
import { HotnCold } from './HotnCold.js';
import {
  Field,
  Mina,
  PrivateKey,
  Struct,
  AccountUpdate,
  Poseidon
} from 'o1js';
import { boxes, planes, realWorldHiddenObject } from './scene.js' 
import * as THREE from 'three';

const o1jsBoxes: { o1jsBox: Box; o1jsObject: Object3D; }[] = [];
boxes.forEach((box) => {
  const vertices = new Float32Array(Object.values(box.vertices));
  const matrix = new THREE.Matrix4();
  matrix.fromArray(box.matrix);
  const inverseMatrix = new THREE.Matrix4().copy(matrix).invert();
  const hiddenObject = new THREE.Vector3(...realWorldHiddenObject.coords);
  hiddenObject.applyMatrix4(inverseMatrix);

  const translationToOrigin = new THREE.Vector3(vertices[0], vertices[1], vertices[2]);
  translationToOrigin.negate(); // Translation to origin is the negative of the first vertex
  const translationToOriginMatrix = new THREE.Matrix4().makeTranslation(translationToOrigin.x, translationToOrigin.y, translationToOrigin.z);
  hiddenObject.applyMatrix4(translationToOriginMatrix);

  const translationToPositiveCoords = new THREE.Vector3();
  const objRadius = realWorldHiddenObject.radius;
  translationToPositiveCoords.x = hiddenObject.x - objRadius < 0 ? -hiddenObject.x + objRadius : 0;
  translationToPositiveCoords.y = hiddenObject.y - objRadius< 0 ? -hiddenObject.y + objRadius : 0;
  translationToPositiveCoords.z = hiddenObject.z - objRadius < 0 ? -hiddenObject.z + objRadius : 0;
  const translationToPositiveCoordsMatrix = new THREE.Matrix4().makeTranslation(translationToPositiveCoords.x, translationToPositiveCoords.y, translationToPositiveCoords.z);  
  hiddenObject.applyMatrix4(translationToPositiveCoordsMatrix);

  const translationMatrix = translationToOriginMatrix.clone().multiply(translationToPositiveCoordsMatrix);
  const threeBox = new ThreeBox(vertices, translationMatrix);
  const o1jsBox = threeBox.toO1jsBox();
  const threeObject = new ThreeObject(hiddenObject, realWorldHiddenObject.radius);
  const o1jsObject = threeObject.toO1jsObject();
  o1jsBoxes.push({o1jsBox, o1jsObject});
});

const testObject: Object3D = o1jsBoxes[0].o1jsObject;
const testBox: Box = o1jsBoxes[0].o1jsBox;


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

// const zkAppInstance = new HotnCold(zkAppAddress);
// const deployTxn = await Mina.transaction(deployerAccount, () => {
//   AccountUpdate.fundNewAccount(deployerAccount);
//   zkAppInstance.deploy();
//   zkAppInstance.commitObject(object);
// });
// await deployTxn.prove();
// await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// const objectHash = zkAppInstance.objectHash.get();
// console.log('Commited on-chain hash:', objectHash);
// console.log('Computed object hash: ', Poseidon.hash([object.center.x, object.center.y, object.center.z, object.radius]))

// ----------------------------------------------------

testBox.assertIsOutside(testObject);

// const plane = Plane.fromPoints(Point.fromCoords(Field(0), Field(0), Field(0)), Point.fromCoords(Field(0), Field(0), Field(1)), Point.fromCoords(Field(1), Field(0), Field(0)), Point.fromCoords(Field(1), Field(0), Field(1)));
// const room = Room.fromPlanesAndBoxes([plane], [testBox]);
// room.assertNoCollisions(object);

// const txn1 = await Mina.transaction(senderAccount, () => {
//   zkAppInstance.validateObject(object, room);
// });
// await txn1.prove();
// await txn1.sign([senderKey]).send();

// ----------------------------------------------------