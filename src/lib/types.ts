import type { ButtonState } from "@coconut-xr/natuerlich/react";
import type {
  Quaternion,
  Vector3,
  Mesh,
  BufferGeometry,
  Material,
  NormalBufferAttributes,
  Object3DEventMap,
} from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";

/**
 * XR-related types and interfaces
 */

export type GamepadButtonState = {
  pressed: boolean;
  touched: boolean;
  value: number;
};

interface GamepadBase {
  axes: readonly number[];
  buttons: Record<string, ButtonState>;
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

export type useTrackControllersReturn = [
  LeftControllerState | null,
  RightControllerState | null,
];

export type TriggerState = ButtonState | "NOT_SET";

export type PointerState = {
  z: number;
  state: TriggerState;
  heldObject: { uuid: string; name?: string } | null;
  controllerState?: RightControllerState | LeftControllerState | null;
};

export type Pointers = {
  left: PointerState;
  right: PointerState;
};

export type ObjectHeldCheck = {
  objectHeldByPointer: boolean;
  handness: "left" | "right" | undefined;
};

export type ControllerStateContextValue = {
  pointers: Pointers;
  setLeftPointer: (data: PointerState) => void;
  setRightPointer: (data: PointerState) => void;
};

export type ButtonsType = "a-button" | "b-button" | "x-button" | "y-button";

export interface RigidAndMeshRefs {
  rigidRef: React.RefObject<RapierRigidBody>;
  ref: React.RefObject<
    Mesh<
      BufferGeometry<NormalBufferAttributes>,
      Material | Material[],
      Object3DEventMap
    >
  >;
}

export interface GrabProps {
  id: string;
  children: React.ReactNode;
  handleGrab: (e: ThreeEvent<PointerEvent>) => void;
  handleRelease: (e: ThreeEvent<PointerEvent>, velocity?: Vector3) => void;
  isDeletable?: boolean;
  isAnchorable?: boolean;
}

/**
 * Online Components
 */
export interface Player {
  username: string;
  firstName: string | null;
  imageUrl: string | null;
  ready: boolean;
  host: boolean;
  id?: string;
  publicKey?: string;
  privateKey?: string;
}
