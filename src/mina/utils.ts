import { Field, Struct } from "o1js";
import * as THREE from "three";

export const computeInverseMatrix = (matrixArray: number[]) => {
  const matrix = new THREE.Matrix4();
  matrix.fromArray(matrixArray);
  const inverseMatrix = new THREE.Matrix4().copy(matrix).invert();
  return inverseMatrix;
};

export const computeTranslationToOriginMatrix = (
  vertices: Float32Array,
): THREE.Matrix4 => {
  const translationToOrigin = new THREE.Vector3(
    vertices[0],
    vertices[1],
    vertices[2],
  );
  translationToOrigin.negate(); // Translation to origin is the negative of the first vertex
  return new THREE.Matrix4().makeTranslation(
    translationToOrigin.x,
    translationToOrigin.y,
    translationToOrigin.z,
  );
};

export const computeTranslationToPositiveCoordsMatrix = (rwHiddenObject: {
  coords: number[];
  radius: number;
}): THREE.Matrix4 => {
  const hiddenObject = new THREE.Vector3(...rwHiddenObject.coords);
  const translationToPositiveCoords = new THREE.Vector3();
  const objRadius = rwHiddenObject.radius;
  translationToPositiveCoords.x =
    hiddenObject.x - objRadius < 0 ? -hiddenObject.x + objRadius : 0;
  translationToPositiveCoords.y =
    hiddenObject.y - objRadius < 0 ? -hiddenObject.y + objRadius : 0;
  translationToPositiveCoords.z =
    hiddenObject.z - objRadius < 0 ? -hiddenObject.z + objRadius : 0;
  return new THREE.Matrix4().makeTranslation(
    translationToPositiveCoords.x,
    translationToPositiveCoords.y,
    translationToPositiveCoords.z,
  );
};
