/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Field, Struct } from 'o1js';
import * as THREE from 'three';

export class Point extends Struct({ x: Field, y: Field, z: Field }) {
    static fromCoords(x: Field, y: Field, z: Field): Point {
      return new Point({ x, y, z });
    }
  }
  
// An object is a sphere.
export class Object3D extends Struct({ center: Point, radius: Field }) {
    static fromCenterAndRadius(center: Point, radius: Field): Object3D {
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
    static fromPoints(a: Point, b: Point) {
        return new Box({ a, b });
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

// Representation of a box in 3D space using three.js types, which are used inside the
// WebXR scene. The box is defined by 2 points 'a' and 'b'. 
export class ThreeBox {
    a: THREE.Vector3;
    b: THREE.Vector3;
    scale: number;

    // The constructor takes the vertices of the box and a translation matrix to translate the box
    // in such a way that its sides are aligned to the x, y, and z axes and all vertices are positive.
    // This is so that the box can be represented with just two points, 'a' and 'b'.
    // Optionally, it takes a scale factor to scale the box when exporting it to the o1js format.
    constructor (vertices: Float32Array, translationMatrix: THREE.Matrix4, scale: number = 1000000) {
        this.scale = scale;
        const v = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            v.push(vertex.applyMatrix4(translationMatrix));
        }
        let closestVertex = new THREE.Vector3();
        let farthestVertex = new THREE.Vector3();
        let closestDistance = Infinity; // A very large number to start with
        let farthestDistance = 0; // Start with 0 for the farthest
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
        this.a = closestVertex
        this.b = farthestVertex
        }

    toO1jsBox() {
        const a = Point.fromCoords(Field(Math.round(this.a.x * this.scale)), Field(Math.round(this.a.y * this.scale)), Field(Math.round(this.a.z * this.scale)));
        const b = Point.fromCoords(Field(Math.round(this.b.x * this.scale)), Field(Math.round(this.b.y * this.scale)), Field(Math.round(this.b.z * this.scale)));
        return Box.fromPoints(a, b);
    }
}

export class ThreeObject {
    center: THREE.Vector3;
    radius: number;
    scale: number;
  
    constructor (center: THREE.Vector3, radius: number, scale: number = 1000000) {
        this.center = center;
        this.radius = radius;
        this.scale = scale;
    }

    toO1jsObject() {
        const center = Point.fromCoords(Field(Math.round(this.center.x * this.scale)), Field(Math.round(this.center.y * this.scale)), Field(Math.round(this.center.z * this.scale)));
        const radius = Field(Math.round(this.radius * this.scale));
        return Object3D.fromCenterAndRadius(center, radius);
    }
}