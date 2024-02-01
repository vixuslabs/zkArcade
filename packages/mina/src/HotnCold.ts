import { Field, method, SmartContract, state, State, Poseidon } from "o1js";

import { Room, Object3D } from "./structs.js";

// The HotnCold contract allows users to commit an object hash and then validate that:
// 1. A given object matches the previously commited hash.
// 2. The object is inside a given room.
// 3. There are no collisions with any of the room's boxes.
export class HotnCold extends SmartContract {
  // The object hash is the hash of the object's center and radius.
  @state(Field) player1ObjectHash = State<Field>();
  @state(Field) player2ObjectHash = State<Field>();

  // Commit the object hash on-chain.
  @method commitPlayer1Object(object: Object3D) {
    this.player1ObjectHash.set(
      Poseidon.hash([
        object.center.x.toField(),
        object.center.y.toField(),
        object.center.z.toField(),
      ]),
    );
  }

  @method commitPlayer2Object(object: Object3D) {
    this.player2ObjectHash.set(
      Poseidon.hash([
        object.center.x.toField(),
        object.center.y.toField(),
        object.center.z.toField(),
      ]),
    );
  }

  // Validate that the object matches the previously commited hash and that it is inside the room.
  @method validatePlayer1Room(room: Room, player2Object: Object3D) {
    // Get the object hash from the contract state
    const onChainObjectHash = this.player1ObjectHash.get();
    this.player1ObjectHash.assertEquals(onChainObjectHash);

    // Check that this object's hash matches the previously commited object hash.
    const objectHash = Poseidon.hash([
      player2Object.center.x.toField(),
      player2Object.center.y.toField(),
      player2Object.center.z.toField(),
    ]);
    objectHash.assertEquals(onChainObjectHash);

    // Check that an object is on the inner side of every plane
    room.planes.forEach((plane) => {
      plane.assertObjectIsOnInnerSide(player2Object);
    });

    // Check that an object does not collide with a any of the boxes
    room.boxes.forEach((box) => {
      box.assertObjectIsOutside(player2Object);
    });
  }

  @method validatePlayer2Room(room: Room, player1Object: Object3D) {
    // Get the object hash from the contract state
    const onChainObjectHash = this.player2ObjectHash.get();
    this.player2ObjectHash.assertEquals(onChainObjectHash);

    // Check that this object's hash matches the previously commited object hash.
    const objectHash = Poseidon.hash([
      player1Object.center.x.toField(),
      player1Object.center.y.toField(),
      player1Object.center.z.toField(),
    ]);
    objectHash.assertEquals(onChainObjectHash);

    // Check that an object is on the inner side of every plane
    room.planes.forEach((plane) => {
      plane.assertObjectIsOnInnerSide(player1Object);
    });

    // Check that an object does not collide with a any of the boxes
    room.boxes.forEach((box) => {
      box.assertObjectIsOutside(player1Object);
    });
  }
}
