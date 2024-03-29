import type {
  CommitRoomAndObjectProps,
  CommitRoomAndObjectReturn,
} from "@/components/providers/MinaProvider";
import type { ButtonState } from "@coconut-xr/natuerlich/react";
import type { ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import type { PresenceChannel } from "pusher-js";
import type {
  BufferGeometry,
  Material,
  Matrix4,
  Mesh,
  NormalBufferAttributes,
  Object3DEventMap,
  Quaternion,
  Vector3,
} from "three";

import type { RoomAndObjectCommitment } from "@zkarcade/mina";
import type { Object3D, Room } from "@zkarcade/mina/src/structs";

/**
 * UI Types
 */
export interface CarouselGameInfo {
  name: GameNames;
  mainDescription: string;
  zkDescription: string;
  imageUrl: string;
}

// XR-related types and interfaces
export interface GamepadButtonState {
  pressed: boolean;
  touched: boolean;
  value: number;
}

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
}

export interface Pointers {
  left: PointerState;
  right: PointerState;
}

export interface ObjectHeldCheck {
  objectHeldByPointer: boolean;
  handness: "left" | "right" | undefined;
}

export interface ControllerStateContextValue {
  pointers: Pointers;
  setLeftPointer: (data: PointerState) => void;
  setRightPointer: (data: PointerState) => void;
}

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

// App-related types and interfaces
export type AppUser = {
  id: string;
  username: string;
  image_url: string | null;
} | null;

