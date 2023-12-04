import { Field, Struct } from 'o1js';

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