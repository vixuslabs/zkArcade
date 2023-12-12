import { Field, Poseidon, Struct, Provable, Int64 } from "o1js";

export const SCALE = 1000000;

export class Vector3 extends Struct({ x: Int64, y: Int64, z: Int64 }) {
  constructor(value: { x: Int64; y: Int64; z: Int64 }) {
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
  e0: Int64,
  e1: Int64,
  e2: Int64,
  e3: Int64,
  e4: Int64,
  e5: Int64,
  e6: Int64,
  e7: Int64,
  e8: Int64,
  e9: Int64,
  e10: Int64,
  e11: Int64,
  e12: Int64,
  e13: Int64,
  e14: Int64,
  e15: Int64,
}) {
  static fromElements(elements: number[]) {
    if (elements[3] != 0 || elements[7] != 0 || elements[11] != 0 || elements[15] != 1) {
      throw new Error("Not an affine transformation matrix");
    }
    return new AffineTransformationMatrix({
      e0: Int64.from(elements[0]),
      e1: Int64.from(elements[1]),
      e2: Int64.from(elements[2]),
      e3: Int64.from(0),
      e4: Int64.from(elements[4]),
      e5: Int64.from(elements[5]),
      e6: Int64.from(elements[6]),
      e7: Int64.from(0),
      e8: Int64.from(elements[8]),
      e9: Int64.from(elements[9]),
      e10: Int64.from(elements[10]),
      e11: Int64.from(0),
      e12: Int64.from(elements[12]),
      e13: Int64.from(elements[13]),
      e14: Int64.from(elements[14]),
      e15: Int64.from(1),
    });
  }
}

// An object is a sphere.
export class Object3D extends Struct({ center: Vector3, radius: Int64 }) {
  static fromPointAndRadius(center: Vector3, radius: Int64) {
    return new Object3D({ center, radius });
  }

  static createFromJSON(objectString: string) {
    const object = JSON.parse(objectString);
    const center = JSON.parse(object.center);
    return new Object3D({
      center: new Vector3({
        x: Int64.fromJSON(center.x),
        y: Int64.fromJSON(center.y),
        z: Int64.fromJSON(center.z),
      }),
      radius: Int64.fromJSON(object.radius),
    });
  }

  toJSON() {
    return JSON.stringify({
      center: this.center.toJSON(),
      radius: this.radius.toJSON(),
    });
  }

  getHash(): Field {
    return Poseidon.hash([ this.center.x.toField(), this.center.y.toField(), this.center.z.toField() ]);
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

export class Box extends Struct({ minX: Int64, maxX: Int64, minY: Int64, maxY: Int64, minZ: Int64, maxZ: Int64 }) {
  static fromMinMax(minX: Int64, maxX: Int64, minY: Int64, maxY: Int64, minZ: Int64, maxZ: Int64) {
    return new Box({
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      minZ: minZ,
      maxZ: maxZ,
    });
  }

  static fromVertexPointsAndATM(vertexPoints: Vector3[], affineTransformationMatrix: AffineTransformationMatrix) {
    const translatedVertexPoints = vertexPoints.map((p) => {
      return p.applyATM(affineTransformationMatrix);
    });
    let minX = Int64.zero;
    let maxX = Int64.zero;
    let minY = Int64.zero;
    let maxY = Int64.zero;
    let minZ = Int64.zero;
    let maxZ = Int64.zero;
    for (const p of translatedVertexPoints) {
      minX = Provable.if(p.x.sub(minX).isPositive(), minX , p.x);
      maxX = Provable.if(p.x.sub(maxX).isPositive(), p.x , maxX);
      minY = Provable.if(p.y.sub(minY).isPositive(), minY , p.y);
      maxY = Provable.if(p.y.sub(maxY).isPositive(), p.y , maxY);
      minZ = Provable.if(p.z.sub(minZ).isPositive(), minZ , p.z);
      maxZ = Provable.if(p.z.sub(maxZ).isPositive(), p.z , maxZ);
    }
    return new Box({
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      minZ: minZ,
      maxZ: maxZ,
    })
  }

  assertObjectIsOutside(object: Object3D) {
    object.maxX().sub(this.minX).isPositive().not()
      .or(object.maxY().sub(this.minY).isPositive().not())
      .or(object.maxZ().sub(this.minZ).isPositive().not())
      .or(object.minX().sub(this.maxX).isPositive())
      .or(object.minY().sub(this.maxY).isPositive())
      .or(object.minZ().sub(this.maxZ).isPositive())
      .assertTrue();
  }
}

export class Plane extends Struct({ a: Vector3, b: Vector3, c: Vector3 }) {
  static fromPoints(a: Vector3, b: Vector3, c: Vector3) {
    return new Plane({ a, b, c });
  }
  // assertObjectIsOnInnerSide(object: Object3D) {
  //   object.center.y.lessThanOrEqual(this.a.y).assertTrue();
  // }
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
   
