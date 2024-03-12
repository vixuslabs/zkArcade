import { Field, Struct, Int64, Bool } from "o1js";

interface Real64Class {
  integer: Int64;
  set: (x: Real64) => Real64;
  toField: () => Field;
  toNumber: () => number;
  inv: () => Real64;
  neg: () => Real64;
  equals: (other: Real64) => Bool;
  magnitudeGreaterThan: (other: Real64) => Bool;
  magnitudeGreaterThanOrEqual: (other: Real64) => Bool;
  magnitudeLessThan: (other: Real64) => Bool;
  magnitudeLessThanOrEqual: (other: Real64) => Bool;
  toString: () => string;
  clone: () => Real64;
  add: (other: Real64) => Real64;
  sub: (other: Real64) => Real64;
  mul: (other: Real64) => Real64;
  div: (other: Real64) => Real64;
  isPositive: () => Bool;
  setInteger: (integer: Int64) => Real64;
}

export class Real64 extends Struct({ integer: Int64 }) implements Real64Class {
  constructor(value: { integer: Int64 }) {
    super(value);
  }

  static SCALE = 10000;

  static from(x: number) {
    return new Real64({ integer: Int64.from(Math.round(x * Real64.SCALE)) });
  }

  set(x: Real64) {
    return new Real64({ integer: x.integer });
  }

  static fromField(x: Field) {
    return new Real64({ integer: Int64.fromField(x) });
  }

  toField() {
    return this.integer.toField();
  }

  toNumber() {
    return parseInt(this.integer.toString()) / Real64.SCALE;
  }

  static get zero() {
    return new Real64({ integer: Int64.zero });
  }

  inv() {
    return new Real64({ integer: Int64.from(Real64.SCALE).mul(Real64.SCALE).div(this.integer) });
  }

  neg() {
    return new Real64({ integer: this.integer.neg() });
  }

  equals(other: Real64) {
    return this.integer.equals(other.integer);
  }

  magnitudeGreaterThan(other: Real64) {
    return this.integer.magnitude.greaterThan(other.integer.magnitude);
  }

  magnitudeGreaterThanOrEqual(other: Real64) {
    return this.integer.magnitude.greaterThanOrEqual(other.integer.magnitude);
  }

  magnitudeLessThan(other: Real64) {
    return this.integer.magnitude.lessThan(other.integer.magnitude);
  }

  magnitudeLessThanOrEqual(other: Real64) {
    return this.integer.magnitude.lessThanOrEqual(other.integer.magnitude);
  }

  toString() {
    return `Real64( ${parseInt(this.integer.toString())/Real64.SCALE} )`;
  }

  clone() {
    return new Real64({ integer: this.integer });
  }

  add(other: Real64) {
    return new Real64({ integer : this.integer.add(other.integer) });
  }

  sub(other: Real64) {
    return new Real64({ integer : this.integer.sub(other.integer) });
  }

  mul(other: Real64) {
    return new Real64({ integer : this.integer.mul(other.integer).div(Real64.SCALE) });
  }

  div(other: Real64) {
    return new Real64({ integer : this.integer.mul(Real64.SCALE).div(other.integer) });
  }

  isPositive() {
    return this.integer.isPositive();
  }

  setInteger(integer: Int64) {
    this.integer = integer;
    return this;
  }

}

interface Vector3Class {
  x: Real64;
  y: Real64;
  z: Real64;
  toString: () => string;
  set: (x: Real64, y: Real64, z: Real64) => Vector3;
  setScalar: (scalar: Real64) => Vector3;
  setX: (x: Real64) => Vector3;
  setY: (y: Real64) => Vector3;
  setZ: (z: Real64) => Vector3;
  setComponent: (index: number, value: Real64) => Vector3;
  getComponent: (index: number) => Real64;
  clone: () => Vector3;
  copy: (v: Vector3) => Vector3;
  add: (v: Vector3) => Vector3;
  addScalar: (s: Real64) => Vector3;
  addVectors: (a: Vector3, b: Vector3) => Vector3;
  addScaledVector: (v: Vector3, s: Real64) => Vector3;
  sub: (v: Vector3) => Vector3;
  subScalar: (s: Real64) => Vector3;
  subVectors: (a: Vector3, b: Vector3) => Vector3;
  multiply: (v: Vector3) => Vector3;
  multiplyScalar: (s: Real64) => Vector3;
  multiplyVectors: (a: Vector3, b: Vector3) => Vector3;
  applyMatrix4: (m: Matrix4) => Vector3;
  setFromMatrixColumn: (m: Matrix4, index: number) => Vector3;
  // setFromMatrix3Column: (m: Matrix3, index: number) => Vector3;
  equals: (v: Vector3) => Bool;
  fromArray: (array: Real64[], offset: number) => Vector3;
  divide: (v: Vector3) => Vector3;
  divideScalar: (s: Real64) => Vector3;
  negate: () => Vector3;
  dot: (v: Vector3) => Real64;
  lengthSq: () => Real64;
  quasiNormalize: () => Vector3;
  lerp: (v: Vector3, alpha: Real64) => Vector3;
  lerpVectors: (v1: Vector3, v2: Vector3, alpha: Real64) => Vector3;
  cross: (v: Vector3) => Vector3;
  crossVectors: (a: Vector3, b: Vector3) => Vector3;
  distanceToSquared: (v: Vector3) => Real64;
}

