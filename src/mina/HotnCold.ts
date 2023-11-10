/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Field, SmartContract, state, State, method } from "o1js";
import type { Box, Plane } from "./structs.js";

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
  @method validateObjectIsOutsideBox(box: Box) {
    box.assertObjectIsOutside();
  }

  // Check that an object is on the right side of a given plane
  // (i.e. the plane's normal vector points towards the object).
  @method validateObjectIsInsideRoom(plane: Plane) {
    // TODO: Implement.
  }
}
