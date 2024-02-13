import { Field, ZkProgram, Struct } from 'o1js';
import { Room, Object3D } from "./structs.js";

export class RoomAndObjectCommitment extends Struct({ room: Room, objectCommitment: Field}) {
  constructor(value: { room: Room, objectCommitment: Field }) {
    super(value);
  }
}

export const ValidateRoom = ZkProgram({
  name: "validateToom",
  publicInput: RoomAndObjectCommitment, // opponent's room layout and commitment to the object's position

  methods: {
    run: {
      privateInputs: [Object3D], // hidden object

      method(publicInput: RoomAndObjectCommitment, object: Object3D) {
        // Validate that the object commitment matches the hidden object
        publicInput.objectCommitment.assertEquals(object.getHash(), "object must match the previously commited object");
        
        // Check that an object is on the inner side of every plane
        publicInput.room.planes.forEach((plane) => {
          plane.assertObjectIsOnInnerSide(object);
        });

        // Check that an object does not collide with a any of the boxes
        publicInput.room.boxes.forEach((box) => {
          box.assertObjectIsOutside(object);
        });
      },
    },
  }
});