export class Vector3 extends Struct({ x: Real64, y: Real64, z: Real64 }) implements Vector3Class {
  constructor(value: { x: Real64; y: Real64; z: Real64 }) { 
    super(value);
  }

  static fromNumbers(x: number , y: number, z: number) {
    return new Vector3({ 
      x: Real64.from(x),
      y: Real64.from(y),
      z: Real64.from(z),
    });
  }

  static empty() {
    return new Vector3({
      x: Real64.zero,
      y: Real64.zero,
      z: Real64.zero,
    });
  }

  toString() {
    return `Vector3( ${this.x.toString()}, ${this.y.toString()}, ${this.z.toString()} )`;
  }

  set(x: Real64, y: Real64, z: Real64 ) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setScalar(scalar: Real64) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    return this;
  }

  setX(x: Real64) {
    this.x = x;
    return this;
  }

  setY(y: Real64) {
    this.y = y;
    return this;
  }

  setZ(z: Real64) {
    this.z = z;
    return this;
  }

  setComponent(index: number, value: Real64) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  }

  getComponent(index: number) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + index);
    }
  }

  clone() {
    return new Vector3({ x: this.x, y: this.y, z: this.z });
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v: Vector3) {
    this.x = this.x.add(v.x);
    this.y = this.y.add(v.y);
    this.z = this.z.add(v.z);
    return this;
  }

  addScalar(s: Real64) {
    this.x.add(s);
    this.y.add(s);
    this.z.add(s);
    return this;
  }

  addVectors(a: Vector3, b: Vector3) {
    this.x = a.x.add(b.x);
    this.y = a.y.add(b.y);
    this.z = a.z.add(b.z);
    return this;
  }

  addScaledVector(v: Vector3, s: Real64) {
    this.x.add(v.x.mul(s));
    this.y.add(v.y.mul(s));
    this.z.add(v.z.mul(s));
    return this;
  }

  sub(v: Vector3) {
    this.x = this.x.sub(v.x);
    this.y = this.y.sub(v.y);
    this.z = this.z.sub(v.z);
    return this;
  }

  subScalar(s: Real64) {
    this.x.sub(s);
    this.y.sub(s);
    this.z.sub(s);
    return this;
  }

  subVectors(a: Vector3, b: Vector3) {
    this.x = a.x.sub(b.x);
    this.y = a.y.sub(b.y);
    this.z = a.z.sub(b.z);
    return this;
  }

  multiply(v: Vector3) {
    this.x = this.x.mul(v.x);
    this.y = this.y.mul(v.y);
    this.z = this.z.mul(v.z);
    return this;
  }

  multiplyScalar(s: Real64) {
    this.x = this.x.mul(s);
    this.y = this.y.mul(s);
    this.z = this.z.mul(s);
    return this;
  }

  multiplyVectors(a: Vector3, b: Vector3) {
    this.x = a.x.mul(b.x);
    this.y = a.y.mul(b.y);
    this.z = a.z.mul(b.z);
    return this;
  }

  // TODO: applyEuler

  // TODO: applyAxisAngle

  // TODO: applyMatrix3

  applyMatrix4(m: Matrix4) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    
    const w = m.n14.mul(x) .add(m.n24.mul(y)) .add(m.n34.mul(z)) .add(m.n44);
    const invw = w.inv();

    this.x = m.n11.mul(x).add(m.n21.mul(y)).add(m.n31.mul(z)).add(m.n41).mul(invw);
    this.y = m.n12.mul(x).add(m.n22.mul(y)).add(m.n32.mul(z)).add(m.n42).mul(invw);
    this.z = m.n13.mul(x).add(m.n23.mul(y)).add(m.n33.mul(z)).add(m.n43).mul(invw);

    return this;
  }

  setFromMatrixColumn(m: Matrix4, index: number) {
    return this.fromArray(m.toArray(), index * 4);
  }

  // setFromMatrix3Column(m: Matrix3, index: number) {
  //   return this.fromArray(m.toArray(), index * 3);
  // }

  equals(v: Vector3) {
    return Bool.and(
      this.x.equals(v.x),
      Bool.and(this.y.equals(v.y), this.z.equals(v.z))
    );
  }

  fromArray(array: Real64[], offset: number = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  // transformDirection(m: Matrix4) {
  //   const x = this.x;
  //   const y = this.y;
  //   const z = this.z;

  //   this.x = m.n11.mul(x).add(m.n21.mul(y)).add(m.n31.mul(z)).mul(i64SCALE);
  //   this.y = m.n12.mul(x).add(m.n22.mul(y)).add(m.n32.mul(z)).mul(i64SCALE);
  //   this.z = m.n13.mul(x).add(m.n23.mul(y)).add(m.n33.mul(z)).mul(i64SCALE);

  //   return this.normalize();
  // }

  divide(v: Vector3) {
    this.x = this.x.div(v.x);
    this.y = this.y.div(v.y);
    this.z = this.z.div(v.z);
    return this;
  }

  divideScalar(s: Real64) {
    this.x = this.x.div(s);
    this.y = this.y.div(s);
    this.z = this.z.div(s);
    return this;
  }

  negate() {
    this.x = this.x.neg();
    this.y = this.y.neg();
    this.z = this.z.neg();
    return this;
  }

  dot(v: Vector3) {
    return this.x.mul(v.x).add(this.y.mul(v.y)).add(this.z.mul(v.z));
  }

  lengthSq() {
    return this.x.mul(this.x).add(this.y.mul(this.y)).add(this.z.mul(this.z));
  }

  quasiNormalize() {
    return this.divideScalar(this.lengthSq());
  }

  lerp(v: Vector3, alpha: Real64) {
    this.x = this.x.add(v.x.sub(this.x).mul(alpha));
    this.y = this.y.add(v.y.sub(this.y).mul(alpha));
    this.z = this.z.add(v.z.sub(this.z).mul(alpha));
    return this;
  }

  lerpVectors(v1: Vector3, v2: Vector3, alpha: Real64) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }

  cross(v: Vector3) {
    return this.crossVectors(this, v);
  }

  crossVectors(a: Vector3, b: Vector3) {
    const ax = a.x;
    const ay = a.y;
    const az = a.z;
    const bx = b.x;
    const by = b.y;
    const bz = b.z;

    this.x = ay.mul(bz).sub(az.mul(by));
    this.y = az.mul(bx).sub(ax.mul(bz));
    this.z = ax.mul(by).sub(ay.mul(bx));

    return this;
  }

  distanceToSquared(v: Vector3) {
    const dx = this.x.sub(v.x);
    const dy = this.y.sub(v.y);
    const dz = this.z.sub(v.z);
    return dx.mul(dx).add(dy.mul(dy)).add(dz.mul(dz));
  }
  
}

