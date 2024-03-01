import { Real64, Vector3, Matrix4 } from "./zk3d";
import * as THREE from "three";

const originalMatrix = [
  -0.08696980774402618, 0.0018209785921499133, 0.9962093234062195, 0,
  0.9962109923362732, -1.0623874402426736e-7, 0.08696991205215454, 0,
  0.00015844027802813798, 0.9999983906745911, -0.001814108807593584, 0,
  1.0200589895248413, 1.229479432106018, 0.239743173122406, 1,
];

const real64Matrix = [
  Real64.from(originalMatrix[0]!),
  Real64.from(originalMatrix[1]!),
  Real64.from(originalMatrix[2]!),
  Real64.from(originalMatrix[3]!),
  Real64.from(originalMatrix[4]!),
  Real64.from(originalMatrix[5]!),
  Real64.from(originalMatrix[6]!),
  Real64.from(originalMatrix[7]!),
  Real64.from(originalMatrix[8]!),
  Real64.from(originalMatrix[9]!),
  Real64.from(originalMatrix[10]!),
  Real64.from(originalMatrix[11]!),
  Real64.from(originalMatrix[12]!),
  Real64.from(originalMatrix[13]!),
  Real64.from(originalMatrix[14]!),
  Real64.from(originalMatrix[15]!),
];
const matrix = Matrix4.fromElements(real64Matrix);

const originalVector = [
  -0.9790574908256531, -7.569404054019648e-17, -1.2361774444580078,
];
const vector = Vector3.fromNumbers(
  originalVector[0]!,
  originalVector[1]!,
  originalVector[2]!,
);

const transformedVector = vector.applyMatrix4(matrix);
console.log("With Real64:");
console.log(
  transformedVector.x.toString(),
  transformedVector.y.toString(),
  transformedVector.z.toString(),
);

// With THREE
console.log("\nWith THREE:");
const threeMatrix = new THREE.Matrix4();
threeMatrix.fromArray(originalMatrix);
const threeVector = new THREE.Vector3(
  originalVector[0],
  originalVector[1],
  originalVector[2],
);
const transformedThreeVector = threeVector.applyMatrix4(threeMatrix);
console.log(
  transformedThreeVector.x,
  transformedThreeVector.y,
  transformedThreeVector.z,
);

// Vector cross product tests
const originalVector1 = [0.1, 0.2, 0.3];
const originalVector2 = [0.4, 0.5, 0.6];

console.log("\nVector cross product tests:");
const v1 = new Vector3({
  x: Real64.from(originalVector1[0]!),
  y: Real64.from(originalVector1[1]!),
  z: Real64.from(originalVector1[2]!),
});
const v2 = new Vector3({
  x: Real64.from(originalVector2[0]!),
  y: Real64.from(originalVector2[1]!),
  z: Real64.from(originalVector2[2]!),
});
const v3 = v1.cross(v2);
console.log(v3.x.toString(), v3.y.toString(), v3.z.toString());

const v4 = new THREE.Vector3(
  originalVector1[0],
  originalVector1[1],
  originalVector1[2],
);
const v5 = new THREE.Vector3(
  originalVector2[0],
  originalVector2[1],
  originalVector2[2],
);
const v6 = new THREE.Vector3();
v6.crossVectors(v4, v5);
console.log(v6.x, v6.y, v6.z);
