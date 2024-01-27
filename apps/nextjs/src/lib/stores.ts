import { env } from "@/env.mjs";
import type {
  FriendsEventMap,
  GameState,
  GeneralEventMap,
  GeneralLobbyEvent,
  HotnColdEventMap,
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

import { GameNames } from "./constants";

// import { createWithEqualityFn } from "zustand/traditional";

interface LobbyState {
  players: Player[];
  starting: boolean;
  isMinaOn: boolean;
  gameState: GameState | undefined;
  channel: PresenceChannel | null;
  me: Player | null;
  isHost: boolean;
  lobbyId: string | null;
  lobbyEventsInitialized: boolean;
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
  lobbyEventsInitialized: false,
  starting: false,
  isMinaOn: false,
  channel: null,
  gameState: undefined,
  isHost: false,
  lobbyId: null,
};

export const initialHotnColdState: HotnColdGameState = {
  status: HotnColdGameStatus.LOBBY,
  gameEventsInitialized: false,
  startRoomSync: false,
  me: null,
  opponent: null,
};

export const usePusher = create(
  combine(initialPusherState, (set, get) => ({
    initPusher: (userInfo: PusherUserInfo) => {
      if (!userInfo.imageUrl.includes("/api/imageProxy")) {
        userInfo.imageUrl = `/api/imageProxy?url=${encodeURIComponent(
          userInfo.imageUrl,
        )}`;
      }

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
          endpoint: `${rootUrl}/api/pusher/channel-auth`,
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
      const { pusher } = get();
      if (!pusher) {
        return;
      }

      const channel = pusher.subscribe(channelName);
      set((state) => ({ activeChannels: [...state.activeChannels, channel] }));

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

      channel.unbind_all();

      channel.unsubscribe();

      const newActiveChannels = activeChannels.filter(
        (channel) => channel.name !== channelName,
      );

      set({ activeChannels: newActiveChannels });
    },
    addEventsToChannel: (channelName: string, eventMap: GeneralEventMap) => {
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

export const useFriendsStore = create(
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

export const useLobbyStore = create(
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

        const { me } = get();

        if (!me) {
          throw new Error("subscribeToPresenceChannel: Me is not set");
        }

        if (!pusher) {
          throw new Error("subscribeToPresenceChannel: Pusher is not set");
        }

        set((state) => ({
          isHost: isLobbyHost,
          players: state.players.length > 0 ? state.players : [me],
        }));

        const channel = pusher.channel(channelName) as PresenceChannel;

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
              const { isHost } = get();
              Object.entries(members).map(([id, info]) => {
                const prevPlayers = get().players;

                if (prevPlayers.find((p) => p.id === id)) {
                  return;
                }

                let prKey: string;
                let puKey: string;

                // Temp solution to assign keys, Meta Quest Browser
                // does not have the Auro Wallet extension
                if (prevPlayers.length === 0) {
                  prKey = env.NEXT_PUBLIC_PRIV_KEY1;
                  puKey = env.NEXT_PUBLIC_PUB_KEY1;
                } else {
                  prKey = env.NEXT_PUBLIC_PRIV_KEY2;
                  puKey = env.NEXT_PUBLIC_PUB_KEY2;
                }

                const imgUrl = info.imageUrl.includes("/api/imageProxy")
                  ? info.imageUrl
                  : `/api/imageProxy?url=${encodeURIComponent(info.imageUrl)}`;

                if (id === me.id) {
                  set({
                    me: {
                      ...info,
                      imageUrl: imgUrl,
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
                    imageUrl: imgUrl,
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

                set({ players: [...sortedPlayers], channel });
              });
            },
          );

          channel.bind("pusher:member_added", (member: PusherMember) => {
            const prevPlayers = get().players;

            if (prevPlayers.find((p) => p.id === member.id)) {
              return;
            }

            let prKey: string;
            let puKey: string;

            // Temp solution to assign keys, Meta Quest Browser
            // does not have the Auro Wallet extension
            if (prevPlayers.length === 0) {
              prKey = env.NEXT_PUBLIC_PRIV_KEY1;
              puKey = env.NEXT_PUBLIC_PUB_KEY1;
            } else {
              prKey = env.NEXT_PUBLIC_PRIV_KEY2;
              puKey = env.NEXT_PUBLIC_PUB_KEY2;
            }

            const imgUrl = member.info.imageUrl.includes("/api/imageProxy")
              ? member.info.imageUrl
              : `/api/imageProxy?url=${encodeURIComponent(
                  member.info.imageUrl,
                )}`;

            set({
              players: [
                ...prevPlayers,
                {
                  ...member.info,
                  imageUrl: imgUrl,
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

          set({ lobbyEventsInitialized: true, channel });
        } catch (error) {
          console.error("subscribeToPresenceChannel: ", error);
        }
      },
      initGameEventsToPresenceChannel: (
        channelName: string,
        gameName: GameNames,
      ) => {
        const { me, lobbyEventsInitialized } = get();
        const pusher = usePusher.getState().pusher;
        const addHotnColdGameEvents = useHotnCold.getState().addGameEvents;

        if (!me) {
          throw new Error("addGameEventsToPresenceChannel: Me is not set");
        }

        if (!pusher) {
          throw new Error("addGameEventsToPresenceChannel: Pusher is not set");
        }

        if (!lobbyEventsInitialized) {
          throw new Error(
            "addGameEventsToPresenceChannel: Lobby events are not initialized",
          );
        }

        const channel = pusher.channel(channelName);

        if (!channel) {
          throw new Error(
            `addGameEventsToPresenceChannel: Channel ${channelName} was not found`,
          );
        }

        switch (gameName) {
          case "Hot 'n Cold":
            addHotnColdGameEvents();
            break;
          default:
            break;
        }

        // try {

        // } catch (error) {
        //   console.error("subscribeToPresenceChannel: ", error);
        // }
      },
      unsubscribeFromPresenceChannel: (lobbyId: string) => {
        const { unsubscribeFromChannel } = usePusher.getState();

        unsubscribeFromChannel(`presence-lobby-${lobbyId}`);
      },
    };
  }),
);

export const useHotnCold = create(
  combine(initialHotnColdState, (set, get) => {
    return {
      addGameEvents: () => {
        const {
          me: gameMe,
          opponent: gameOpponent,
          setMe: setGameMe,
        } = useHotnCold.getState();

        const { me: lobbyMe, lobbyEventsInitialized } =
          useLobbyStore.getState();
        const channel = useHotnCold.getState().getGameChannel();

        if (!lobbyEventsInitialized) {
          throw new Error(
            "addGameEvents: Lobby events are not initialized, cannot add game events yet",
          );
        }

        if (!channel) {
          throw new Error("initGameEvents: Presence Channel is not set");
        }

        if (!lobbyMe) {
          throw new Error("addGameEvents: Lobby Me is not set");
        }

        // const { addEventsToPresenceChannel } = useLobbyStore.getState();

        const eventMap: HotnColdEventMap = {
          "client-status-change": ({
            status,
          }: {
            status: HotnColdGameStatus;
          }) => {
            set({ status });
          },
          "client-in-game": () => {
            console.log("client-in-game");
            const { opponent, me, status } = get();

            const { setGameStatus } = useHotnCold.getState();

            if (!opponent) {
              throw new Error("client-in-game: Opponent is not set");
            }

            set({
              opponent: { ...opponent, inGame: true },
            });

            if (!me) {
              throw new Error("client-in-game: Me is not set");
            }

            if (me.inGame && status !== HotnColdGameStatus.BOTHHIDING) {
              setGameStatus(HotnColdGameStatus.BOTHHIDING);
            }
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

        const newGameMe: HotnColdPlayer = {
          ...lobbyMe,
          gameEventsInitialized: true,
          hiding: false,
          foundObject: false,
          playerPosition: null,
          playerProximity: null,
          objectPosition: null,
          objectMatrix: null,
          roomLayout: null,
        };

        if (!gameMe) {
          setGameMe({ ...newGameMe });
        }

        // setGameStatus(HotnColdGameStatus.PREGAME);

        channel.trigger(
          "client-game-events-initialized" as GeneralLobbyEvent,
          {
            oppInfo: newGameMe,
            gameName: "Hot 'n Cold",
          } as {
            oppInfo: HotnColdPlayer;
            gameName: GameNames;
          },
        );

        gameOpponent
          ? set({ gameEventsInitialized: true })
          : set({ gameEventsInitialized: false });
      },
      // updatePlayers: () => {
      //   const me = useLobbyStore.getState().me;

      //   if (!me) {
      //     throw new Error("assignStateValues: Me is not set in lobby store");
      //   }

      //   const players = useLobbyStore.getState().players;

      //   if (players.length < 1) {
      //     throw new Error(
      //       "assignStateValues: 2 players are required to play the game",
      //     );
      //   }

      //   const opponent = players.find((p) => p.id !== me.id);

      //   if (!opponent) {
      //     throw new Error(
      //       "assignStateValues: Opponent is not found in players",
      //     );
      //   }

      //   set({
      //     me: {
      //       ...me,
      //       hiding: false,
      //       foundObject: false,
      //       playerPosition: null,
      //       playerProximity: null,
      //       objectPosition: null,
      //       objectMatrix: null,
      //       roomLayout: null,
      //     },
      //     opponent: {
      //       ...opponent,
      //       hiding: false,
      //       foundObject: false,
      //       playerPosition: null,
      //       playerProximity: null,
      //       objectPosition: null,
      //       objectMatrix: null,
      //       roomLayout: null,
      //     },
      //   });
      // },
      setGameStatus: (status: HotnColdGameStatus) => {
        const { me, opponent, status: currentStatus } = get();

        if (status === currentStatus) {
          console.log("setGameStatus: Status is already", status);
          throw new Error(
            `setGameStatus: Status is already ${status}, cannot set to the same status`,
          );
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
            useHotnCold.setState({ startRoomSync: true });
            // if (!me.inGame || !opponent.inGame) {
            //   throw new Error(
            //     "setGameStatus: Both players are not in game yet, cannot set to bothHiding yet",
            //   );
            // }
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
