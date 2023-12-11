import { Field, method, SmartContract, state, State } from "o1js";

import { o1Box, o1Plane, Object3D, Int64o1Box, Int64Object3D } from "./structs.js";

// The HotnCold contract allows users to commit an object hash and then validate that:
// 1. A given object matches the previously commited hash.
// 2. The object is inside a given room.
// 3. There are no collisions with any of the room's boxes.
export class HotnCold extends SmartContract {
  // The object hash is the hash of the object's center and radius.
  @state(Field) objectHash = State<Field>();

  // Commit the object hash on-chain.
  @method commitObject(objectHash: Field) {
    this.objectHash.set(objectHash);
  }

  // Check that an object does not collide with a given box
  // (i.e. the object is outside the box)
  @method validateObjectIsOutsideBox(box: Int64o1Box, object: Int64Object3D) {
    box.assertObjectIsOutside(object);
  }

  // Check that an object is on the right side of a given plane
  // (i.e. the plane's normal vector points towards the object).
  @method validateObjectIsInsideRoom(plane: o1Plane, object: Object3D) {
    plane.assertObjectIsOnInnerSide(object);
  }
}
