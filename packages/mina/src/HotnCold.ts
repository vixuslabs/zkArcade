import { Field, method, SmartContract, state, State, Poseidon } from "o1js";

import { Room, Object3D } from "./structs.js";

// The HotnCold contract allows users to commit an object hash and then validate that:
// 1. A given object matches the previously commited hash.
// 2. The object is inside a given room.
// 3. There are no collisions with any of the room's boxes.
export class HotnCold extends SmartContract {
  // The object hash is the hash of the object's center and radius.
  @state(Field) objectHash = State<Field>();

  // Commit the object hash on-chain.
  @method commitObject(object: Object3D) {
    this.objectHash.set(Poseidon.hash([ object.center.x.toField(), object.center.y.toField(), object.center.z.toField() ]))
  }

  // Validate that the object matches the previously commited hash and that it is inside the room.
  @method validateRoom(room: Room, object: Object3D) {
    // Get the object hash from the contract state
    const onChainObjectHash = this.objectHash.get();
    this.objectHash.assertEquals(onChainObjectHash);

    // Check that this object's hash matches the previously commited object hash.
    const objectHash = Poseidon.hash([ object.center.x.toField(), object.center.y.toField(), object.center.z.toField() ]);
    objectHash.assertEquals(onChainObjectHash);

    // Check that an object is on the inner side of every plane
    room.planes.forEach((plane) => {
      plane.assertObjectIsOnInnerSide(object);
    });

    // Check that an object does not collide with a any of the boxes
    room.boxes.forEach((box) => {
      box.assertObjectIsOutside(object);
    });
  }
}
