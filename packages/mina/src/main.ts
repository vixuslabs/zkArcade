import { AccountUpdate, Mina, PrivateKey, Int64 } from "o1js";

import { HotnCold } from "./HotnCold.js";
import { boxes, planes, realWorldHiddenObject } from "./scene.js";
import { Room, Object3D, Plane, Box, Vector3, AffineTransformationMatrix, SCALE } from "./structs.js";

// Import the hidden object coordinates
if ((realWorldHiddenObject.coords[0] !== undefined) 
  && (realWorldHiddenObject.coords[1] !== undefined) 
  && (realWorldHiddenObject.coords[2] !== undefined)) 
{
  const objectVector = new Vector3({
  x: Int64.from(Math.round(realWorldHiddenObject.coords[0] * SCALE )),
  y: Int64.from(Math.round(realWorldHiddenObject.coords[1] * SCALE )),
  z: Int64.from(Math.round(realWorldHiddenObject.coords[2] * SCALE )),
})
  const objectRadius = Int64.from(Math.round(realWorldHiddenObject.radius * SCALE ));
  const object = Object3D.fromPointAndRadius(objectVector, objectRadius);

  const sceneBoxes: Box[] = [];
  boxes.forEach((b) => {
    const vertices = new Array(Object.values(b.vertices));
    // Scale the original box so that all its vertices are integers
    const scaledVertices = vertices.map((v) => {
      if (typeof v === 'number') {
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
    const matrixElements = b.matrix.map(x => (Math.round(x * SCALE)));
    matrixElements[15] = 1;
    // Instantiate the box from the vertices and the matrix
    const box = Box.fromVertexPointsAndATM(vertexPoints, AffineTransformationMatrix.fromElements(matrixElements));
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
          x: Int64.from(scaledVertices[i]!),
          y: Int64.from(scaledVertices[i + 1]!),
          z: Int64.from(scaledVertices[i + 2]!),
        }),
      );
    }
    // Scale the matrix elements and set the last element to 1 to keep it affine
    const matrixElements = p.matrix.map(x => (Math.round(x * SCALE)));
    matrixElements[15] = 1;
    // Instantiate the plane from the vertices and the matrix
    const plane = Plane.fromVertexPointsAndATM(vertexPoints, AffineTransformationMatrix.fromElements(matrixElements));
    scenePlanes.push(plane);
  });

  // Instantiate the room from the planes and boxes
  const room = Room.fromPlanesAndBoxes(scenePlanes, sceneBoxes);

  // ----------------------------------------------------

  const useProof = false;
  const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
  Mina.setActiveInstance(Local);
  const { privateKey: deployerKey, publicKey: deployerAccount } =
    Local.testAccounts[0]!;
  const { privateKey: senderKey, publicKey: senderAccount } =
    Local.testAccounts[1]!;

  // ----------------------------------------------------

  // create a destination we will deploy the smart contract to
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const zkAppInstance = new HotnCold(zkAppAddress);
  const deployTxn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy();
    zkAppInstance.commitPlayer1Object(object);
    zkAppInstance.commitPlayer2Object(object);
  });
  await deployTxn.prove();
  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

  // ----------------------------------------------------

  const txn = await Mina.transaction(senderAccount, () => {
      zkAppInstance.validatePlayer1Room(room, object);
      zkAppInstance.validatePlayer2Room(room, object);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();


} else {
  throw new Error("Object coordinates are undefined");
}

