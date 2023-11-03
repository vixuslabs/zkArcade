/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Field, Struct, SmartContract, state, State, method, Poseidon } from 'o1js';

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
    // 
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


// The HotnCold contract allows users to commit an object hash and then validate that:
// 1. A given object matches the previously commited hash.
// 2. The object is inside a given room.
// 3. There are no collisions with the room's boxes.
export class HotnCold extends SmartContract {

  // The object hash is the hash of the object's center and radius.
  @state(Field) objectHash = State<Field>();

  // Commit the object hash on-chain.
  @method commitObject(object: Object3D) {
    this.objectHash.set(Poseidon.hash([object.center.x, object.center.y, object.center.z, object.radius]));
  }

  // Validate the object against the previously commited object hash and the room.
  @method validateObject(object: Object3D, room: Room) {
    // Get the object hash from on-chain storage.
    const objectHash = this.objectHash.getAndAssertEquals();
    
    // Check that the object hash matches the previously commited object hash.
    objectHash.assertEquals(Poseidon.hash([object.center.x, object.center.y, object.center.z, object.radius]));

    // Check that the object is inside the room.
    room.assertIsInside(object);

    // Check that the object does not collide with any of the room's boxes.
    room.assertNoCollisions(object);
    
  }
}