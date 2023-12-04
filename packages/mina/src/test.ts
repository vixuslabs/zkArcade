import { Field } from 'o1js';
import { Vector3, AffineTransformationMatrix } from './matrix.js';
import * as THREE from 'three';

const SCALE = 1000000;

const matrixElements = [
  0.006392898038029671, 2.9135346579778343e-8, 0.9999794363975525, 0,
  0.9999794363975525, -8.432591158680225e-8, -0.0063927737064659595, 0,
  2.0851992132975283e-7, 0.9999998807907104, 9.391553845716771e-8, 0,
  0.22366495430469513, 0.7948658466339111, -0.599656343460083, 1,
].map(x => (Math.round(x * SCALE)));
matrixElements[15] = 1;
console.log(matrixElements);

const matrix = AffineTransformationMatrix.fromElements(matrixElements);

console.log(matrix.e0.toJSON(), matrix.e1.toJSON(), matrix.e2.toJSON(), matrix.e3.toJSON());
console.log(matrix.e4.toJSON(), matrix.e5.toJSON(), matrix.e6.toJSON(), matrix.e7.toJSON());
console.log(matrix.e8.toJSON(), matrix.e9.toJSON(), matrix.e10.toJSON(), matrix.e11.toJSON());
console.log(matrix.e12.toJSON(), matrix.e13.toJSON(), matrix.e14.toJSON(), matrix.e15.toJSON());

const vector = new Vector3({ x: Field(100), y: Field(200), z: Field(300) });
const transformedVector = vector.applyATM(matrix);
console.log(transformedVector.x.toString(), transformedVector.y.toString(), transformedVector.z.toString());


// With THREE
const threeMatrix = new THREE.Matrix4();
threeMatrix.fromArray(matrixElements);
const threeVector = new THREE.Vector3(100, 200, 300);
const transformedThreeVector = threeVector.applyMatrix4(threeMatrix);
console.log(transformedThreeVector.x, transformedThreeVector.y, transformedThreeVector.z);