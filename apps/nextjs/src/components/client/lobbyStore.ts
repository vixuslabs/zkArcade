import { env } from "@/env.mjs";
// import { usePusherClient } from "@/pusher/client";

import type { GameState, Player } from "@/lib/types";
import type { Channel, PresenceChannel } from "pusher-js";
import Pusher from "pusher-js";
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface PusherUserInfo {
  username: string;
  userId: string;
  imageUrl: string;
}

type GeneralLobbyEvent =
  | "client-joined"
  | "client-left"
  | "client-ready"
  | "client-not-ready"
  | "client-start-game"
  | "client-mina-on"
  | "client-mina-off"
  | "client-game-joined"
  | "client-game-left"
  | "client-game-started";

type HotnColdGameEvents =
  | GeneralLobbyEvent
  | "client-game-roomLayout"
  | "client-game-hiding"
  | "client-game-hiding-done"
  | "client-game-seeking-start"
  | "client-game-requestProximity"
  | "client-game-setProximity"
  | "client-game-setObjectPosition"
  | "client-game-seeking-done";

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

type EventCallback = (data?: Player) => void;

type FriendCallback = (data: FriendData) => void;

type LobbyCallback = () => void;

export type FriendsEventMap = Record<FriendEvents, FriendCallback>;

type LobbyEventMap = Record<GeneralLobbyEvent, LobbyCallback>;

export type GeneralEventMap = Record<string, EventCallback>;

type PartialEventMap = Partial<Record<string, EventCallback>>;

interface LobbyState {
  players: Player[];
  starting: boolean;
  isMinaOn: boolean;
  gameState: GameState | undefined;
  channel: PresenceChannel | null;
  me: Player | null;
  // Additional state as needed
  isHost: boolean;
  lobbyId: string | null;
}

interface userPusherInfo {
  userId: string;
  username: string;
  imageUrl: string;
}

interface PusherState {
  me: userPusherInfo | null;
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

/**
 * TODO: Complete the implementation of this store.
 * - There will be the main Pusher store that will be used to connect to the Pusher server
 * - then we create multiple other stores, some being: friends, lobby, game(as we add more games, there will be more stores, but they will have similar structures)
 * - There will be a lobby store that will be used to manage the lobby state
 */

export const usePusher = create(
  combine(initialPusherState, (set, get) => ({
    initPusher: (userInfo: PusherUserInfo) => {
      const currentPusher = get().pusher;
      if (currentPusher) {
        throw new Error("Pusher already initialized");
      }

      const client = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: "us2",
        forceTLS: true,
        userAuthentication: {
          endpoint: "../api/pusher/user-auth",
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
          endpoint: "../api/pusher/channel-auth",
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
      set({
        pusher: client,
        pusherInitialized: true,
        me: {
          userId: userInfo.userId,
          username: userInfo.username,
          imageUrl: userInfo.imageUrl,
        },
      });
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

export const useFriendsStore = create(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  combine(usePusher, (set, get) => {
    // const { pusher } = usePusher.getState();

    // if (!pusher) {
    //   throw new Error("useLobbyStore: Pusher must be initialized first");
    // }
    console.log("usePusher: ", usePusher.getState());

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

        const rawId = me?.userId.split("_")[1];

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
      pusherStore: usePusher.getState,
      addPlayer: (player: Player) => {
        const { players } = get();

        if (players.find((p) => p.id === player.id) ?? players.length >= 2) {
          return;
        }

        set((state) => ({
          players: [...state.players, player],
        }));
      },
      removePlayer: (player: Player) => {
        const { players } = get();

        if (!players.find((p) => p.id === player.id)) {
          return;
        }

        if (players.length === 0) {
          throw new Error("No players to remove");
        }

        set((state) => ({
          players: state.players.filter((p) => p.id !== player.id),
        }));
      },
      setStarting: (starting: boolean) => {
        set({ starting });
      },
      setIsMinaOn: (isMinaOn: boolean) => {
        set({ isMinaOn });
      },
      subscribeToPresenceChannel: (
        lobbyId: string,
        hostUsername: string,
        eventMap: LobbyEventMap,
      ) => {
        const { subscribeToChannel } = usePusher.getState();

        const { me } = get();

        if (!me) {
          throw new Error("subscribeToPresenceChannel: Me is not set");
        }

        set({ isHost: hostUsername === me?.username, lobbyId });

        const channel = subscribeToChannel(`presence-lobby-${lobbyId}`);

        if (!channel) {
          throw new Error("subscribeToPresenceChannel: Channel was not set");
        }

        try {
          Object.entries(eventMap).forEach(([eventName, handler]) => {
            channel.bind(eventName, handler);
          });

          channel.bind(
            "pusher:subscription_succeeded",
            (members: PusherMember[]) => {
              members.forEach((member) => {
                // players
                console.log("member", member);
                console.log("players");
              });
            },
          );
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
