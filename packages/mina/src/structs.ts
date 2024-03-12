import { Field, Poseidon, Struct, Provable } from "o1js";

import { Vector3, Real64, Matrix4, Box3 } from './zk3d';

// An object is a sphere.
export class Object3D extends Struct({ center: Vector3, radius: Real64 }) {
  constructor(value: { radius: Real64; center: Vector3 }) {
    super(value);
  }

  static fromPointAndRadius(center: Vector3, radius: Real64) {
    return new Object3D({ center, radius });
  }

  getHash(): Field {
    return Poseidon.hash([this.center.x.toField(), this.center.y.toField(), this.center.z.toField()]);
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
  constructor(value: { a: Vector3; b: Vector3; c: Vector3 }) {
    super(value);
  }

  static fromPoints(a: Vector3, b: Vector3, c: Vector3) {
    return new Plane({ a, b, c });
  }

  static fromVertexPointsAndMatrix(vertexPoints: Vector3[], matrix: Matrix4) {
    const translatedVertexPoints = vertexPoints.map((p) => {
      return p.applyMatrix4(matrix);
    });
    return new Plane({
      a: translatedVertexPoints[0]!,
      b: translatedVertexPoints[1]!,
      c: translatedVertexPoints[2]!,
    });
  }

  normalVector() {
    return this.b.sub(this.a).cross(this.c.sub(this.a));
  }


  // Check that the object is on the inner side of the plane.
  assertObjectIsOnInnerSide(object: Object3D) {
    const objectCenter = object.center.clone();
    const planeNormalVector = this.normalVector();
    const planePoint = this.a;
    const planeToCenterVector = objectCenter.sub(planePoint);
    planeNormalVector.dot(planeToCenterVector).isPositive().not().assertTrue("Object must be on the inner side of the plane");
  }
}

export class Box extends Box3 {
  constructor(value: { minX: Real64, maxX: Real64, minY: Real64, maxY: Real64, minZ: Real64, maxZ: Real64 }) {
    const newValue = { min: new Vector3({ x: value.minX, y: value.minY, z: value.minZ }), max: new Vector3({ x: value.maxX, y: value.maxY, z: value.maxZ }) }
    super(newValue);
  }

  static fromVertexPointsAndMatrix(vertexPoints: Vector3[], matrix: Matrix4) {
    const translatedVertexPoints = vertexPoints.map((p) => {
      return p.applyMatrix4(matrix);
    });
    let minX = Real64.zero;
    let maxX = Real64.zero;
    let minY = Real64.zero;
    let maxY = Real64.zero;
    let minZ = Real64.zero;
    let maxZ = Real64.zero;


    for (const p of translatedVertexPoints) {
      minX.setInteger(Provable.if(p.x.sub(minX).isPositive(), Real64, minX, p.x).integer)
      maxX.setInteger(Provable.if(p.x.sub(maxX).isPositive(), Real64, p.x, maxX).integer);
      minY.setInteger(Provable.if(p.y.sub(minY).isPositive(), Real64, minY, p.y).integer);
      maxY.setInteger(Provable.if(p.y.sub(maxY).isPositive(), Real64, p.y, maxY).integer);
      minZ.setInteger(Provable.if(p.z.sub(minZ).isPositive(), Real64, minZ, p.z).integer);
      maxZ.setInteger(Provable.if(p.z.sub(maxZ).isPositive(), Real64, p.z, maxZ).integer);
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
    object.maxX().sub(this.min.x).isPositive().not()
      .or(object.maxY().sub(this.min.y).isPositive().not())
      .or(object.maxZ().sub(this.min.z).isPositive().not())
      .or(object.minX().sub(this.max.x).isPositive())
      .or(object.minY().sub(this.max.y).isPositive())
      .or(object.minZ().sub(this.max.z).isPositive())
      .assertTrue("Object must be outside the box");
  }
}

// A room is defined by a list of planes and boxes.
export class Room extends Struct({ planes: [Plane], boxes: [Box] }) {
  constructor(value: { planes: Plane[]; boxes: Box[] }) {
    super(value);
  }

  static fromPlanesAndBoxes(planes: Plane[], boxes: Box[]) {
    return new Room({ planes, boxes });
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