export interface SandboxProps {
  username?: string;
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

export interface PusherGeometryData {
  position: {
    itemSize: number;
    array: Record<number, number>;
    normalized?: boolean;
  };
  index: {
    itemSize: number;
    array: Record<number, number>;
    normalized?: boolean;
  } | null; // Use null if there is no index
}

// Online Components
export interface GeometryData {
  position: {
    itemSize: number;
    // array: number[];
    array: THREE.TypedArray;
    normalized?: boolean;
  };
  index: {
    itemSize: number;
    // array: number[];
    array: THREE.TypedArray;
    normalized?: boolean;
  } | null; // Use null if there is no index
}

export interface MeshPusherData {
  geometry: PusherGeometryData;
  matrix: {
    elements: number[];
  };
  name: string;
}

export interface PlanePusherData {
  geometry: PusherGeometryData;
  matrix: {
    elements: number[];
  };
  name: string;
}

export interface MeshInfo {
  geometry: GeometryData;
  matrix: {
    elements: number[];
  };
  worldMatrix?: {
    elements: number[];
  };
  name: string;
}

export interface PlaneInfo {
  geometry: GeometryData;
  matrix: {
    elements: number[];
  };
  worldMatrix?: {
    elements: number[];
  };
  name: string;
}

// Game Types
export enum GameType {
  HotNCold = "Hot 'n Cold",
  zkArcade = "zkArcade",
  zkTicTacToe = "zkTicTacToe",
  Sandbox = "Sandbox",
}

export type GameNames =
  | "Hot 'n Cold"
  | "zkBattleship"
  | "zkTicTacToe"
  | "Sandbox";

export enum GeneralGameStatus {
  LOBBY = "LOBBY",
  PREGAME = "PREGAME",
}

export enum HotnColdGameStatus {
  LOBBY = "lobby",
  PREGAME = "pregame",
  IDLE = "idle",
  LOADINGROOMS = "loadingRooms",
  BOTHHIDING = "bothHiding",
  ONEHIDING = "oneHiding",
  SEEKING = "seeking",
  GAMEOVER = "gameover",
}

export interface HotnColdMinaCallbacks {
  initializeRoom: ({
    boxes,
    planes,
  }: {
    boxes: MeshInfo[];
    planes: PlaneInfo[];
  }) => Promise<Room>;
  commitRoomAndObject: ({
    objectRadius,
    objectPosition,
  }: CommitRoomAndObjectProps) => Promise<CommitRoomAndObjectReturn>;
  runValidateRoom: (
    roomAndObjectCommitment: RoomAndObjectCommitment,
    object: Object3D,
  ) => Promise<boolean>;
}

export interface HotnColdGameState {
  gameEventsInitialized: boolean;
  startRoomSync: boolean;
  status: HotnColdGameStatus;
  minaCallbacks: HotnColdMinaCallbacks | null;
  runningMinaCallback: boolean;
  room: Room | null;
  me: HotnColdPlayer | null;
  opponent: HotnColdPlayer | null;
}

export type HotnColdEvents =
  | "client-status-change"
  | "client-in-game"
  // | "client-roomLayout-complete"
  | "client-roomLayout-planes"
  | "client-roomLayout-meshes"
  | "client-hiding"
  | "client-done-hiding"
  | "client-seeking"
  | "client-set-object"
  | "client-found-object";

export type HotnColdEventCallbacks =
  | (() => void)
  | (({ status }: { status: HotnColdGameStatus }) => void)
  | (({ objectPosition }: { objectPosition: THREE.Vector3 }) => void)
  | (({ inGame }: { inGame: boolean }) => void)
  // | (({
  //     roomLayout,
  //   }: {
  //     roomLayout: { meshes: MeshInfo[]; planes: PlaneInfo[] };
  //   }) => void);
  | (({ planes }: { planes: PlaneInfo[] }) => void)
  | (({ meshes }: { meshes: MeshInfo[] }) => void);

export type HotnColdEventMap = Record<HotnColdEvents, HotnColdEventCallbacks>;

// Users
export interface Player {
  id: string;
  username: string;
  imageUrl: string | null;
  host: boolean;
  ready: boolean;
  inGame: boolean;
  publicKey?: string;
  privateKey?: string;
}

export interface HotnColdPlayer extends Player {
  gameEventsInitialized: boolean;
  hiding: boolean;
  seeking: boolean;
  hidObject: boolean;
  foundObject: boolean;
  playerPosition: Vector3 | null;
  playerProximity: number | null;
  objectPosition: Vector3 | null;
  objectMatrix: Matrix4 | null;
  roomLayout: {
    meshes: MeshInfo[];
    planes: PlaneInfo[];
  };
}

export interface UserInfo {
  id: string;
  username: string;
  imageUrl: string | null;
}

export interface Invite {
  gameId: string;
  sender: UserInfo;
  receiver?: UserInfo;
}

export interface PendingFriendRequests {
  requestId: number;
  sender: UserInfo;
  receiver?: UserInfo;
}

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
  activeFriends: UserInfo[];
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

/**
 * Zustand Store Types
 */

export interface PusherUserInfo {
  username: string;
  userId: string;
  imageUrl: string;
}

export type GeneralLobbyEvent =
  | "client-ready-toggle"
  | "client-mina-toggle"
  | "client-game-started"
  | "client-game-events-initialized";

export type FriendEvents =
  | `friend-added`
  | `friend-deleted`
  | `friend-request-pending`
  | `invite-sent`
  | "invite-accepted";

export interface FriendData {
  username: string;
  imageUrl: string;
  id: string;
  requestId?: number;
  friendId?: string;
  showToast?: boolean;
  gameId?: string;
}

export type EventCallback = (data?: Player) => void;

export type FriendCallback = (data: FriendData) => void;

export type SetGameEventsInitializedCallbacks = ({
  oppInfo,
  gameName,
}: {
  oppInfo: HotnColdPlayer;
  gameName: GameNames;
}) => void;

export type LobbyCallbacks =
  | (() => void)
  | (({ ready, username }: { ready: boolean; username: string }) => void)
  | (({ minaToggle }: { minaToggle: boolean }) => void)
  | SetGameEventsInitializedCallbacks
  | (({ gameName }: { gameName: GameNames }) => void);

export type FriendsEventMap = Record<FriendEvents, FriendCallback>;

export type LobbyEventMap = Record<GeneralLobbyEvent, LobbyCallbacks>;

export type GeneralEventMap = Record<string, EventCallback>;

export type PartialEventMap = Partial<Record<string, EventCallback>>;
