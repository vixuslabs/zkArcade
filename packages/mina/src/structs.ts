import { Field, Poseidon, Struct, Provable } from "o1js";
import type { Matrix4 } from "three";

export const SCALE = 1000000;

export class Vector3 extends Struct({ x: Field, y: Field, z: Field }) {
  constructor(value: { x: Field; y: Field; z: Field }) {
    super(value);
  }

  applyATM(m: AffineTransformationMatrix): Vector3 {
    let x = m.e0.mul(this.x).add(m.e4.mul(this.y)).add(m.e8.mul(this.z)).add(m.e12);
    let y = m.e1.mul(this.x).add(m.e5.mul(this.y)).add(m.e9.mul(this.z)).add(m.e13);
    let z = m.e2.mul(this.x).add(m.e6.mul(this.y)).add(m.e10.mul(this.z)).add(m.e14);
    return new Vector3({ x, y, z });
  }

  toJSON() {
    return JSON.stringify({
      x: this.x.toJSON(),
      y: this.y.toJSON(),
      z: this.z.toJSON(),
    });
  }
}

export class AffineTransformationMatrix extends Struct({
  e0: Field,
  e1: Field,
  e2: Field,
  e3: Field,
  e4: Field,
  e5: Field,
  e6: Field,
  e7: Field,
  e8: Field,
  e9: Field,
  e10: Field,
  e11: Field,
  e12: Field,
  e13: Field,
  e14: Field,
  e15: Field,
}) {
  static fromElements(elements: number[]) {
    if (elements[3] != 0 || elements[7] != 0 || elements[11] != 0 || elements[15] != 1) {
      throw new Error("Not an affine transformation matrix");
    }
    return new AffineTransformationMatrix({
      e0: Field(elements[0]),
      e1: Field(elements[1]),
      e2: Field(elements[2]),
      e3: Field(0),
      e4: Field(elements[4]),
      e5: Field(elements[5]),
      e6: Field(elements[6]),
      e7: Field(0),
      e8: Field(elements[8]),
      e9: Field(elements[9]),
      e10: Field(elements[10]),
      e11: Field(0),
      e12: Field(elements[12]),
      e13: Field(elements[13]),
      e14: Field(elements[14]),
      e15: Field(1),
    });
  }
}


// An object is a sphere.
export class Object3D extends Struct({ center: Vector3, radius: Field }) {
  static fromPointAndRadius(center: Vector3, radius: Field) {
    return new Object3D({ center, radius });
  }

