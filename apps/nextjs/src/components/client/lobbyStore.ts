import { create } from "zustand";
import { combine } from "zustand/middleware";
// import { usePusherClient } from "@/pusher/client";

import type { Player, GameState } from "@/lib/types";
import type { Channel, PresenceChannel } from "pusher-js";
import Pusher from "pusher-js";
import { env } from "@/env.mjs";


interface PusherUserInfo {
    username: string;
    userId: string;
    imageUrl: string;
}   


type GeneralLobbyEvent = "client-joined"
| "client-left"
| "client-ready"
| "client-not-ready"
| "client-start-game"
| "client-mina-on"
| "client-mina-off"
| "client-game-joined"
| "client-game-left"
| "client-game-started"


type HotnColdGameEvents =
  GeneralLobbyEvent 
  | "client-game-roomLayout"
  | "client-game-hiding"
  | "client-game-hiding-done"
  | "client-game-seeking-start"
  | "client-game-requestProximity"
  | "client-game-setProximity"
  | "client-game-setObjectPosition"
  | "client-game-seeking-done";

type EventCallback = (data: Player) => void;



type PartialEventMap = Partial<Record<string,EventCallback>>;


interface LobbyState {
    players: Player[];
    starting: boolean;
    isMinaOn: boolean;
    gameState: GameState | undefined;
    channel: PresenceChannel | null;
    me: Player | null;
    // Additional state as needed
};

interface PusherState  {
    userId: string | null;
    friends: string[]; // will be a custom user object
    pusher: Pusher | null;
    activeChannels: PresenceChannel[] | Channel[];
}

const initialPusherState: PusherState = {
    userId: null,
    friends: [],
    pusher: null,
    activeChannels: []
}

const initialLobbyState: LobbyState = {
    me: null,
    players: [],
    starting: false,
    isMinaOn: false,
    channel: null,
    gameState: undefined,
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
            set({ pusher: client, userId: userInfo.userId });
        },
        removePusher: () => {
            const { pusher } = get();

            if (!pusher) {
                throw new Error("Pusher does not exist")
            }
            pusher.disconnect();
        },
        subscribeToChannel: (channelName: string) => {
            const { pusher, activeChannels } = get();
            if (!pusher) {
                return;
            } 

            const channel = pusher.subscribe(channelName);
            set({ activeChannels: [...activeChannels, channel] });
        },
        unsubscribeFromChannel: (channelName: string) => {
            const { pusher, activeChannels } = get();

            if (!pusher) return;

            const channel = activeChannels.find( (_channel) => _channel.name === channelName)

            if (!channel) {
                throw new Error(`Channel ${channelName} does not exist`)
            }

            channel.unsubscribe();

            const newActiveChannels = activeChannels.filter( (channel) => channel.name === channelName)

            set({ activeChannels: newActiveChannels})
        },
        addEventsToChannel: (eventMap: PartialEventMap, channelName: string) => {

            const { pusher, activeChannels } = get();

            if (!pusher) {
                throw new Error("Pusher is not initiated")
            }

            const curChannel = activeChannels.find( (channel) => channel.name === channelName);

            if (!curChannel) {
                throw new Error(`Channel ${channelName} does not exist`)
            }

            Object.entries(eventMap).forEach(([eventName, handler]) => {
                if (handler) {
                    curChannel.bind(eventName, handler);
                }
              });
        }
    }))
)

export const useFriendsStore = create(
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    combine(usePusher, ( set, get) => ({
        useLobbyStore: useLobbyStore,
        friends: (userId: string) => {
            // get friends from db
            console.log('userId', userId)
        },
        addNewFriend: (friendId: string) => {
            console.log('addNewFriend', friendId)
            // check to make sure not already a friend
            // will just set to new friend now
            // this will be called after successfully called from the front end

            // set( { friends:  })
        },
    }))
)


export const useLobbyStore = create(
    combine(initialLobbyState, ( set, get) => ({
        addPlayer: (player: Player) => {
            const { players } = get();

            if (players.find((p) => p.id === player.id)) {
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
        initPusher: () => {
            console.log('init Pusher')
        },
        onPusherEvent: (event: HotnColdGameEvents) => {
            console.log('onPusherEvent: ', event)
        },
    }))
)