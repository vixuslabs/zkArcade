import { Field, Struct, Poseidon } from "o1js";
import * as THREE from 'three';

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

  applyMatrix(matrix: Matrix) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    this.x = matrix.n11.mul(x).add(matrix.n12.mul(y)).add(matrix.n13.mul(z)).add(matrix.n14);
    this.y = matrix.n21.mul(x).add(matrix.n22.mul(y)).add(matrix.n23.mul(z)).add(matrix.n24);
    this.z = matrix.n31.mul(x).add(matrix.n32.mul(y)).add(matrix.n33.mul(z)).add(matrix.n34);
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

// A plane is defined by 3 points.
export class Plane extends Struct({
  a: Point,
  b: Point,
  c: Point,
  object: Object3D,
}) {
  static fromPoints(a: Point, b: Point, c: Point, object: Object3D) {
    return new Plane({ a, b, c, object });
  }

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
    
    // Returns a plane with positive coordinates
    return new Plane({
      a: new Point({
        x: Field(Math.round(v[0].x * SCALE)),
        y: Field(Math.round(v[0].y * SCALE)),
        z: Field(Math.round(v[0].z * SCALE)),
      }),
      b: new Point({
        x: Field(Math.round(v[1].x * SCALE)),
        y: Field(Math.round(v[1].y * SCALE)),
        z: Field(Math.round(v[1].z * SCALE)),
      }),
      c: new Point({
        x: Field(Math.round(v[2].x * SCALE)),
        y: Field(Math.round(v[2].y * SCALE)),
        z: Field(Math.round(v[3].z * SCALE)),
      }),
      object: object,
    });
  }

  static createFromJSON(planeString: string) {
    const plane = JSON.parse(planeString);
    const a = JSON.parse(plane.a);
    const b = JSON.parse(plane.b);
    const c = JSON.parse(plane.c);
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
      object: Object3D.createFromJSON(plane.object),
    });
  }

  toJSON() {
    return JSON.stringify({
      a: this.a.toJSON(),
      b: this.b.toJSON(),
      c: this.c.toJSON(),
      object: this.object.toJSON(),
    });
  }

  assertObjectIsOnInnerSide() {
    this.object.center.y.lessThanOrEqual(this.a.y).assertTrue();
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
  assertObjectIsInside() {
    for (const plane of this.planes) {
      plane.assertObjectIsOnInnerSide();
    }
  }

  // Check that the object does not collide with any of the room's boxes.
  assertNoCollisions() {
    for (const box of this.boxes) {
      box.assertObjectIsOutside();
    }
  }
}

