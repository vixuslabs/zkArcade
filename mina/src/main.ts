import { HotnCold, Point, Object3D, Plane, Box, Room } from './HotnCold.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  Poseidon
} from 'o1js';

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];
  
const object = Object3D.fromCenterAndRadius(Point.fromCoords(Field(50), Field(50), Field(50)), Field(25));

// ----------------------------------------------------

// create a destination we will deploy the smart contract to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new HotnCold(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.commitObject(object);
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

const objectHash = zkAppInstance.objectHash.get();
console.log('Commited on-chain hash:', objectHash);
console.log('Computed object hash: ', Poseidon.hash([object.center.x, object.center.y, object.center.z, object.radius]))

