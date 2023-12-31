import { env } from "@/env.mjs";
import type {
  FriendsEventMap,
  GameState,
  GeneralEventMap,
  HotnColdGameEvents,
  HotnColdGameState,
  HotnColdPlayer,
  LobbyEventMap,
  MeshInfo,
  PartialEventMap,
  PlaneInfo,
  Player,
  PusherUserInfo,
} from "@/lib/types";
import { HotnColdGameStatus } from "@/lib/types";
import type { Channel, PresenceChannel } from "pusher-js";
import Pusher from "pusher-js";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

interface LobbyState {
  players: Player[];
  starting: boolean;
  isMinaOn: boolean;
  gameState: GameState | undefined;
  channel: PresenceChannel | null;
  me: Player | null;
  isHost: boolean;
  lobbyId: string | null;
}

interface UserPusherInfo {
  id: string;
  username: string;
  imageUrl: string;
}

interface PusherState {
  me: UserPusherInfo | null;
  pusherInitialized: boolean;
  friends: string[]; // will be a custom user object
  pusher: Pusher | null;
  activeChannels: PresenceChannel[] | Channel[];
}

interface PusherMember {
  id: string;
  info: {
    username: string;
    imageUrl: string;
  };
}

type MembersObject = Record<string, { username: string; imageUrl: string }>;

const initialPusherState: PusherState = {
  me: null,
  pusher: null,
  pusherInitialized: false,
  friends: [],
  activeChannels: [],
};

const initialLobbyState: LobbyState = {
  me: null,
  players: [],
  starting: false,
  isMinaOn: false,
  channel: null,
  gameState: undefined,
  isHost: false,
  lobbyId: null,
};

export const initialHotnColdState: HotnColdGameState = {
  status: HotnColdGameStatus.LOBBY,
  me: null,
  opponent: null,
};

