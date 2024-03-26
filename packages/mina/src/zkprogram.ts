import { Field, ZkProgram, Struct, SelfProof, Bool, Void } from "o1js";
import { Object3D, Plane, Box } from "./structs";

export class PlaneAndObjectCommitment extends Struct({
  plane: Plane,
  objectCommitment: Field,
}) {
  constructor(value: { plane: Plane; objectCommitment: Field }) {
    super(value);
  }
}

export const ValidatePlanes = ZkProgram({
  name: "validatePlanes",
  publicInput: PlaneAndObjectCommitment, // opponent's plane and commitment to the object's position

  methods: {
    run: {
      privateInputs: [Object3D, SelfProof, Bool], // hidden object

      method(publicInput: PlaneAndObjectCommitment, object: Object3D, previousProof: SelfProof<PlaneAndObjectCommitment, Field>, isRecursive: Bool): Void {
        // Verify the previous proof
        previousProof.verifyIf(isRecursive);
        // Validate that the object commitment matches the hidden object
        publicInput.objectCommitment.assertEquals(
          object.getHash(),
          "object must match the previously commited object",
        );

        // Check that the object is on the inner side of the plane
        publicInput.plane.assertObjectIsOnInnerSide(object);
      },
    },
  },
});

export class ValidatePlanesProof extends ZkProgram.Proof(ValidatePlanes) {}

export class BoxAndObjectCommitment extends Struct({
  box: Box,
  objectCommitment: Field,
}) {
  constructor(value: { box: Box; objectCommitment: Field }) {
    super(value);
  }
}
export const ValidateBoxes = ZkProgram({
  name: "validateBoxes",
  publicInput: BoxAndObjectCommitment, // opponent's box and commitment to the object's position

  methods: {
    run: {
      privateInputs: [Object3D, SelfProof, Bool], // hidden object

      method(publicInput: BoxAndObjectCommitment, object: Object3D, previousProof: SelfProof<BoxAndObjectCommitment, Field>, isRecursive: Bool): Void {
        // Verify the previous proof
        previousProof.verifyIf(isRecursive);
        // Validate that the object commitment matches the hidden object
        publicInput.objectCommitment.assertEquals(
          object.getHash(),
          "object must match the previously commited object",
        );

        // Check that the object does not collide with a any of the boxes
        publicInput.box.assertObjectIsOutside(object);
      },
    },
  },
});

export class ValidateBoxesProof extends ZkProgram.Proof(ValidateBoxes) {}
