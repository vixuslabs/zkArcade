import { Int64 } from 'o1js';
import { Vector3, AffineTransformationMatrix, SCALE } from './structs.js';
import * as THREE from 'three';

const originalMatrix = [
  -0.08696980774402618, 0.0018209785921499133, 0.9962093234062195, 0,
  0.9962109923362732, -1.0623874402426736e-7, 0.08696991205215454, 0,
  0.00015844027802813798, 0.9999983906745911, -0.001814108807593584, 0,
  1.0200589895248413, 1.229479432106018, 0.239743173122406, 1,
]

const matrixElements = originalMatrix.map(x => (Math.round(x * SCALE)));
matrixElements[15] = 1;
// Int64 representation
const int64Matrix = AffineTransformationMatrix.fromElements(matrixElements);

// console.log(int64Matrix.e0.toJSON(), int64Matrix.e1.toJSON(), int64Matrix.e2.toJSON(), int64Matrix.e3.toJSON());
// console.log(int64Matrix.e4.toJSON(), int64Matrix.e5.toJSON(), int64Matrix.e6.toJSON(), int64Matrix.e7.toJSON());
// console.log(int64Matrix.e8.toJSON(), int64Matrix.e9.toJSON(), int64Matrix.e10.toJSON(), int64Matrix.e11.toJSON());
// console.log(int64Matrix.e12.toJSON(), int64Matrix.e13.toJSON(), int64Matrix.e14.toJSON(), int64Matrix.e15.toJSON());

const originalVector = [-0.9790574908256531, -7.569404054019648e-17, -1.2361774444580078];
const int64Vector = new Vector3(
  { x: Int64.from(Math.round(originalVector[0] * SCALE)), 
    y: Int64.from(Math.round(originalVector[1] * SCALE)), 
    z: Int64.from(Math.round(originalVector[2] * SCALE)) 
  });
const int64TransformedVector = int64Vector.applyATM(int64Matrix);
console.log('With Int64:');
console.log(int64TransformedVector.x.toString(), int64TransformedVector.y.toString(), int64TransformedVector.z.toString());


// With THREE
console.log('\nWith THREE:');
const threeMatrix = new THREE.Matrix4();
threeMatrix.fromArray(originalMatrix);
const threeVector = new THREE.Vector3(originalVector[0], originalVector[1], originalVector[2]);
const transformedThreeVector = threeVector.applyMatrix4(threeMatrix);
console.log(transformedThreeVector.x, transformedThreeVector.y, transformedThreeVector.z);


// Vector cross product tests
const originalVector1 = [0.1, 0.2, 0.3];
const originalVector2 = [0.4, 0.5, 0.6];

console.log('\nVector cross product tests:');
const v1 = new Vector3({ x: Int64.from(originalVector1[0] * SCALE), y: Int64.from(originalVector1[1] * SCALE), z: Int64.from(originalVector1[2] * SCALE) });
const v2 = new Vector3({ x: Int64.from(originalVector2[0] * SCALE), y: Int64.from(originalVector2[1] * SCALE), z: Int64.from(originalVector2[2] * SCALE) });
const v3 = v1.crossProduct(v2);
console.log(v3.x.toString(), v3.y.toString(), v3.z.toString());

const v4 = new THREE.Vector3(originalVector1[0], originalVector1[1], originalVector1[2]);
const v5 = new THREE.Vector3(originalVector2[0], originalVector2[1], originalVector2[2]);
const v6 = new THREE.Vector3();
v6.crossVectors(v4, v5);
console.log(v6.x, v6.y, v6.z);
