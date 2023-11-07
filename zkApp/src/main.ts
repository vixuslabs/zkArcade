/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Point, Object3D, Plane, Box, Room } from './structs.js';
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
import { 
  computeInverseMatrix,
  computeTranslationToOriginMatrix,
  computeTranslationToPositiveCoordsMatrix
} from './utils.js';

type BoxAndObject = {box: Box, object: Object3D};

const boxesAndObjects: BoxAndObject[] = [];
boxes.forEach((b) => {
  const vertices = new Float32Array(Object.values(b.vertices));
  const inverseMatrix = computeInverseMatrix(b.matrix);
  const translationToOriginMatrix = computeTranslationToOriginMatrix(vertices);
  const translationToPositiveCoordsMatrix = computeTranslationToPositiveCoordsMatrix(realWorldHiddenObject);  
  const object = Object3D.fromObjectAndTranslationMatrices(realWorldHiddenObject, {inverseMatrix, translationToOriginMatrix, translationToPositiveCoordsMatrix});
  const box = Box.fromVerticesAndTranslationMatrices(vertices, {translationToOriginMatrix, translationToPositiveCoordsMatrix});
  boxesAndObjects.push({box, object});
});

const testObject: Object3D = boxesAndObjects[0].object;
const testBox: Box = boxesAndObjects[0].box;


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
  zkAppInstance.commitObject(testObject);
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

const objectHash = zkAppInstance.objectHash.get();
// console.log('Commited on-chain hash:', objectHash);
// console.log('Computed object hash: ', Poseidon.hash([testObject.center.x, testObject.center.y, testObject.center.z, testObject.radius]))

// ----------------------------------------------------

// testBox.assertIsOutside(testObject);

const plane = Plane.fromPoints(Point.fromCoords(Field(0), Field(0), Field(0)), Point.fromCoords(Field(0), Field(0), Field(1)), Point.fromCoords(Field(1), Field(0), Field(0)), Point.fromCoords(Field(1), Field(0), Field(1)));
const room = Room.fromPlanesAndBoxes([plane], [testBox]);
room.assertNoCollisions(testObject);

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.validateObject(testObject, room);
});
await txn1.prove();
await txn1.sign([senderKey]).send();

// ----------------------------------------------------