export class Matrix4 extends Struct({
  n11: Real64,
  n12: Real64,
  n13: Real64,
  n14: Real64,
  n21: Real64,
  n22: Real64,
  n23: Real64,
  n24: Real64,
  n31: Real64,
  n32: Real64,
  n33: Real64,
  n34: Real64,
  n41: Real64,
  n42: Real64,
  n43: Real64,
  n44: Real64,
}) {
  constructor(value: {
    n11: Real64;
    n12: Real64;
    n13: Real64;
    n14: Real64;
    n21: Real64;
    n22: Real64;
    n23: Real64;
    n24: Real64;
    n31: Real64;
    n32: Real64;
    n33: Real64;
    n34: Real64;
    n41: Real64;
    n42: Real64;
    n43: Real64;
    n44: Real64;
  }) {
    super(value);
  }

  set(
    n11: Real64,
    n12: Real64,
    n13: Real64,
    n14: Real64,
    n21: Real64,
    n22: Real64,
    n23: Real64,
    n24: Real64,
    n31: Real64,
    n32: Real64,
    n33: Real64,
    n34: Real64,
    n41: Real64,
    n42: Real64,
    n43: Real64,
    n44: Real64
  ) {
    this.n11 = n11;
    this.n12 = n12;
    this.n13 = n13;
    this.n14 = n14;
    this.n21 = n21;
    this.n22 = n22;
    this.n23 = n23;
    this.n24 = n24;
    this.n31 = n31;
    this.n32 = n32;
    this.n33 = n33;
    this.n34 = n34;
    this.n41 = n41;
    this.n42 = n42;
    this.n43 = n43;
    this.n44 = n44;
    return this;
  }

  identity() {
    this.set(
      Real64.from(1),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(1),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(1),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(1)
    );
    return this;
  }

  elements() {
    return [
      this.n11,
      this.n12,
      this.n13,
      this.n14,
      this.n21,
      this.n22,
      this.n23,
      this.n24,
      this.n31,
      this.n32,
      this.n33,
      this.n34,
      this.n41,
      this.n42,
      this.n43,
      this.n44,
    ];
  }

  clone() {
    return new Matrix4({
      n11: this.n11,
      n12: this.n12,
      n13: this.n13,
      n14: this.n14,
      n21: this.n21,
      n22: this.n22,
      n23: this.n23,
      n24: this.n24,
      n31: this.n31,
      n32: this.n32,
      n33: this.n33,
      n34: this.n34,
      n41: this.n41,
      n42: this.n42,
      n43: this.n43,
      n44: this.n44,
    });
  }

  copy(m: Matrix4) {
    this.n11 = m.n11;
    this.n12 = m.n12;
    this.n13 = m.n13;
    this.n14 = m.n14;
    this.n21 = m.n21;
    this.n22 = m.n22;
    this.n23 = m.n23;
    this.n24 = m.n24;
    this.n31 = m.n31;
    this.n32 = m.n32;
    this.n33 = m.n33;
    this.n34 = m.n34;
    this.n41 = m.n41;
    this.n42 = m.n42;
    this.n43 = m.n43;
    this.n44 = m.n44;
    return this;
  }

  copyPosition(m: Matrix4) {
    this.n41 = m.n41;
    this.n42 = m.n42;
    this.n43 = m.n43;
    return this;
  }

  makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {
    this.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      Real64.from(0),
      xAxis.y,
      yAxis.y,
      zAxis.y,
      Real64.from(0),
      xAxis.z,
      yAxis.z,
      zAxis.z,
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(1)
    );
    return this;
  }

  multiply(m: Matrix4) {
    return this.multiplyMatrices(this, m);
  }

  premultiply(m: Matrix4) {
    return this.multiplyMatrices(m, this);
  }

  multiplyMatrices(a: Matrix4, b: Matrix4) {
    const a11 = a.n11, a12 = a.n12, a13 = a.n13, a14 = a.n14;
    const a21 = a.n21, a22 = a.n22, a23 = a.n23, a24 = a.n24;
    const a31 = a.n31, a32 = a.n32, a33 = a.n33, a34 = a.n34;
    const a41 = a.n41, a42 = a.n42, a43 = a.n43, a44 = a.n44;

    const b11 = b.n11, b12 = b.n12, b13 = b.n13, b14 = b.n14;
    const b21 = b.n21, b22 = b.n22, b23 = b.n23, b24 = b.n24;
    const b31 = b.n31, b32 = b.n32, b33 = b.n33, b34 = b.n34;
    const b41 = b.n41, b42 = b.n42, b43 = b.n43, b44 = b.n44;

    this.n11 = a11.mul(b11).add(a12.mul(b21)).add(a13.mul(b31)).add(a14.mul(b41));
    this.n12 = a11.mul(b12).add(a12.mul(b22)).add(a13.mul(b32)).add(a14.mul(b42));
    this.n13 = a11.mul(b13).add(a12.mul(b23)).add(a13.mul(b33)).add(a14.mul(b43));
    this.n14 = a11.mul(b14).add(a12.mul(b24)).add(a13.mul(b34)).add(a14.mul(b44));

    this.n21 = a21.mul(b11).add(a22.mul(b21)).add(a23.mul(b31)).add(a24.mul(b41));
    this.n22 = a21.mul(b12).add(a22.mul(b22)).add(a23.mul(b32)).add(a24.mul(b42));
    this.n23 = a21.mul(b13).add(a22.mul(b23)).add(a23.mul(b33)).add(a24.mul(b43));
    this.n24 = a21.mul(b14).add(a22.mul(b24)).add(a23.mul(b34)).add(a24.mul(b44));

    this.n31 = a31.mul(b11).add(a32.mul(b21)).add(a33.mul(b31)).add(a34.mul(b41));
    this.n32 = a31.mul(b12).add(a32.mul(b22)).add(a33.mul(b32)).add(a34.mul(b42));
    this.n33 = a31.mul(b13).add(a32.mul(b23)).add(a33.mul(b33)).add(a34.mul(b43));
    this.n34 = a31.mul(b14).add(a32.mul(b24)).add(a33.mul(b34)).add(a34.mul(b44));

    this.n41 = a41.mul(b11).add(a42.mul(b21)).add(a43.mul(b31)).add(a44.mul(b41));
    this.n42 = a41.mul(b12).add(a42.mul(b22)).add(a43.mul(b32)).add(a44.mul(b42));
    this.n43 = a41.mul(b13).add(a42.mul(b23)).add(a43.mul(b33)).add(a44.mul(b43));
    this.n44 = a41.mul(b14).add(a42.mul(b24)).add(a43.mul(b34)).add(a44.mul(b44));

    return this;
  }

  multiplyScalar(s: Real64) {
    this.n11.mul(s);
    this.n12.mul(s);
    this.n13.mul(s);
    this.n14.mul(s);
    this.n21.mul(s);
    this.n22.mul(s);
    this.n23.mul(s);
    this.n24.mul(s);
    this.n31.mul(s);
    this.n32.mul(s);
    this.n33.mul(s);
    this.n34.mul(s);
    this.n41.mul(s);
    this.n42.mul(s);
    this.n43.mul(s);
    this.n44.mul(s);
    return this;
  }

  determinant() {
    const n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14;
    const n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24;
    const n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34;
    const n41 = this.n41, n42 = this.n42, n43 = this.n43, n44 = this.n44;

    return (
      n41.mul(
        n14.mul(n23.mul(n32)
          .sub(n13.mul(n24.mul(n32)))
          .sub(n14.mul(n22.mul(n33)))
          .add(n12.mul(n24.mul(n33)))
          .add(n13.mul(n22.mul(n34)))
          .sub(n12.mul(n23.mul(n34)))
        )
      )
        .add(n42.mul(
          n11.mul(n23.mul(n34)
            .sub(n11.mul(n24.mul(n33)))
            .add(n14.mul(n21.mul(n33)))
            .sub(n13.mul(n21.mul(n34)))
            .add(n13.mul(n24.mul(n31)))
            .sub(n14.mul(n23.mul(n31)))
          )
        ))
        .add(n43.mul(
          n11.mul(n24.mul(n32)
            .sub(n11.mul(n22.mul(n34)))
            .sub(n14.mul(n21.mul(n32)))
            .add(n12.mul(n21.mul(n34)))
            .add(n14.mul(n22.mul(n31)))
            .sub(n12.mul(n24.mul(n31)))
          )
        ))
        .add(n44.mul(
          Real64.zero.sub(n13.mul(n22.mul(n31)))
            .sub(n11.mul(n23.mul(n32)))
            .add(n11.mul(n22.mul(n33)))
            .add(n13.mul(n21.mul(n32)))
            .sub(n12.mul(n21.mul(n33)))
            .add(n12.mul(n23.mul(n31)))
        )
        ))
  }

  transpose() {
    let tmp: Real64;
    tmp = this.n12; this.n12 = this.n21; this.n21 = tmp;
    tmp = this.n13; this.n13 = this.n31; this.n31 = tmp;
    tmp = this.n14; this.n14 = this.n41; this.n41 = tmp;
    tmp = this.n23; this.n23 = this.n32; this.n32 = tmp;
    tmp = this.n24; this.n24 = this.n42; this.n42 = tmp;
    tmp = this.n34; this.n34 = this.n43; this.n43 = tmp;
    return this;
  }

  setPosition(v: Vector3) {
    this.n41 = v.x;
    this.n42 = v.y;
    this.n43 = v.z;
    return this;
  }

  invert() {
    const n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14;
    const n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24;
    const n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34;
    const n41 = this.n41, n42 = this.n42, n43 = this.n43, n44 = this.n44;

    const t11 = n23.mul(n34.mul(n42)).sub(n24.mul(n33.mul(n42))).add(n24.mul(n32.mul(n43))).sub(n22.mul(n34.mul(n43))).sub(n23.mul(n32.mul(n44))).add(n22.mul(n33.mul(n44)));
    const t12 = n14.mul(n33.mul(n42)).sub(n13.mul(n34.mul(n42))).sub(n14.mul(n32.mul(n43))).add(n12.mul(n34.mul(n43))).add(n13.mul(n32.mul(n44))).sub(n12.mul(n33.mul(n44)));
    const t13 = n13.mul(n24.mul(n42)).sub(n14.mul(n23.mul(n42))).add(n14.mul(n22.mul(n43))).sub(n12.mul(n24.mul(n43))).sub(n13.mul(n22.mul(n44))).add(n12.mul(n23.mul(n44)));
    const t14 = n14.mul(n23.mul(n32)).sub(n13.mul(n24.mul(n32))).sub(n14.mul(n22.mul(n33))).add(n12.mul(n24.mul(n33))).add(n13.mul(n22.mul(n34))).sub(n12.mul(n23.mul(n34)));

    const det = n11.mul(t11).add(n21.mul(t12)).add(n31.mul(t13)).add(n41.mul(t14));
    if (det.equals(Real64.zero)) {
      return this.set(
        Real64.zero, Real64.zero, Real64.zero, Real64.zero,
        Real64.zero, Real64.zero, Real64.zero, Real64.zero,
        Real64.zero, Real64.zero, Real64.zero, Real64.zero,
        Real64.zero, Real64.zero, Real64.zero, Real64.zero
      );
    }

    this.n11 = t11.mul(det.inv());
    this.n21 = t12.mul(det.inv());
    this.n31 = t13.mul(det.inv());
    this.n41 = t14.mul(det.inv());

    this.n12 = n24.mul(n33.mul(n41)).sub(n23.mul(n34.mul(n41))).sub(n24.mul(n31.mul(n43))).add(n21.mul(n34.mul(n43))).add(n23.mul(n31.mul(n44))).sub(n21.mul(n33.mul(n44))).mul(det.inv());
    this.n22 = n13.mul(n34.mul(n41)).sub(n14.mul(n33.mul(n41))).add(n14.mul(n31.mul(n43))).sub(n11.mul(n34.mul(n43))).sub(n13.mul(n31.mul(n44))).add(n11.mul(n33.mul(n44))).mul(det.inv());
    this.n32 = n14.mul(n23.mul(n41)).sub(n13.mul(n24.mul(n41))).sub(n14.mul(n21.mul(n43))).add(n11.mul(n24.mul(n43))).add(n13.mul(n21.mul(n44))).sub(n11.mul(n23.mul(n44))).mul(det.inv());
    this.n42 = n13.mul(n24.mul(n31)).sub(n14.mul(n23.mul(n31))).add(n14.mul(n21.mul(n33))).sub(n11.mul(n24.mul(n33))).sub(n13.mul(n21.mul(n34))).add(n11.mul(n23.mul(n34))).mul(det.inv());

    this.n13 = n22.mul(n34.mul(n41)).sub(n24.mul(n32.mul(n41))).add(n24.mul(n31.mul(n42))).sub(n21.mul(n34.mul(n42))).sub(n22.mul(n31.mul(n44))).add(n21.mul(n32.mul(n44))).mul(det.inv());
    this.n23 = n14.mul(n32.mul(n41)).sub(n12.mul(n34.mul(n41))).sub(n14.mul(n31.mul(n42))).add(n11.mul(n34.mul(n42))).add(n12.mul(n31.mul(n44))).sub(n11.mul(n32.mul(n44))).mul(det.inv());
    this.n33 = n12.mul(n24.mul(n41)).sub(n14.mul(n22.mul(n41))).add(n14.mul(n21.mul(n42))).sub(n11.mul(n24.mul(n42))).sub(n12.mul(n21.mul(n44))).add(n11.mul(n22.mul(n44))).mul(det.inv());
    this.n43 = n14.mul(n22.mul(n31)).sub(n12.mul(n24.mul(n31))).sub(n14.mul(n21.mul(n32))).add(n11.mul(n24.mul(n32))).add(n12.mul(n21.mul(n34))).sub(n11.mul(n22.mul(n34))).mul(det.inv());

    this.n14 = n23.mul(n32.mul(n41)).sub(n22.mul(n33.mul(n41))).sub(n23.mul(n31.mul(n42))).add(n21.mul(n33.mul(n42))).add(n22.mul(n31.mul(n43))).sub(n21.mul(n32.mul(n43))).mul(det.inv());
    this.n24 = n12.mul(n33.mul(n41)).sub(n13.mul(n32.mul(n41))).add(n13.mul(n31.mul(n42))).sub(n11.mul(n33.mul(n42))).sub(n12.mul(n31.mul(n43))).add(n11.mul(n32.mul(n43))).mul(det.inv());
    this.n34 = n13.mul(n22.mul(n41)).sub(n12.mul(n23.mul(n41))).sub(n13.mul(n21.mul(n42))).add(n11.mul(n23.mul(n42))).add(n12.mul(n21.mul(n43))).sub(n11.mul(n22.mul(n43))).mul(det.inv());
    this.n44 = n12.mul(n23.mul(n31)).sub(n13.mul(n22.mul(n31))).add(n13.mul(n21.mul(n32))).sub(n11.mul(n23.mul(n32))).sub(n12.mul(n21.mul(n33))).add(n11.mul(n22.mul(n33))).mul(det.inv());

    return this;
  }

  scale(v: Vector3) {
    const x = v.x, y = v.y, z = v.z;
    this.n11.mul(x);
    this.n12.mul(y);
    this.n13.mul(z);
    this.n21.mul(x);
    this.n22.mul(y);
    this.n23.mul(z);
    this.n31.mul(x);
    this.n32.mul(y);
    this.n33.mul(z);
    this.n41.mul(x);
    this.n42.mul(y);
    this.n43.mul(z);
    return this;
  }

  makeTranslation(x: Real64, y: Real64, z: Real64) {
    this.set(
      Real64.from(1),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(1),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(0),
      Real64.from(1),
      Real64.from(0),
      x,
      y,
      z,
      Real64.from(1)
    );
    return this;
  }

  makeScale(x: Real64, y: Real64, z: Real64) {
    this.set(
      x,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      y,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      z,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      Real64.from(1)
    );
    return this;
  }

  makeShear(x: Real64, y: Real64, z: Real64) {
    this.set(
      Real64.from(1),
      y,
      z,
      Real64.zero,
      x,
      Real64.from(1),
      z,
      Real64.zero,
      x,
      y,
      Real64.from(1),
      Real64.zero,
      Real64.zero,
      Real64.zero,
      Real64.zero,
      Real64.from(1)
    );
    return this;
  }

  // TODO: compose
  // TODO: decompose

  equals(m: Matrix4) {
    return (
      m.n11.equals(this.n11)
        .and(m.n12.equals(this.n12))
        .and(m.n13.equals(this.n13))
        .and(m.n14.equals(this.n14))
        .and(m.n21.equals(this.n21))
        .and(m.n22.equals(this.n22))
        .and(m.n23.equals(this.n23))
        .and(m.n24.equals(this.n24))
        .and(m.n31.equals(this.n31))
        .and(m.n32.equals(this.n32))
        .and(m.n33.equals(this.n33))
        .and(m.n34.equals(this.n34))
        .and(m.n41.equals(this.n41))
        .and(m.n42.equals(this.n42))
        .and(m.n43.equals(this.n43))
        .and(m.n44.equals(this.n44))
    );
  }

  static fromElements(array: Real64[]) {
    return new Matrix4({
      n11: array[0],
      n12: array[1],
      n13: array[2],
      n14: array[3],
      n21: array[4],
      n22: array[5],
      n23: array[6],
      n24: array[7],
      n31: array[8],
      n32: array[9],
      n33: array[10],
      n34: array[11],
      n41: array[12],
      n42: array[13],
      n43: array[14],
      n44: array[15]
    });
  }

  toArray() {
    return [
      this.n11,
      this.n12,
      this.n13,
      this.n14,
      this.n21,
      this.n22,
      this.n23,
      this.n24,
      this.n31,
      this.n32,
      this.n33,
      this.n34,
      this.n41,
      this.n42,
      this.n43,
      this.n44,
    ];
  }

}

