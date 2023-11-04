import type { ButtonState } from "@coconut-xr/natuerlich/react";
import type { Quaternion, Vector3 } from "three";

interface GamepadBase {
  axes: readonly number[];
  buttons: Record<string, ButtonState>;

  //   {
  //     [key: string]: "pressed" | "touched" | "default";
  //   };
}

interface LeftGamepad extends GamepadBase {
  buttons: {
    "x-button": ButtonState;
    "y-button": ButtonState;
  };
}

interface RightGamepad extends GamepadBase {
  buttons: {
    "a-button": ButtonState;
    "b-button": ButtonState;
  };
}

interface ControllerState {
  visible: boolean;
  position: Vector3;
  orientation: Quaternion;
  gamepad: LeftGamepad | RightGamepad;
}

export interface LeftControllerState extends ControllerState {
  gamepad: LeftGamepad;
}

export interface RightControllerState extends ControllerState {
  gamepad: RightGamepad;
}

export type TriggerState = ButtonState | "NOT_SET";

export type PointerState = {
  z: number;
  state: TriggerState;
  heldObject: { uuid: string; name?: string } | null;
  controllerState?: ControllerState | null;
};

export type Pointers = {
  left: PointerState;
  right: PointerState;
};

export type CheckIfObjectHeldByPointerReturn = {
  objectHeldByPointer: boolean;
  handness: "left" | "right" | undefined;
};

export type ControllerStateContextValue = {
  pointers: Pointers;
  setLeftPointer: (data: PointerState) => void;
  setRightPointer: (data: PointerState) => void;
};

export type ButtonsType = "a-button" | "b-button" | "x-button" | "y-button";
