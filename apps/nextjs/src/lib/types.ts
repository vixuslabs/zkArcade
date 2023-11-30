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
import type { Matrix4 } from "three";
import type { PresenceChannel } from "pusher-js";

/**
 * XR-related types and interfaces
 */

export interface GamepadButtonState {
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

export interface PointerState {
  z: number;
  state: TriggerState;
  heldObject: { uuid: string; name?: string } | null;
  controllerState?: RightControllerState | LeftControllerState | null;
};

export interface Pointers {
  left: PointerState;
  right: PointerState;
};

export interface ObjectHeldCheck {
  objectHeldByPointer: boolean;
  handness: "left" | "right" | undefined;
};

export interface ControllerStateContextValue {
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

export type AppUser = {
  id: string;
  username: string;
  firstName: string | null;
  image_url: string | null;
} | null;

export interface RoomCaptureProps {
  user: AppUser;
}

export interface MyMeshInfo {
  mesh: Mesh;
  name: string;
}

export interface MyPlaneInfo {
  plane: Mesh;
  name: string;
}

export interface MeshesAndPlanesContextValue {
  setMyMeshes: React.Dispatch<React.SetStateAction<MyMeshInfo[]>>;
  setMyPlanes: React.Dispatch<React.SetStateAction<MyPlaneInfo[]>>;
}

export interface GameState {
  isGameStarted: boolean;
  isGameEnded: boolean;
  me: {
    isHiding: boolean;
    isSeeking: boolean;
    isIdle: boolean;
    myObjectPosition?: Vector3 | null;
  };
  opponent: {
    info: Player | null;
    isConnected: boolean;
    isIdle: boolean;
    isHiding: boolean;
    isSeeking: boolean;
    room?: {
      meshes: MeshInfo[];
      planes: PlaneInfo[];
    };
  };
  oppObject?: {
    objectPosition: Vector3 | null;
    objectMatrix: Matrix4 | null;
    objectProximity: number | null;
    objectFound: boolean;
    objectSet: boolean;
  };
}

export interface LobbyContextValues {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  starting: boolean;
  setStarting: React.Dispatch<React.SetStateAction<boolean>>;
  channel: PresenceChannel | null;
  isMinaOn: boolean;
  setIsMinaOn: React.Dispatch<React.SetStateAction<boolean>>;
  setXrStarted: React.Dispatch<React.SetStateAction<boolean>>;
  me: Player | null;
  gameState: GameState | undefined;
  setGameState: React.Dispatch<React.SetStateAction<GameState | undefined>>;
  started: React.MutableRefObject<boolean>;
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

export interface GeometryData {
  position: {
    itemSize: number;
    array: number[];
    normalized?: boolean;
  };
  index: {
    itemSize: number;
    array: number[];
    normalized?: boolean;
  } | null; // Use null if there is no index
}

export interface MeshInfo {
  geometry: GeometryData;
  matrix: {
    elements: number[];
  };
  worldMatrix: {
    elements: number[];
  };
  name: string;
}

export interface PlaneInfo {
  geometry: GeometryData;
  matrix: {
    elements: number[];
  };
  worldMatrix: {
    elements: number[];
  };
  name: string;
}

export interface Player {
  username: string;
  firstName: string | null;
  imageUrl: string | null;
  ready: boolean;
  host: boolean;
  id?: string;
  publicKey?: string;
  privateKey?: string;
  playerPosition?: Vector3;
  playerProximity?: number;
  objectPosition?: Vector3;
  objectMatrix?: Matrix4;
  roomLayout?: {
    meshes: MeshInfo[];
    planes: PlaneInfo[];
  };
}

/**
 * Friends
 */

export interface FriendInfo {
  username: string;
  firstName: string | null;
  imageUrl: string;
  id: string;
}

export interface Invite {
  sender: FriendInfo;
  gameId: string;
}

export interface PendingFriendRequests {
  requestId: number;
  imageUrl: string;
  username: string;
  firstName: string | null;
};

export type NotificationType = "PendingFriendRequest" | "GameInvite";

export interface BaseNotification {
  type: NotificationType;
}

export interface TaggedPendingFriendRequest
  extends PendingFriendRequests,
    BaseNotification {
  type: "PendingFriendRequest";
}

export interface TaggedGameInvite extends Invite, BaseNotification {
  type: "GameInvite";
}

export type Notification = TaggedPendingFriendRequest | TaggedGameInvite;

export interface PusherClientContextValues {
  activeFriends: FriendInfo[];
  pendingFriendRequests: PendingFriendRequests[];
  gameInvites: Invite[];
  allNotifications: Notification[];
}

export type ActiveDashboardTab =
  | "home"
  | "friends"
  | "leaderboard"
  | "settings";

export interface ActiveDashboardTabContext {
  activeTab: ActiveDashboardTab;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveDashboardTab>>;
}
