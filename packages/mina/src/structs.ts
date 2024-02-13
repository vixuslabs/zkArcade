import { Field, Poseidon, Struct, Provable, Int64 } from "o1js";

export const SCALE = 1000000;

export class Vector3 extends Struct({ x: Int64, y: Int64, z: Int64 }) {
  constructor(value: { x: Int64; y: Int64; z: Int64 }) {
    super(value);
  }

  applyATM(m: AffineTransformationMatrix): Vector3 {
    let x = (m.e0.mul(this.x).add(m.e4.mul(this.y)).add(m.e8.mul(this.z)).add(m.e12.mul(SCALE))).div(SCALE);
    let y = (m.e1.mul(this.x).add(m.e5.mul(this.y)).add(m.e9.mul(this.z)).add(m.e13.mul(SCALE))).div(SCALE);
    let z = (m.e2.mul(this.x).add(m.e6.mul(this.y)).add(m.e10.mul(this.z)).add(m.e14.mul(SCALE))).div(SCALE);
    return new Vector3({ x, y, z });
  }

  crossProduct(v: Vector3): Vector3 {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const bx = v.x;
    const by = v.y;
    const bz = v.z;

    const x = (ay.mul(bz).sub(az.mul(by))).div(SCALE);
    const y = (az.mul(bx).sub(ax.mul(bz))).div(SCALE);
    const z = (ax.mul(by).sub(ay.mul(bx))).div(SCALE);
    return new Vector3({ x, y, z });
  }

  dotProduct(v: Vector3): Int64 {
    return (this.x.mul(v.x).add(this.y.mul(v.y)).add(this.z.mul(v.z)).div(SCALE));
  }

  sub(v: Vector3): Vector3 {
    return new Vector3({
      x: this.x.sub(v.x),
      y: this.y.sub(v.y),
      z: this.z.sub(v.z),
    });
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
      e0: Int64.from(elements[0]!),
      e1: Int64.from(elements[1]!),
      e2: Int64.from(elements[2]!),
      e3: Int64.from(0),
      e4: Int64.from(elements[4]!),
      e5: Int64.from(elements[5]!),
      e6: Int64.from(elements[6]!),
      e7: Int64.from(0),
      e8: Int64.from(elements[8]!),
      e9: Int64.from(elements[9]!),
      e10: Int64.from(elements[10]!),
      e11: Int64.from(0),
      e12: Int64.from(elements[12]!),
      e13: Int64.from(elements[13]!),
      e14: Int64.from(elements[14]!),
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
export class Plane extends Struct({ a: Vector3, b: Vector3, c: Vector3 }) {
  static fromPoints(a: Vector3, b: Vector3, c: Vector3) {
    return new Plane({ a, b, c });
  }

  static fromVertexPointsAndATM(vertexPoints: Vector3[], affineTransformationMatrix: AffineTransformationMatrix) {
    const translatedVertexPoints = vertexPoints.map((p) => {
      return p.applyATM(affineTransformationMatrix);
    });
    return new Plane({
      a: translatedVertexPoints[0]!,
      b: translatedVertexPoints[1]!,
      c: translatedVertexPoints[2]!,
    });
  }

  normalVector() {
    return this.b.sub(this.a).crossProduct(this.c.sub(this.a));
  }

  static createFromJSON(planeString: string) {
    const plane = JSON.parse(planeString);
    const a = JSON.parse(plane.a);
    const b = JSON.parse(plane.b);
    const c = JSON.parse(plane.c);
    return new Plane({
      a: new Vector3({
        x: Int64.fromJSON(a.x),
        y: Int64.fromJSON(a.y),
        z: Int64.fromJSON(a.z),
      }),
      b: new Vector3({
        x: Int64.fromJSON(b.x),
        y: Int64.fromJSON(b.y),
        z: Int64.fromJSON(b.z),
      }),
      c: new Vector3({
        x: Int64.fromJSON(c.x),
        y: Int64.fromJSON(c.y),
        z: Int64.fromJSON(c.z),
      })
    });
  }

  toJSON() {
    return JSON.stringify({
      a: this.a.toJSON(),
      b: this.b.toJSON(),
      c: this.c.toJSON(),
    });
  }

  // Check that the object is on the inner side of the plane.
  assertObjectIsOnInnerSide(object: Object3D) {
    const objectCenter = object.center;
    const planeNormalVector = this.normalVector();
    const planePoint = this.a;
    const planeToCenterVector = objectCenter.sub(planePoint);
    planeNormalVector.dotProduct(planeToCenterVector).isPositive().not().assertTrue("Object must be on the inner side of the plane");
  }
}

export class Box extends Struct({ minX: Int64, maxX: Int64, minY: Int64, maxY: Int64, minZ: Int64, maxZ: Int64 }) {
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

  static createFromJSON(boxString: string) {
    const box = JSON.parse(boxString);
    return new Box({
      minX: Int64.fromJSON(box.minX),
      maxX: Int64.fromJSON(box.maxX),
      minY: Int64.fromJSON(box.minY),
      maxY: Int64.fromJSON(box.maxY),
      minZ: Int64.fromJSON(box.minZ),
      maxZ: Int64.fromJSON(box.maxZ),
    });
  }

  toJSON() {
    return JSON.stringify({
      minX: this.minX.toJSON(),
      maxX: this.maxX.toJSON(),
      minY: this.minY.toJSON(),
      maxY: this.maxY.toJSON(),
      minZ: this.minZ.toJSON(),
      maxZ: this.maxZ.toJSON(),
    });
  }

  assertObjectIsOutside(object: Object3D) {
    object.maxX().sub(this.minX).isPositive().not()
      .or(object.maxY().sub(this.minY).isPositive().not())
      .or(object.maxZ().sub(this.minZ).isPositive().not())
      .or(object.minX().sub(this.maxX).isPositive())
      .or(object.minY().sub(this.maxY).isPositive())
      .or(object.minZ().sub(this.maxZ).isPositive())
      .assertTrue("Object must be outside the box");
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
      planes: room.planes.map((plane: string) => {
        return Plane.createFromJSON(plane);
      }),
      boxes: room.boxes.map((box: string) => {
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
  assertObjectIsInside(object: Object3D) {
    for (const plane of this.planes) {
      plane.assertObjectIsOnInnerSide(object);
    }
  }

  // Check that the object does not collide with any of the room's boxes.
  assertNoCollisions(object: Object3D) {
    for (const box of this.boxes) {
      box.assertObjectIsOutside(object);
    }
  }
}
   
