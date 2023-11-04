/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Field, Struct } from 'o1js';

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