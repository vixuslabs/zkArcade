/* eslint-disable */

import {
  createContext,
  useCallback,
  useContext,
  //   useContext,
  useMemo,
  //   useState,
} from "react";
import { HotnColdGameStatus } from "@/lib/types";
import type { HotnColdPlayer, LobbyEventMap } from "@/lib/types";
import type { PresenceChannel } from "pusher-js";
import { useParams } from "next/navigation";

import { useLobbyStore } from "@/components/client/stores";

interface HotnColdContextValues {
  status: HotnColdGameStatus;
  gameWinner: string | null; // username
  channel: PresenceChannel | null;
  players: HotnColdPlayer[];
}

export const HotnColdContext = createContext<HotnColdContextValues>({
  status: HotnColdGameStatus.LOBBY,
  players: [],
  gameWinner: null,
  channel: null,
});

export const useHotnColdProvider = () => {
  const context = useContext(HotnColdContext);
  if (!context) {
    throw new Error(
      "useHotnColdProvider must be used within a HotnColdProvider",
    );
  }
  return context;
};

function HotnColdProvider({ children }: { children: React.ReactNode }) {
  const {
    username: hostUsername,
    lobbyId,
  }: { username: string; lobbyId: string } = useParams();
    // const { subscribeToChannel, activeChannels, unsubscribeFromChannel, me } =
    // usePusher((state) => {
    //   return {
    //     subscribeToChannel: state.subscribeToChannel,
    //     activeChannels: state.activeChannels,
    //     unsubscribeFromChannel: state.unsubscribeFromChannel,
    //     me: state.me,
    //   };
    // }, shallow);
  const {
    addEventsToPresenceChannel,
    updatePlayer,
    channel,
    isMinaOn,
    setIsMinaOn,
    setStarting,
    starting,
  } = useLobbyStore();

  const lobbyEvents: LobbyEventMap = useMemo(() => {
    return {
      "client-joined": () => {
        console.log("client joined");
      },
      "client-left": () => {
        console.log("client left");
      },
      "client-ready": () => {
        console.log("client ready");
      },
      "client-not-ready": () => {
        console.log("client not ready");
      },
      "client-mina-on": () => {
        console.log("client mina on");
      },
      "client-mina-off": () => {
        console.log("client mina off");
      },
      "client-game-started": () => {
        console.log("client game started");
      },
    };
  }, []);

  const presenceChannelName = useMemo(
    () => `presence-lobby-${lobbyId}`,
    [lobbyId],
  );

  const subscribeToLobbyChannel = useCallback(() => {



  }, [lobbyId, presenceChannelName, activeChannels]);


  return (
    <HotnColdContext.Provider value={}>
      <></>
    </HotnColdContext.Provider>
  );
}

export default HotnColdProvider;
