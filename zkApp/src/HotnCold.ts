/* eslint @typescript-eslint/no-unsafe-call: 0 */ 
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ 
/* eslint @typescript-eslint/no-unsafe-return: 0 */ 
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */

import { Field, Struct, SmartContract, state, State, method, Poseidon } from 'o1js';
import { Object3D, Room } from './structs';

// The HotnCold contract allows users to commit an object hash and then validate that:
// 1. A given object matches the previously commited hash.
// 2. The object is inside a given room.
// 3. There are no collisions with any of the room's boxes.
export class HotnCold extends SmartContract {

  // The object hash is the hash of the object's center and radius.
  @state(Field) objectHash = State<Field>();

  // Commit the object hash on-chain.
  @method commitObject(object: Object3D) {
    this.objectHash.set(Poseidon.hash([object.center.x, object.center.y, object.center.z, object.radius]));
  }

  // Validate the object against the previously commited object hash and the room.
  @method validateObject(object: Object3D, room: Room) {
    // Get the object hash from on-chain storage.
    const objectHash = this.objectHash.getAndAssertEquals();
    
    // Check that the object hash matches the previously commited object hash.
    objectHash.assertEquals(Poseidon.hash([object.center.x, object.center.y, object.center.z, object.radius]));

    // Check that the object is inside the room.
    room.assertIsInside(object);

    // Check that the object does not collide with any of the room's boxes.
    room.assertNoCollisions(object);
    
  }
}