export class Matrix extends Struct({
  n11: Field,
  n12: Field,
  n13: Field,
  n14: Field,
  n21: Field,
  n22: Field,
  n23: Field,
  n24: Field,
  n31: Field,
  n32: Field,
  n33: Field,
  n34: Field,
  n41: Field,
  n42: Field,
  n43: Field,
  n44: Field,
}) {
  static fromMatrix4(matrix: Matrix4) {
    return new Matrix({
      n11: Field(Math.round(matrix.elements[0] * SCALE)),
      n12: Field(Math.round(matrix.elements[1] * SCALE)),
      n13: Field(Math.round(matrix.elements[2] * SCALE)),
      n14: Field(Math.round(matrix.elements[3] * SCALE)),
      n21: Field(Math.round(matrix.elements[4] * SCALE)),
      n22: Field(Math.round(matrix.elements[5] * SCALE)),
      n23: Field(Math.round(matrix.elements[6] * SCALE)),
      n24: Field(Math.round(matrix.elements[7] * SCALE)),
      n31: Field(Math.round(matrix.elements[8] * SCALE)),
      n32: Field(Math.round(matrix.elements[9] * SCALE)),
      n33: Field(Math.round(matrix.elements[10] * SCALE)),
      n34: Field(Math.round(matrix.elements[11] * SCALE)),
      n41: Field(Math.round(matrix.elements[12] * SCALE)),
      n42: Field(Math.round(matrix.elements[13] * SCALE)),
      n43: Field(Math.round(matrix.elements[14] * SCALE)),
      n44: Field(Math.round(matrix.elements[15] * SCALE)),
    });
  }

  multiply(matrix: Matrix) {
    return new Matrix({
      n11: this.n11.mul(matrix.n11).add(this.n12.mul(matrix.n21)).add(this.n13.mul(matrix.n31)).add(this.n14.mul(matrix.n41)),
      n12: this.n11.mul(matrix.n12).add(this.n12.mul(matrix.n22)).add(this.n13.mul(matrix.n32)).add(this.n14.mul(matrix.n42)),
      n13: this.n11.mul(matrix.n13).add(this.n12.mul(matrix.n23)).add(this.n13.mul(matrix.n33)).add(this.n14.mul(matrix.n43)),
      n14: this.n11.mul(matrix.n14).add(this.n12.mul(matrix.n24)).add(this.n13.mul(matrix.n34)).add(this.n14.mul(matrix.n44)),
      n21: this.n21.mul(matrix.n11).add(this.n22.mul(matrix.n21)).add(this.n23.mul(matrix.n31)).add(this.n24.mul(matrix.n41)),
      n22: this.n21.mul(matrix.n12).add(this.n22.mul(matrix.n22)).add(this.n23.mul(matrix.n32)).add(this.n24.mul(matrix.n42)),
      n23: this.n21.mul(matrix.n13).add(this.n22.mul(matrix.n23)).add(this.n23.mul(matrix.n33)).add(this.n24.mul(matrix.n43)),
      n24: this.n21.mul(matrix.n14).add(this.n22.mul(matrix.n24)).add(this.n23.mul(matrix.n34)).add(this.n24.mul(matrix.n44)),
      n31: this.n31.mul(matrix.n11).add(this.n32.mul(matrix.n21)).add(this.n33.mul(matrix.n31)).add(this.n34.mul(matrix.n41)),
      n32: this.n31.mul(matrix.n12).add(this.n32.mul(matrix.n22)).add(this.n33.mul(matrix.n32)).add(this.n34.mul(matrix.n42)),
      n33: this.n31.mul(matrix.n13).add(this.n32.mul(matrix.n23)).add(this.n33.mul(matrix.n33)).add(this.n34.mul(matrix.n43)),
      n34: this.n31.mul(matrix.n14).add(this.n32.mul(matrix.n24)).add(this.n33.mul(matrix.n34)).add(this.n34.mul(matrix.n44)),
      n41: this.n41.mul(matrix.n11).add(this.n42.mul(matrix.n21)).add(this.n43.mul(matrix.n31)).add(this.n44.mul(matrix.n41)),
      n42: this.n41.mul(matrix.n12).add(this.n42.mul(matrix.n22)).add(this.n43.mul(matrix.n32)).add(this.n44.mul(matrix.n42)),
      n43: this.n41.mul(matrix.n13).add(this.n42.mul(matrix.n23)).add(this.n43.mul(matrix.n33)).add(this.n44.mul(matrix.n43)),
      n44: this.n41.mul(matrix.n14).add(this.n42.mul(matrix.n24)).add(this.n43.mul(matrix.n34)).add(this.n44.mul(matrix.n44)),
    });
  }

  premultiply(matrix: Matrix) {
    return new Matrix({
      n11: matrix.n11.mul(this.n11).add(matrix.n12.mul(this.n21)).add(matrix.n13.mul(this.n31)).add(matrix.n14.mul(this.n41)),
      n12: matrix.n11.mul(this.n12).add(matrix.n12.mul(this.n22)).add(matrix.n13.mul(this.n32)).add(matrix.n14.mul(this.n42)),
      n13: matrix.n11.mul(this.n13).add(matrix.n12.mul(this.n23)).add(matrix.n13.mul(this.n33)).add(matrix.n14.mul(this.n43)),
      n14: matrix.n11.mul(this.n14).add(matrix.n12.mul(this.n24)).add(matrix.n13.mul(this.n34)).add(matrix.n14.mul(this.n44)),
      n21: matrix.n21.mul(this.n11).add(matrix.n22.mul(this.n21)).add(matrix.n23.mul(this.n31)).add(matrix.n24.mul(this.n41)),
      n22: matrix.n21.mul(this.n12).add(matrix.n22.mul(this.n22)).add(matrix.n23.mul(this.n32)).add(matrix.n24.mul(this.n42)),
      n23: matrix.n21.mul(this.n13).add(matrix.n22.mul(this.n23)).add(matrix.n23.mul(this.n33)).add(matrix.n24.mul(this.n43)),
      n24: matrix.n21.mul(this.n14).add(matrix.n22.mul(this.n24)).add(matrix.n23.mul(this.n34)).add(matrix.n24.mul(this.n44)),
      n31: matrix.n31.mul(this.n11).add(matrix.n32.mul(this.n21)).add(matrix.n33.mul(this.n31)).add(matrix.n34.mul(this.n41)),
      n32: matrix.n31.mul(this.n12).add(matrix.n32.mul(this.n22)).add(matrix.n33.mul(this.n32)).add(matrix.n34.mul(this.n42)),
      n33: matrix.n31.mul(this.n13).add(matrix.n32.mul(this.n23)).add(matrix.n33.mul(this.n33)).add(matrix.n34.mul(this.n43)),
      n34: matrix.n31.mul(this.n14).add(matrix.n32.mul(this.n24)).add(matrix.n33.mul(this.n34)).add(matrix.n34.mul(this.n44)),
      n41: matrix.n41.mul(this.n11).add(matrix.n42.mul(this.n21)).add(matrix.n43.mul(this.n31)).add(matrix.n44.mul(this.n41)),
      n42: matrix.n41.mul(this.n12).add(matrix.n42.mul(this.n22)).add(matrix.n43.mul(this.n32)).add(matrix.n44.mul(this.n42)),
      n43: matrix.n41.mul(this.n13).add(matrix.n42.mul(this.n23)).add(matrix.n43.mul(this.n33)).add(matrix.n44.mul(this.n43)),
      n44: matrix.n41.mul(this.n14).add(matrix.n42.mul(this.n24)).add(matrix.n43.mul(this.n34)).add(matrix.n44.mul(this.n44)),
    });
  }

  multiplyScalar(scalar: Field) {
    return new Matrix({
      n11: this.n11.mul(scalar),
      n12: this.n12.mul(scalar),
      n13: this.n13.mul(scalar),
      n14: this.n14.mul(scalar),
      n21: this.n21.mul(scalar),
      n22: this.n22.mul(scalar),
      n23: this.n23.mul(scalar),
      n24: this.n24.mul(scalar),
      n31: this.n31.mul(scalar),
      n32: this.n32.mul(scalar),
      n33: this.n33.mul(scalar),
      n34: this.n34.mul(scalar),
      n41: this.n41.mul(scalar),
      n42: this.n42.mul(scalar),
      n43: this.n43.mul(scalar),
      n44: this.n44.mul(scalar),
    });
  }

  invert() {
    const n11 = this.n11;
    const n12 = this.n12;
    const n13 = this.n13;
    const n14 = this.n14;
    const n21 = this.n21;
    const n22 = this.n22;
    const n23 = this.n23;
    const n24 = this.n24;
    const n31 = this.n31;
    const n32 = this.n32;
    const n33 = this.n33;
    const n34 = this.n34;
    const n41 = this.n41;
    const n42 = this.n42;
    const n43 = this.n43;
    const n44 = this.n44;

    const n2332 = n23.mul(n32);
    const n2432 = n24.mul(n32);
    const n2431 = n24.mul(n31);
    const n2132 = n21.mul(n32);
    const n2131 = n21.mul(n31);
    const n2231 = n22.mul(n31);
    const n2232 = n22.mul(n32);
    const n2331 = n23.mul(n31);

    const t11 = n2332.mul(n44).sub(n2432.mul(n43)).add(n2431.mul(n42));
    const t12 = n2432.mul(n41).sub(n2332.mul(n41)).sub(n2431.mul(n44));
    const t13 = n2132.mul(n43).sub(n2232.mul(n43)).add(n2231.mul(n42));
    const t14 = n2232.mul(n41).sub(n2132.mul(n41)).sub(n2231.mul(n44));

    const det = t11.mul(n11).add(t12.mul(n12)).add(t13.mul(n13)).add(t14.mul(n14));
    const invDet = det.inv();

    const t21 = n2332.mul(n44).sub(n2432.mul(n43)).add(n2431.mul(n42));
    const t22 = n2331.mul(n44).sub(n2431.mul(n42)).sub(n2131.mul(n44));
    const t23 = n2232.mul(n43).sub(n2332.mul(n42)).sub(n2231.mul(n43));
    const t24 = n2132.mul(n42).sub(n2232.mul(n42)).add(n2131.mul(n43));
    const t31 = n2432.mul(n34).sub(n2332.mul(n34)).sub(n2431.mul(n33));
    const t32 = n2332.mul(n31).sub(n2432.mul(n31)).add(n2431.mul(n34));
    const t33 = n2331.mul(n34).sub(n2431.mul(n34)).sub(n2131.mul(n34));
    const t34 = n2132.mul(n34).sub(n2232.mul(n34)).add(n2231.mul(n33));
    const t41 = n2432.mul(n23).sub(n2332.mul(n24)).sub(n2431.mul(n23));
    const t42 = n2332.mul(n21).sub(n2432.mul(n21)).add(n2431.mul(n24));
    const t43 = n2331.mul(n24).sub(n2431.mul(n24)).sub(n2131.mul(n24));
    const t44 = n2132.mul(n24).sub(n2232.mul(n24)).add(n2231.mul(n23));

    return new Matrix({
      n11: t11.mul(invDet),
      n12: t12.mul(invDet),
      n13: t13.mul(invDet),
      n14: t14.mul(invDet),
      n21: t21.mul(invDet),
      n22: t22.mul(invDet),
      n23: t23.mul(invDet),
      n24: t24.mul(invDet),
      n31: t31.mul(invDet),
      n32: t32.mul(invDet),
      n33: t33.mul(invDet),
      n34: t34.mul(invDet),
      n41: t41.mul(invDet),
      n42: t42.mul(invDet),
      n43: t43.mul(invDet),
      n44: t44.mul(invDet),
    });
  }

}