interface Box3Class {
  min: Vector3;
  max: Vector3;
  set: (min: Vector3, max: Vector3) => Box3;
  setFromArray: (array: number[]) => Box3;
  setFromCenterAndSize: (center: Vector3, size: Vector3) => Box3;
  clone: () => Box3;
  copy: (box: Box3) => Box3;
  isEmpty: () => Bool;
  getCenter: (target: Vector3) => Vector3;
  getSize: (target: Vector3) => Vector3;
  expandByVector: (vector: Vector3) => Box3;
  containsPoint: (point: Vector3) => Bool;
  containsBox: (box: Box3) => Bool;
  intersectsBox: (box: Box3) => Bool;
}

export class Box3 extends Struct({
  min: Vector3,
  max: Vector3
}) implements Box3Class {
  constructor(value: {
    min: Vector3,
    max: Vector3
  }) {
    super(value);
  }

  set(min: Vector3, max: Vector3) {
    this.min = min;
    this.max = max;
    return this;
  }

  setFromArray(array: number[]) {
    const min = Vector3.fromNumbers( array[ 0 ], array[ 1 ], array[ 2 ] );
    const max = Vector3.fromNumbers( array[ 3 ], array[ 4 ], array[ 5 ] );
    this.set( min, max );
    return this;
  }

  setFromCenterAndSize(center: Vector3, size: Vector3) {
    const halfSize = size.clone().multiplyScalar( Real64.from( 0.5 ) );
    this.min = center.clone().sub( halfSize );
    this.max = center.clone().add( halfSize );
    return this;
  }

  clone() {
    return new Box3({
      min: this.min.clone(),
      max: this.max.clone(),
    });
  }

  copy(box: Box3) {
    this.min = box.min.clone();
    this.max = box.max.clone();
    return this;
  }

  isEmpty() {
    return Bool.or(
      this.max.x.magnitudeLessThan( this.min.x ),
      Bool.or(
        this.max.y.magnitudeLessThan( this.min.y ),
        this.max.z.magnitudeLessThan( this.min.z )
      )
    )
  }

  getCenter(target: Vector3) {
    return target.addVectors( this.min, this.max ).multiplyScalar( Real64.from( 0.5 ) );
  }

  getSize(target: Vector3) {
    return target.subVectors( this.max, this.min );
  }

  // TODO: Implement expandByPoint

  expandByVector(vector: Vector3) {
    this.min = this.min.sub(vector);
    this.max = this.max.add(vector);
    return this;
  }

  // TODO: Implement expandByObject
  
  containsPoint(point: Vector3) {
    return Bool.and(
      Bool.and(
        Bool.and(
          point.x.magnitudeGreaterThanOrEqual( this.min.x ),
          point.x.magnitudeLessThanOrEqual( this.max.x )
        ),
        Bool.and(
          point.y.magnitudeGreaterThanOrEqual( this.min.y ),
          point.y.magnitudeLessThanOrEqual( this.max.y )
        )
      ),
      Bool.and(
        point.z.magnitudeGreaterThanOrEqual( this.min.z ),
        point.z.magnitudeLessThanOrEqual( this.max.z )
      )
    );
  }

  containsBox(box: Box3) {
    return Bool.and(
      Bool.and(
        this.min.x.magnitudeLessThanOrEqual( box.min.x ),
        box.max.x.magnitudeLessThanOrEqual( this.max.x )
      ),
      Bool.and(
        Bool.and(
          this.min.y.magnitudeLessThanOrEqual( box.min.y ),
          box.max.y.magnitudeLessThanOrEqual( this.max.y )
        ),
        Bool.and(
          this.min.z.magnitudeLessThanOrEqual( box.min.z ),
          box.max.z.magnitudeLessThanOrEqual( this.max.z )
        )
      )
    );
  }

  intersectsBox(box: Box3) {
    return Bool.and(
      Bool.and(
        Bool.and(
          box.max.x.magnitudeGreaterThanOrEqual( this.min.x ),
          box.min.x.magnitudeLessThanOrEqual( this.max.x )
        ),
        Bool.and(
          box.max.y.magnitudeGreaterThanOrEqual( this.min.y ),
          box.min.y.magnitudeLessThanOrEqual( this.max.y )
        )
      ),
      Bool.and(
        box.max.z.magnitudeGreaterThanOrEqual( this.min.z ),
        box.min.z.magnitudeLessThanOrEqual( this.max.z )
      )
    );
  }
  
}

