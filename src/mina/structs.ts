"use client";

/* eslint-disable */

import { Field, Struct, Poseidon } from "o1js";
// import * as  from "";

import type { Matrix4 } from "three";
import { Vector3 } from "three";

export const SCALE = 1000000;

export type BoxAndObject = { box: Box; object: Object3D };
export type PlaneAndObject = { plane: Plane; object: Object3D };

export class Point extends Struct({ x: Field, y: Field, z: Field }) {
  constructor(value: { x: Field; y: Field; z: Field }) {
    super(value);
  }

  toJSON() {
    return JSON.stringify({
      x: this.x.toJSON(),
      y: this.y.toJSON(),
      z: this.z.toJSON(),
    });
  }
}

// An object is a sphere.
export class Object3D extends Struct({ center: Point, radius: Field }) {
  static fromObjectAndTranslationMatrices(
    object: { coords: number[]; radius: number },
    translationMatrices: {
      inverseMatrix: Matrix4;
      translationToOriginMatrix: Matrix4;
      translationToPositiveCoordsMatrix: Matrix4;
    },
  ) {
    const center = new Vector3(...object.coords);
    center.applyMatrix4(translationMatrices.inverseMatrix);
    center.applyMatrix4(translationMatrices.translationToOriginMatrix);
    center.applyMatrix4(translationMatrices.translationToPositiveCoordsMatrix);

    const radius = object.radius;
    return new Object3D({
      center: new Point({
        x: Field(Math.round(center.x * SCALE)),
        y: Field(Math.round(center.y * SCALE)),
        z: Field(Math.round(center.z * SCALE)),
      }),
      radius: Field(Math.round(radius * SCALE)),
    });
  }

  static fromPointAndRadius(center: Point, radius: Field) {
    return new Object3D({ center, radius });
  }

  static createFromJSON(objectString: string) {
    const object = JSON.parse(objectString);
    const center = JSON.parse(object.center);
    return new Object3D({
      center: new Point({
        x: Field.fromJSON(center.x),
        y: Field.fromJSON(center.y),
        z: Field.fromJSON(center.z),
      }),
      radius: Field.fromJSON(object.radius),
    });
  }

  toJSON() {
    return JSON.stringify({
      center: this.center.toJSON(),
      radius: this.radius.toJSON(),
    });
  }