export const usePusher = createWithEqualityFn(
  combine(initialPusherState, (set, get) => ({
    initPusher: (userInfo: PusherUserInfo) => {
      const currentPusher = get().pusher;
      if (currentPusher) {
        return;
        throw new Error("Pusher already initialized");
      }

      const rootUrl = new URL(window.location.href).origin;

      const client = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: "us2",
        forceTLS: true,
        userAuthentication: {
          endpoint: `${rootUrl}/api/pusher/user-auth`,
          transport: "ajax",
          params: {
            username: userInfo.username,
            userId: userInfo.userId,
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
        channelAuthorization: {
          endpoint: `${rootUrl}/api/pusher//channel-auth`,
          transport: "ajax",
          params: {
            username: userInfo.username,
            userId: userInfo.userId,
            imageUrl: userInfo.imageUrl,
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
      });

      client.signin();

      const clientUserInfo = {
        id: userInfo.userId,
        username: userInfo.username,
        imageUrl: userInfo.imageUrl,
      };

      set({
        pusher: client,
        pusherInitialized: true,
        me: clientUserInfo,
      });

      const initLobbyMe = {
        ...clientUserInfo,
        host: false,
        ready: false,
        inGame: false,
      };

      useLobbyStore.getState().setMe(initLobbyMe);
    },
    removePusher: () => {
      const { pusher } = get();

      if (!pusher) {
        throw new Error("Pusher does not exist");
      }
      pusher.disconnect();

      set({
        pusher: null,
        pusherInitialized: false,
      });
    },
    subscribeToChannel: (channelName: string) => {
      const { pusher, activeChannels } = get();
      if (!pusher) {
        console.log("pusher not initialized");
        return;
      }

      const channel = pusher.subscribe(channelName);
      set({ activeChannels: [...activeChannels, channel] });

      return channel;
    },
    unsubscribeFromChannel: (channelName: string) => {
      const { pusher, activeChannels } = get();

      if (!pusher) return;

      const channel = activeChannels.find(
        (_channel) => _channel.name === channelName,
      );

      if (!channel) {
        throw new Error(`Channel ${channelName} does not exist`);
      }

      channel.unsubscribe();

      const newActiveChannels = activeChannels.filter(
        (channel) => channel.name !== channelName,
      );

      console.log("newActiveChannels", newActiveChannels);

      set({ activeChannels: newActiveChannels });
    },
    addEventsToChannel: (channelName: string, eventMap: GeneralEventMap) => {
      console.log("inside addEventsToChannel");
      const { pusher, activeChannels } = get();

      if (!pusher) {
        throw new Error("Pusher is not initiated");
      }

      const curChannel = activeChannels.find(
        (channel) => channel.name === channelName,
      );

      if (!curChannel) {
        throw new Error(`Channel ${channelName} does not exist`);
      }
      Object.entries(eventMap).forEach(([eventName, handler]) => {
        if (handler) {
          curChannel.bind(eventName, handler);
        }
      });
    },
    removeEventsFromChannel: (
      eventMap: PartialEventMap,
      channelName: string,
    ) => {
      const { pusher, activeChannels } = get();

      if (!pusher) {
        throw new Error("Pusher is not initiated");
      }

      const curChannel = activeChannels.find(
        (channel) => channel.name === channelName,
      );

      if (!curChannel) {
        throw new Error(`Channel ${channelName} does not exist`);
      }

      Object.entries(eventMap).forEach(([eventName, handler]) => {
        if (handler) {
          curChannel.unbind(eventName, handler);
        }
      });
    },
  })),
);

export const useFriendsStore = createWithEqualityFn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  combine(initialLobbyState, (set, get) => {
    return {
      pusherStore: usePusher.getState,
      //   useLobbyStore: useLobbyStore,
      friends: (userId: string) => {
        // get friends from db
        console.log("userId", userId);
      },
      addNewFriend: (friendId: string) => {
        console.log("addNewFriend", friendId);
        // check to make sure not already a friend
        // will just set to new friend now
        // this will be called after successfully called from the front end
        // set( { friends:  })
      },
      addFriendEvents: (eventMap: FriendsEventMap) => {
        console.log("inside addFriendEvents");
        const { pusher, activeChannels, me } = usePusher.getState();
        if (!pusher) {
          throw new Error("Pusher is not initiated");
        }

        const rawId = me?.id.split("_")[1];

        const channel = activeChannels.find(
          (_channel) => _channel.name === `user-${rawId}-friends`,
        );

        if (!channel) {
          throw new Error(`user-${rawId}-friends does not exist`);
        }

        // const channel = pusher.subscribe(`user-${me?.userId}-friends`);

        Object.entries(eventMap).forEach(([eventName, handler]) => {
          if (handler) {
            channel.bind(eventName, handler);
          }
        });
      },
    };
  }),
);

export const useLobbyStore = createWithEqualityFn(
  combine(initialLobbyState, (set, get) => {
    return {
      setMe: (me: Player) => {
        set((state) => ({ me: { ...state.me, ...me } }));
      },
      setHost: (host: boolean) => {
        set({ isHost: host });
      },
      updatePlayer: (player: Player) => {
        const { players } = get();

        if (!players.find((p) => p.id === player.id)) {
          return;
        }

        set((state) => ({
          players: state.players.map((p) => {
            if (p.id === player.id) {
              return player;
            }
            return p;
          }),
        }));
      },
      setStarting: (starting: boolean) => {
        set({ starting });
      },
      setIsMinaOn: (isMinaOn: boolean) => {
        set({ isMinaOn });
      },
      addEventsToPresenceChannel: (
        channelName: string,
        eventMap: LobbyEventMap,
        isLobbyHost: boolean,
      ) => {
        const { pusher } = usePusher.getState();

        const { me, isHost } = get();
        console.log("isHost", isHost);

        if (!me) {
          throw new Error("subscribeToPresenceChannel: Me is not set");
        }

        if (!pusher) {
          throw new Error("subscribeToPresenceChannel: Pusher is not set");
        }

        set({ isHost: isLobbyHost });

        const channel = pusher.channel(channelName);

        if (!channel) {
          throw new Error(
            `subscribeToPresenceChannel: Channel ${channelName} was not found`,
          );
        }

        try {
          Object.entries(eventMap).forEach(([eventName, handler]) => {
            channel.bind(eventName, handler);
          });

          channel.bind(
            "pusher:subscription_succeeded",
            ({ members }: { members: MembersObject }) => {
              console.log("members", members);
              const { isHost } = get();
              Object.entries(members).map(([id, info]) => {
                console.log("pusher:subscription_succeeded - members", members);

                const prevPlayers = get().players;

                if (prevPlayers.find((p) => p.id === id)) {
                  return;
                }

                let prKey: string;
                let puKey: string;

                // Temp solution to assign keys, Meta Quest Browser
                // does not have the Auro Wallet extension
                if (prevPlayers.length === 0) {
                  console.log("prevPlayers.length === 0");

                  prKey = env.NEXT_PUBLIC_PRIV_KEY1;
                  puKey = env.NEXT_PUBLIC_PUB_KEY1;
                } else {
                  console.log("prevPlayers.length !== 0");
                  prKey = env.NEXT_PUBLIC_PRIV_KEY2;
                  puKey = env.NEXT_PUBLIC_PUB_KEY2;
                }

                if (id === me.id) {
                  set({
                    me: {
                      ...info,
                      imageUrl: `/api/imageProxy?url=${encodeURIComponent(
                        info.imageUrl,
                      )}`,
                      id,
                      ready: false,
                      host: id === me.id && isHost,
                      inGame: false,
                      privateKey: prKey,
                      publicKey: puKey,
                    },
                  });
                }

                const unorderedPlayers = [
                  ...prevPlayers,
                  {
                    ...info,
                    imageUrl: `/api/imageProxy?url=${encodeURIComponent(
                      info.imageUrl,
                    )}`,
                    id,
                    ready: false,
                    host: id === me.id && isHost,
                    inGame: false,
                    privateKey: prKey,
                    publicKey: puKey,
                  },
                ];

                const sortedPlayers: Player[] = [];

                unorderedPlayers.forEach((p) => {
                  if (isHost && p.id === me.id) {
                    sortedPlayers.unshift(p);
                  } else {
                    sortedPlayers.push(p);
                  }
                });

                console.log(sortedPlayers);

                set({ players: [...sortedPlayers] });
              });
            },
          );

          channel.bind("pusher:member_added", (member: PusherMember) => {
            console.log("pusher:member_added - member", member);

            const prevPlayers = get().players;

            if (prevPlayers.find((p) => p.id === member.id)) {
              return;
            }

            let prKey: string;
            let puKey: string;

            // Temp solution to assign keys, Meta Quest Browser
            // does not have the Auro Wallet extension
            if (prevPlayers.length === 0) {
              console.log("prevPlayers.length === 0");

              prKey = env.NEXT_PUBLIC_PRIV_KEY1;
              puKey = env.NEXT_PUBLIC_PUB_KEY1;
            } else {
              console.log("prevPlayers.length !== 0");
              prKey = env.NEXT_PUBLIC_PRIV_KEY2;
              puKey = env.NEXT_PUBLIC_PUB_KEY2;
            }

            set({
              players: [
                ...prevPlayers,
                {
                  ...member.info,
                  imageUrl: `/api/imageProxy?url=${encodeURIComponent(
                    member.info.imageUrl,
                  )}`,
                  id: member.id,
                  ready: false,
                  host: false,
                  inGame: false,
                  privateKey: prKey,
                  publicKey: puKey,
                },
              ],
            });
          });

          channel.bind("pusher:member_removed", (member: PusherMember) => {
            const prevPlayers = get().players;

            const player = prevPlayers.find((p) => p.id !== member.id);

            if (!player) {
              return;
            }

            const newPlayers = prevPlayers.filter((p) => p.id !== member.id);

            set({ players: newPlayers });
          });
        } catch (error) {
          console.error("subscribeToPresenceChannel: ", error);
        }
      },
      unsubscribeFromPresenceChannel: (lobbyId: string) => {
        const { unsubscribeFromChannel } = usePusher.getState();

        unsubscribeFromChannel(`presence-lobby-${lobbyId}`);
      },
      onPusherEvent: (event: HotnColdGameEvents) => {
        console.log("onPusherEvent: ", event);
      },
    };
  }),
);

export const useHotnCold = create(
  combine(initialHotnColdState, (set, get) => {
    return {
      updatePlayers: () => {
        const me = useLobbyStore.getState().me;

        if (!me) {
          throw new Error("assignStateValues: Me is not set in lobby store");
        }

        const players = useLobbyStore.getState().players;

        if (players.length < 1) {
          throw new Error(
            "assignStateValues: 2 players are required to play the game",
          );
        }

        const opponent = players.find((p) => p.id !== me.id);

        if (!opponent) {
          throw new Error(
            "assignStateValues: Opponent is not found in players",
          );
        }

        set({
          me: {
            ...me,
            hiding: false,
            foundObject: false,
            playerPosition: null,
            playerProximity: null,
            objectPosition: null,
            objectMatrix: null,
            roomLayout: null,
          },
          opponent: {
            ...opponent,
            hiding: false,
            foundObject: false,
            playerPosition: null,
            playerProximity: null,
            objectPosition: null,
            objectMatrix: null,
            roomLayout: null,
          },
        });
      },
      addGameEvents: () => {
        // const { channel } = useLobbyStore.getState();
        const channel = useHotnCold.getState().getGameChannel();

        if (!channel) {
          throw new Error("initGameEvents: Presence Channel is not set");
        }

        // const { addEventsToPresenceChannel } = useLobbyStore.getState();

        type HotnColdEvents =
          | "client-status-change"
          | "client-in-game"
          | "client-hiding"
          | "client-done-hiding"
          | "client-seeking"
          | "client-set-object"
          | "client-found-object";

        type HotnColdEventCallbacks =
          | (() => void)
          | (({ status }: { status: HotnColdGameStatus }) => void)
          | (({ objectPosition }: { objectPosition: THREE.Vector3 }) => void);

        type HotnColdEventMap = Record<HotnColdEvents, HotnColdEventCallbacks>;

        const eventMap: HotnColdEventMap = {
          "client-status-change": ({
            status,
          }: {
            status: HotnColdGameStatus;
          }) => {
            console.log("client-status-change to ", status);

            set({ status });
          },
          "client-in-game": () => {
            console.log("client-in-game");
            const { opponent } = get();

            if (!opponent) {
              throw new Error("client-in-game: Opponent is not set");
            }

            set({
              opponent: { ...opponent, inGame: true },
            });
          },
          "client-hiding": () => {
            console.log("client-hiding");
          },
          "client-done-hiding": () => {
            console.log("client-done-hiding");
            const { opponent, me } = get();
            const { setGameStatus } = useHotnCold.getState();
            const { channel } = useLobbyStore.getState();

            if (!opponent) {
              throw new Error("client-done-hiding: Opponent is not set");
            }

            if (!me) {
              throw new Error("client-done-hiding: Me is not set");
            }

            if (!channel) {
              throw new Error(
                "client-done-hiding: Presence Channel is not set",
              );
            }

            if (me.hiding) {
              console.log("I am still hiding, but my opponent is not");
              setGameStatus(HotnColdGameStatus.ONEHIDING);
              set({
                opponent: { ...opponent, hiding: false },
              });
              channel.trigger("client-status-change", {
                status: HotnColdGameStatus.ONEHIDING,
              });
            } else {
              console.log("I am not hiding, and my opponent is not");
              setGameStatus(HotnColdGameStatus.SEEKING);
              set({
                opponent: { ...opponent, hiding: false },
                me: { ...me, hiding: false },
              });
              channel.trigger("client-status-change", {
                status: HotnColdGameStatus.SEEKING,
              });
            }
          },
          "client-seeking": () => {
            console.log("client-seeking");
          },
          "client-set-object": ({
            objectPosition,
          }: {
            objectPosition: THREE.Vector3;
          }) => {
            console.log("client-set-object", objectPosition);

            const { opponent } = get();

            if (!opponent) {
              throw new Error("client-set-object: Opponent is not set");
            }

            set({
              opponent: { ...opponent, objectPosition },
            });
          },
          "client-found-object": ({
            objectPosition,
          }: {
            objectPosition: THREE.Vector3;
          }) => {
            console.log("client-found-object", objectPosition);

            const { opponent } = get();
            const { setGameStatus } = useHotnCold.getState();

            if (!opponent) {
              throw new Error("client-found-object: Opponent is not set");
            }

            set({
              opponent: { ...opponent, objectPosition, foundObject: true },
            });

            setGameStatus(HotnColdGameStatus.GAMEOVER);
          },
        };

        Object.entries(eventMap).forEach(([eventName, handler]) => {
          channel.bind(eventName, handler);
        });
      },
      setGameStatus: (status: HotnColdGameStatus) => {
        const { me, opponent, status: currentStatus } = get();

        if (status === currentStatus) {
          console.log("setGameStatus: Status is already", status);
          throw new Error(
            `setGameStatus: Status is already ${status}, cannot set to the same status`,
          );
          return;
        }

        if (!me) {
          throw new Error("setGameStatus: Me is not set");
        }

        if (!opponent) {
          throw new Error("setGameStatus: Opponent is not set");
        }

        // test cases to make sure that the game status is being set correctly
        switch (status) {
          case HotnColdGameStatus.PREGAME:
            if (!me.ready && !opponent.ready) {
              throw new Error(
                "setGameStatus: Both players are not ready, cannot set to pregame yet",
              );
            }
            break;
          case HotnColdGameStatus.IDLE:
            if (!me.inGame && !opponent.inGame) {
              throw new Error(
                "setGameStatus: Both players have not launched the game, cannot set to idle yet. One player must launch the game",
              );
            }
            break;
          case HotnColdGameStatus.BOTHHIDING:
            if (!me.inGame || !opponent.inGame) {
              throw new Error(
                "setGameStatus: Both players are not in game yet, cannot set to bothHiding yet",
              );
            }
            break;
          case HotnColdGameStatus.ONEHIDING:
            if (me.hiding && opponent.hiding) {
              throw new Error(
                "setGameStatus: Both players are still hiding the object, cannot set status to oneHiding until one player is no longer hiding",
              );
            }
            break;
          case HotnColdGameStatus.SEEKING:
            if (me.hiding || opponent.hiding) {
              throw new Error(
                "setGameStatus: One player is still hiding the object, cannot set to seeking yet",
              );
            }
            break;
          case HotnColdGameStatus.GAMEOVER:
            if (!me.foundObject && !opponent.foundObject) {
              throw new Error(
                "setGameStatus: Neither player has found the object, cannot set to gameover yet",
              );
            }
            break;
          default:
            break;
        }

        set({ status });
      },
      setMe: (me: HotnColdPlayer) => {
        set((state) => ({ me: { ...state.me, ...me } }));
      },
      setOpponent: (opponent: HotnColdPlayer) => {
        set((state) => ({ opponent: { ...state.opponent, ...opponent } }));
      },
      setRoomLayout: (
        roomLayout: {
          meshes: MeshInfo[];
          planes: PlaneInfo[];
        },
        user: "me" | "opponent",
      ) => {
        // const { me } = get();
        // if (!me) {
        //   throw new Error("setRoomLayout: Me is not set");
        // }

        if (user === "me") {
          set((state) => {
            if (!state.me) {
              throw new Error("setRoomLayout: Me is not set");
            }
            return {
              me: {
                ...state.me,
                roomLayout: { ...roomLayout },
              },
            };
          });
        } else {
          set((state) => {
            if (!state.opponent) {
              throw new Error("setRoomLayout: Opponent is not set");
            }
            return {
              opponent: {
                ...state.opponent,
                roomLayout: { ...roomLayout },
              },
            };
          });
        }
      },
      setPlayerPosition: (
        position: THREE.Vector3 | null,
        user: "me" | "opponent",
      ) => {
        if (user === "me") {
          set((state) => {
            if (!state.me) {
              throw new Error("setPlayerPosition: Me is not set");
            }
            return {
              me: {
                ...state.me,
                playerPosition: position,
              },
            };
          });
        } else {
          set((state) => {
            if (!state.opponent) {
              throw new Error("setPlayerPosition: Opponent is not set");
            }
            return {
              opponent: {
                ...state.opponent,
                playerPosition: position,
              },
            };
          });
        }
      },
      setPlayerProximity: (
        proximity: number | null,
        user: "me" | "opponent",
      ) => {
        if (user === "me") {
          set((state) => {
            if (!state.me) {
              throw new Error("setPlayerProximity: Me is not set");
            }
            return {
              me: {
                ...state.me,
                playerProximity: proximity,
              },
            };
          });
        } else {
          set((state) => {
            if (!state.opponent) {
              throw new Error("setPlayerProximity: Opponent is not set");
            }
            return {
              opponent: {
                ...state.opponent,
                playerProximity: proximity,
              },
            };
          });
        }
      },
      setObjectPosition: (
        position: THREE.Vector3 | null,
        user: "me" | "opponent",
      ) => {
        if (user === "me") {
          set((state) => {
            if (!state.me) {
              throw new Error("setObjectPosition: Me is not set");
            }
            return {
              me: {
                ...state.me,
                objectPosition: position,
              },
            };
          });
        } else {
          set((state) => {
            if (!state.opponent) {
              throw new Error("setObjectPosition: Opponent is not set");
            }
            return {
              opponent: {
                ...state.opponent,
                objectPosition: position,
              },
            };
          });
        }
      },
      setObjectMatrix: (
        matrix: THREE.Matrix4 | null,
        user: "me" | "opponent",
      ) => {
        if (user === "me") {
          set((state) => {
            if (!state.me) {
              throw new Error("setObjectMatrix: Me is not set");
            }
            return {
              me: {
                ...state.me,
                objectMatrix: matrix,
              },
            };
          });
        } else {
          set((state) => {
            if (!state.opponent) {
              throw new Error("setObjectMatrix: Opponent is not set");
            }
            return {
              opponent: {
                ...state.opponent,
                objectMatrix: matrix,
              },
            };
          });
        }
      },
      getGameChannel: () => {
        const channel = useLobbyStore.getState().channel;

        if (!channel) {
          throw new Error("getGameChannel: Channel is not set");
        }

        return channel;
      },
    };
  }),
);