interface PlaneClass {
  normal: Vector3;
  constant: Real64;
  set: (normal: Vector3, constant: Real64) => Plane;
  setComponents: (x: Real64, y: Real64, z: Real64, w: Real64) => Plane;
  setFromNormalAndCoplanarPoint: (normal: Vector3, point: Vector3) => Plane;
  setFromCoplanarPoints: (a: Vector3, b: Vector3, c: Vector3) => Plane;
  copy: (plane: Plane) => Plane;
  negate: () => Plane;
  distanceToPoint: (point: Vector3) => Real64;
  // distanceToSphere: (sphere: Sphere) => Real64;
  projectPoint: (point: Vector3, target: Vector3) => Vector3;
  intersectLine: (start: Vector3, end: Vector3) => Vector3;
  intersectsLine: (start: Vector3, end: Vector3) => Bool;
  // intersectsSphere: (sphere: Sphere) => Bool;
  coplanarPoint: () => Vector3;
  translate: (offset: Vector3) => Plane;
  equals: (plane: Plane) => Bool;
  clone: () => Plane;
}

export class Plane extends Struct({
  normal: Vector3,
  constant: Real64,
}) implements PlaneClass {
  constructor(value: {
    normal: Vector3,
    constant: Real64,
  }) {
    super(value);
  }

  set(normal: Vector3, constant: Real64) {
    this.normal = normal;
    this.constant = constant;
    return this;
  }

  toArray() {
    return [this.normal.x, this.normal.y, this.normal.z, this.constant];
  }

  setComponents(x: Real64, y: Real64, z: Real64, w: Real64) {
    this.normal.set(x, y, z);
    this.constant.set(w);
    return this;
  }

  setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3) {
    this.normal = normal;
    this.constant = normal.dot(point);
    return this;
  }

  setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3) {
    const v1 = Vector3.empty();
    const v2 = Vector3.empty();
    const normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).quasiNormalize();
    this.setFromNormalAndCoplanarPoint(normal, a);
    return this;
  }

  copy(plane: Plane) {
    this.normal = plane.normal.clone();
    this.constant = plane.constant.clone();
    return this;
  }

  negate() {
    this.constant = this.constant.neg();
    this.normal = this.normal.negate();
    return this;
  }

  distanceToPoint(point: Vector3) {
    return this.normal.dot(point).add(this.constant);
  }

  // distanceToSphere(sphere: Sphere) {
  //   return this.distanceToPoint(sphere.center).sub(sphere.radius);
  // }

  projectPoint(point: Vector3, target: Vector3) {
    return target.copy(this.normal).multiplyScalar(this.distanceToPoint(point).neg()).add(point);
  }

  intersectLine(start: Vector3, end: Vector3) {
    const startDistance = this.distanceToPoint(start);
    const endDistance = this.distanceToPoint(end);
    const t = startDistance.div(startDistance.sub(endDistance));
    return start.clone().add(end.clone().sub(start).multiplyScalar(t));
  }

  intersectsLine(start: Vector3, end: Vector3) {
    const startSign = this.distanceToPoint(start).isPositive();
    const endSign = this.distanceToPoint(end).isPositive();
    return startSign.equals(endSign).not();
  }

  // TODO: intersectsBox

  // intersectsSphere(sphere: Sphere) {
  //   return this.distanceToSphere(sphere).isPositive().not();
  // }

  coplanarPoint() {
    return this.normal.clone().multiplyScalar(this.constant.neg());
  }

  // TODO: applyMatrix4

  translate(offset: Vector3) {
    this.constant = this.constant.sub(this.normal.dot(offset));
    return this;
  }

  equals(plane: Plane) {
    return Bool.and(this.normal.equals(plane.normal), this.constant.equals(plane.constant));
  }

  clone() {
    return new Plane({
      normal: this.normal.clone(),
      constant: this.constant.clone(),
    });
  }

}