  static getHashFromRealWorldCoordinates(
    x: number,
    y: number,
    z: number,
  ): Field {
    return Poseidon.hash([
      Field(Math.round(Math.abs(x) * SCALE)),
      Field(Math.round(Math.abs(y) * SCALE)),
      Field(Math.round(Math.abs(z) * SCALE)),
    ]);
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
export class Plane extends Struct({
  a: Point,
  b: Point,
  c: Point,
  d: Point,
  object: Object3D,
}) {
  static fromPoints(a: Point, b: Point, c: Point, d: Point, object: Object3D) {
    return new Plane({ a, b, c, d, object });
  }

  static createFromJSON(planeString: string) {
    const plane = JSON.parse(planeString);
    const a = JSON.parse(plane.a);
    const b = JSON.parse(plane.b);
    const c = JSON.parse(plane.c);
    const d = JSON.parse(plane.d);
    return new Plane({
      a: new Point({
        x: Field.fromJSON(a.x),
        y: Field.fromJSON(a.y),
        z: Field.fromJSON(a.z),
      }),
      b: new Point({
        x: Field.fromJSON(b.x),
        y: Field.fromJSON(b.y),
        z: Field.fromJSON(b.z),
      }),
      c: new Point({
        x: Field.fromJSON(c.x),
        y: Field.fromJSON(c.y),
        z: Field.fromJSON(c.z),
      }),
      d: new Point({
        x: Field.fromJSON(d.x),
        y: Field.fromJSON(d.y),
        z: Field.fromJSON(d.z),
      }),
      object: Object3D.createFromJSON(plane.object),
    });
  }

  toJSON() {
    return JSON.stringify({
      a: this.a.toJSON(),
      b: this.b.toJSON(),
      c: this.c.toJSON(),
      d: this.d.toJSON(),
      object: this.object.toJSON(),
    });
  }
}

// A box is defined by 2 points 'a' and 'b'.
// 'a' is the min point (bottom, near, left) and 'b' is the max point (top, far, right).
export class Box extends Struct({ a: Point, b: Point, object: Object3D }) {
  // This static method takes two arguments:
  // 1. The vertices of the box as exported from the WebXR experience (an array of 24 elements of type Float32Array)).
  // 2. A translation matrix used to translate the box in such a way that:
  //   - Its sides are aligned to the x, y, and z axes (so that the box can be represented with just two points).
  //   - All vertices have positive coordinates.
  // In addition to this, the method also scales the box by a factor of 1000000 and rounds the coordinates to integers
  // so that they can be represented with Field elements in o1js.
  static fromVerticesTranslationMatricesAndObject(
    vertices: Float32Array,
    matrices: {
      translationToOriginMatrix: Matrix4;
      translationToPositiveCoordsMatrix: Matrix4;
    },
    object: Object3D,
  ) {
    const v = [];
    // Iterate through all vertices and apply the translation matrices to each one.
    for (let i = 0; i < vertices.length; i += 3) {
      const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      vertex.applyMatrix4(matrices.translationToPositiveCoordsMatrix);
      vertex.applyMatrix4(matrices.translationToOriginMatrix);
      v.push(vertex);
    }
    // Find the closest and farthest vertices to the origin. These will be the two points that define the box.
    let closestVertex = new Vector3();
    let farthestVertex = new Vector3();
    let closestDistance = Infinity;
    let farthestDistance = 0;
    // Loop through all vertices to find the closest and farthest
    v.forEach((vertex) => {
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
    return new Box({
      a: new Point({
        x: Field(Math.round(closestVertex.x * SCALE)),
        y: Field(Math.round(closestVertex.y * SCALE)),
        z: Field(Math.round(closestVertex.z * SCALE)),
      }),
      b: new Point({
        x: Field(Math.round(farthestVertex.x * SCALE)),
        y: Field(Math.round(farthestVertex.y * SCALE)),
        z: Field(Math.round(farthestVertex.z * SCALE)),
      }),
      object: object,
    });
  }

  static createFromJSON(boxString: string) {
    const box = JSON.parse(boxString);
    const a = JSON.parse(box.a);
    const b = JSON.parse(box.b);
    return new Box({
      a: new Point({
        x: Field.fromJSON(a.x),
        y: Field.fromJSON(a.y),
        z: Field.fromJSON(a.z),
      }),
      b: new Point({
        x: Field.fromJSON(b.x),
        y: Field.fromJSON(b.y),
        z: Field.fromJSON(b.z),
      }),
      object: Object3D.createFromJSON(box.object),
    });
  }

  toJSON() {
    return JSON.stringify({
      a: this.a.toJSON(),
      b: this.b.toJSON(),
      object: this.object.toJSON(),
    });
  }

  // Check that the object is outside the box.
  assertObjectIsOutside() {
    const minX = this.a.x;
    const minY = this.a.y;
    const minZ = this.a.z;

    const maxX = this.b.x;
    const maxY = this.b.y;
    const maxZ = this.b.z;

    this.object
      .maxX()
      .lessThan(minX)
      .or(this.object.maxY().lessThan(minY))
      .or(this.object.maxZ().lessThan(minZ))
      .or(this.object.minX().greaterThan(maxX))
      .or(this.object.minY().greaterThan(maxY))
      .or(this.object.minZ().greaterThan(maxZ))
      .assertTrue();
  }
}

// A room is defined by a list of planes and boxes.
export class Room extends Struct({ planes: [Plane], boxes: [Box] }) {
  static fromPlanesAndBoxes(planes: Plane[], boxes: Box[]) {
    return new Room({ planes, boxes });
  }

  static createFromJSON(roomString: string) {
    const room = JSON.parse(roomString);
    const newRoom = new Room({
      planes: room.planes.map((plane: any) => {
        return Plane.createFromJSON(plane);
      }),
      boxes: room.boxes.map((box: any) => {
        return Box.createFromJSON(box);
      }),
    });
    return newRoom;
  }

  toJSON() {
    return JSON.stringify({
      planes: this.planes.map((plane: Plane) => {
        return plane.toJSON();
      }),
      boxes: this.boxes.map((box: Box) => {
        return box.toJSON();
      }),
    });
  }

  // Check that the object is inside the room.
  assertObjectIsInside() {}

  // Check that the object does not collide with any of the room's boxes.
  assertNoCollisions() {
    for (const box of this.boxes) {
      box.assertObjectIsOutside();
    }
  }
}
