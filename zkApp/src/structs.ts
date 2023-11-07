/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Field, Struct } from 'o1js';
import * as THREE from 'three';

export class Point extends Struct({ x: Field, y: Field, z: Field }) {
    static fromCoords(x: Field, y: Field, z: Field) {
      return new Point({ x, y, z });
    }
  }
  
// An object is a sphere.
export class Object3D extends Struct({ center: Point, radius: Field }) {
  static fromObjectAndTranslationMatrices(object: {coords: number[], radius: number}, translationMatrices: {inverseMatrix: THREE.Matrix4, translationToOriginMatrix: THREE.Matrix4, translationToPositiveCoordsMatrix: THREE.Matrix4}) {
    const scale = 1000000;
    const center = new THREE.Vector3(...object.coords);
    center.applyMatrix4(translationMatrices.inverseMatrix);
    center.applyMatrix4(translationMatrices.translationToOriginMatrix);
    center.applyMatrix4(translationMatrices.translationToPositiveCoordsMatrix);
    // center.applyMatrix4(translationMatrix);
    const radius = object.radius;
    return new Object3D({ center: Point.fromCoords(Field(Math.round(center.x * scale)), 
                                                   Field(Math.round(center.y * scale)), 
                                                   Field(Math.round(center.z * scale))), 
                          radius: Field(Math.round(radius * 1000000)) 
                        });
    }
  
    static fromPointAndRadius(center: Point, radius: Field) {
      return new Object3D({ center, radius });
    }

    // The object's bounding box.
    minX() {
        return this.center.x.sub(this.radius);
    }
    minY() {
        return this.center.y.sub(this.radius);
    }
    minZ() {
        return this.center.z.sub(this.radius);
    }
    maxX() {
        return this.center.x.add(this.radius);
    }
    maxY() {
        return this.center.y.add(this.radius);
    }
    maxZ() {
        return this.center.z.add(this.radius);
    }
}
  
// A plane is defined by 4 points.
export class Plane extends Struct({ a: Point, b: Point, c: Point, d: Point }) {
    static fromPoints(a: Point, b: Point, c: Point, d: Point) {
        return new Plane ({ a, b, c, d });
    }
}
  
// A box is defined by 2 points 'a' and 'b'.
// 'a' is the min point (bottom, near, left) and 'b' is the max point (top, far, right).
export class Box extends Struct({ a: Point, b: Point }) {
  // This static method takes two arguments:
  // 1. The vertices of the box as exported from the WebXR experience (an array of 24 elements of type Float32Array)).
  // 2. A translation matrix used to translate the box in such a way that:
  //   - Its sides are aligned to the x, y, and z axes (so that the box can be represented with just two points).
  //   - All vertices have positive coordinates.
  // In addition to this, the method also scales the box by a factor of 1000000 and rounds the coordinates to integers
  // so that they can be represented with Field elements in o1js.
  static fromVerticesAndTranslationMatrices(vertices: Float32Array, matrices: {translationToOriginMatrix: THREE.Matrix4, translationToPositiveCoordsMatrix: THREE.Matrix4}) {
    const scale = 1000000;
    const v = [];
    // Iterate through all vertices and apply the translation matrix to each one.
    for (let i = 0; i < vertices.length; i += 3) {
        const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        vertex.applyMatrix4(matrices.translationToOriginMatrix);
        vertex.applyMatrix4(matrices.translationToPositiveCoordsMatrix);
        v.push(vertex);
    }
    // Find the closest and farthest vertices to the origin. These will be the two points that define the box.
    let closestVertex = new THREE.Vector3();
    let farthestVertex = new THREE.Vector3();
    let closestDistance = Infinity;
    let farthestDistance = 0;
    // Loop through all vertices to find the closest and farthest
    v.forEach(vertex => {
        let distance = vertex.length(); // Get the distance from origin
        // Check if this vertex is closer than the current closest
        if (distance < closestDistance) {
        closestDistance = distance;
        closestVertex = vertex;
        }
        // Check if this vertex is farther than the current farthest
        if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestVertex = vertex;
        }
    });
    // Returns a box with the closest and farthest vertices.
    return new Box({ a: Point.fromCoords(Field(Math.round(closestVertex.x * scale)), 
                                         Field(Math.round(closestVertex.y * scale)), 
                                         Field(Math.round(closestVertex.z * scale))), 
                     b: Point.fromCoords(Field(Math.round(farthestVertex.x * scale)), 
                                         Field(Math.round(farthestVertex.y * scale)), 
                                         Field(Math.round(farthestVertex.z * scale))) 
                    });
  }

  // Check that the object is outside the box.
  assertIsOutside(object: Object3D) {

      const minX = this.a.x;
      const minY = this.a.y;
      const minZ = this.a.z;

      const maxX = this.b.x;
      const maxY = this.b.y;
      const maxZ = this.b.z;

      object.maxX().lessThan(minX)
      .or(object.maxY().lessThan(minY))
      .or(object.maxZ().lessThan(minZ))
      .or(object.minX().greaterThan(maxX))
      .or(object.minY().greaterThan(maxY))
      .or(object.minZ().greaterThan(maxZ))
      .assertTrue();
  }
}
  
// A room is defined by a list of planes and boxes.
export class Room extends Struct({ planes: [Plane], boxes: [Box] }) {
    static fromPlanesAndBoxes(planes: [Plane], boxes: [Box]) {
        return new Room({ planes, boxes });
    }

      // Check that the object is inside the room.
  assertIsInside(object: Object3D) {}

  // Check that the object does not collide with any of the room's boxes.
  assertNoCollisions(object: Object3D) {
    for (const box of this.boxes) {
      box.assertIsOutside(object);
    }
  }
}