  static createFromJSON(objectString: string) {
    const object = JSON.parse(objectString);
    const center = JSON.parse(object.center);
    return new Object3D({
      center: new Vector3({
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

  getHash(): Field {
    return Poseidon.hash([ this.center.x, this.center.y, this.center.z ]);
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
// export class Plane extends Struct({
//   a: Vector3,
//   b: Vector3,
//   c: Vector3,
//   object: Object3D,
// }) {
//   static fromPoints(a: Vector3, b: Vector3, c: Vector3, object: Object3D) {
//     return new Plane({ a, b, c, object });
//   }

//   static fromVerticesTranslationMatricesAndObject(
//     vertices: Float32Array,
//     matrices: {
//       translationToOriginMatrix: Matrix4;
//       translationToPositiveCoordsMatrix: Matrix4;
//     },
//     object: Object3D,
//   ) {
//     const v = [];
//     // Iterate through all vertices and apply the translation matrices to each one.
//     for (let i = 0; i < vertices.length; i += 3) {
//       const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
//       vertex.applyMatrix4(matrices.translationToPositiveCoordsMatrix);
//       vertex.applyMatrix4(matrices.translationToOriginMatrix);
//       v.push(vertex);
//     }

//     // Returns a plane with positive coordinates
//     return new Plane({
//       a: new Vector3({
//         x: Field(Math.round(v[0].x * SCALE)),
//         y: Field(Math.round(v[0].y * SCALE)),
//         z: Field(Math.round(v[0].z * SCALE)),
//       }),
//       b: new Vector3({
//         x: Field(Math.round(v[1].x * SCALE)),
//         y: Field(Math.round(v[1].y * SCALE)),
//         z: Field(Math.round(v[1].z * SCALE)),
//       }),
//       c: new Vector3({
//         x: Field(Math.round(v[2].x * SCALE)),
//         y: Field(Math.round(v[2].y * SCALE)),
//         z: Field(Math.round(v[3].z * SCALE)),
//       }),
//       object: object,
//     });
//   }

//   static createFromJSON(planeString: string) {
//     const plane = JSON.parse(planeString);
//     const a = JSON.parse(plane.a);
//     const b = JSON.parse(plane.b);
//     const c = JSON.parse(plane.c);
//     return new Plane({
//       a: new Vector3({
//         x: Field.fromJSON(a.x),
//         y: Field.fromJSON(a.y),
//         z: Field.fromJSON(a.z),
//       }),
//       b: new Vector3({
//         x: Field.fromJSON(b.x),
//         y: Field.fromJSON(b.y),
//         z: Field.fromJSON(b.z),
//       }),
//       c: new Vector3({
//         x: Field.fromJSON(c.x),
//         y: Field.fromJSON(c.y),
//         z: Field.fromJSON(c.z),
//       }),
//       object: Object3D.createFromJSON(plane.object),
//     });
//   }

//   toJSON() {
//     return JSON.stringify({
//       a: this.a.toJSON(),
//       b: this.b.toJSON(),
//       c: this.c.toJSON(),
//       object: this.object.toJSON(),
//     });
//   }

//   assertObjectIsOnInnerSide() {
//     this.object.center.y.lessThanOrEqual(this.a.y).assertTrue();
//   }
// }

// A box is defined by 2 points 'a' and 'b'.
// 'a' is the min point (bottom, near, left) and 'b' is the max point (top, far, right).
// export class Box extends Struct({ a: Vector3, b: Vector3, object: Object3D }) {
//   // This static method takes two arguments:
//   // 1. The vertices of the box as exported from the WebXR experience (an array of 24 elements of type Float32Array)).
//   // 2. A translation matrix used to translate the box in such a way that:
//   //   - Its sides are aligned to the x, y, and z axes (so that the box can be represented with just two points).
//   //   - All vertices have positive coordinates.
//   // In addition to this, the method also scales the box by a factor of 1000000 and rounds the coordinates to integers
//   // so that they can be represented with Field elements in o1js.
//   static fromVerticesTranslationMatricesAndObject(
//     vertices: Float32Array,
//     matrices: {
//       translationToOriginMatrix: Matrix4;
//       translationToPositiveCoordsMatrix: Matrix4;
//     },
//     object: Object3D,
//   ) {
//     const v = [];
//     // Iterate through all vertices and apply the translation matrices to each one.
//     for (let i = 0; i < vertices.length; i += 3) {
//       const vertex = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
//       vertex.applyMatrix4(matrices.translationToPositiveCoordsMatrix);
//       vertex.applyMatrix4(matrices.translationToOriginMatrix);
//       v.push(vertex);
//     }
//     // Find the closest and farthest vertices to the origin. These will be the two points that define the box.
//     let closestVertex = new Vector3();
//     let farthestVertex = new Vector3();
//     let closestDistance = Infinity;
//     let farthestDistance = 0;
//     // Loop through all vertices to find the closest and farthest
//     v.forEach((vertex) => {
//       let distance = vertex.length(); // Get the distance from origin
//       // Check if this vertex is closer than the current closest
//       if (distance < closestDistance) {
//         closestDistance = distance;
//         closestVertex = vertex;
//       }
//       // Check if this vertex is farther than the current farthest
//       if (distance > farthestDistance) {
//         farthestDistance = distance;
//         farthestVertex = vertex;
//       }
//     });
//     // Returns a box with the closest and farthest vertices.
//     return new Box({
//       a: new Vector3({
//         x: Field(Math.round(closestVertex.x * SCALE)),
//         y: Field(Math.round(closestVertex.y * SCALE)),
//         z: Field(Math.round(closestVertex.z * SCALE)),
//       }),
//       b: new Vector3({
//         x: Field(Math.round(farthestVertex.x * SCALE)),
//         y: Field(Math.round(farthestVertex.y * SCALE)),
//         z: Field(Math.round(farthestVertex.z * SCALE)),
//       }),
//       object: object,
//     });
//   }

//   static createFromJSON(boxString: string) {
//     const box = JSON.parse(boxString);
//     const a = JSON.parse(box.a);
//     const b = JSON.parse(box.b);
//     return new Box({
//       a: new Vector3({
//         x: Field.fromJSON(a.x),
//         y: Field.fromJSON(a.y),
//         z: Field.fromJSON(a.z),
//       }),
//       b: new Vector3({
//         x: Field.fromJSON(b.x),
//         y: Field.fromJSON(b.y),
//         z: Field.fromJSON(b.z),
//       }),
//       object: Object3D.createFromJSON(box.object),
//     });
//   }

//   toJSON() {
//     return JSON.stringify({
//       a: this.a.toJSON(),
//       b: this.b.toJSON(),
//       object: this.object.toJSON(),
//     });
//   }

//   // Check that the object is outside the box.
//   assertObjectIsOutside() {
//     const minX = this.a.x;
//     const minY = this.a.y;
//     const minZ = this.a.z;

//     const maxX = this.b.x;
//     const maxY = this.b.y;
//     const maxZ = this.b.z;

//     this.object
//       .maxX()
//       .lessThan(minX)
//       .or(this.object.maxY().lessThan(minY))
//       .or(this.object.maxZ().lessThan(minZ))
//       .or(this.object.minX().greaterThan(maxX))
//       .or(this.object.minY().greaterThan(maxY))
//       .or(this.object.minZ().greaterThan(maxZ))
//       .assertTrue();
//   }
// }

export class o1Box extends Struct({ minX: Field, maxX: Field, minY: Field, maxY: Field, minZ: Field, maxZ: Field }) {
  static fromMinMax(minX: Field, maxX: Field, minY: Field, maxY: Field, minZ: Field, maxZ: Field) {
    return new o1Box({
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      minZ: minZ,
      maxZ: maxZ,
    });
  }
  assertObjectIsOutside(object: Object3D) {
    object.maxX().lessThan(this.minX)
      .or(object.maxY().lessThan(this.minY))
      .or(object.maxZ().lessThan(this.minZ))
      .or(object.minX().greaterThan(this.maxX))
      .or(object.minY().greaterThan(this.maxY))
      .or(object.minZ().greaterThan(this.maxZ))
      .assertTrue();
  }
}

export class o1Plane extends Struct({ a: Vector3, b: Vector3, c: Vector3 }) {
  static fromPoints(a: Vector3, b: Vector3, c: Vector3) {
    return new o1Plane({ a, b, c });
  }
  assertObjectIsOnInnerSide(object: Object3D) {
    object.center.y.lessThanOrEqual(this.a.y).assertTrue();
  }
}

// A room is defined by a list of planes and boxes.
// export class Room extends Struct({ planes: [Plane], boxes: [Box] }) {
//   static fromPlanesAndBoxes(planes: Plane[], boxes: Box[]) {
//     return new Room({ planes, boxes });
//   }

//   static createFromJSON(roomString: string) {
//     const room = JSON.parse(roomString);
//     const newRoom = new Room({
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       planes: room.planes.map((plane: any) => {
//         return Plane.createFromJSON(plane);
//       }),
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       boxes: room.boxes.map((box: any) => {
//         return Box.createFromJSON(box);
//       }),
//     });
//     return newRoom;
//   }

//   toJSON() {
//     return JSON.stringify({
//       planes: this.planes.map((plane: Plane) => {
//         return plane.toJSON();
//       }),
//       boxes: this.boxes.map((box: Box) => {
//         return box.toJSON();
//       }),
//     });
//   }

//   // Check that the object is inside the room.
//   assertObjectIsInside() {
//     for (const plane of this.planes) {
//       plane.assertObjectIsOnInnerSide();
//     }
//   }

//   // Check that the object does not collide with any of the room's boxes.
//   assertNoCollisions() {
//     for (const box of this.boxes) {
//       box.assertObjectIsOutside();
//     }
//   }
// }
   
