"use client";

import React, { useState, useContext, createContext, useMemo } from "react";

import { useLobbyChannel } from "@/lib/hooks/useLobbyChannel";
import type { PresenceChannel } from "pusher-js";

import { Player } from "@/lib/types";

interface LobbyContextValues {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  starting: boolean;
  setStarting: React.Dispatch<React.SetStateAction<boolean>>;
  channel: PresenceChannel | null;
  isMinaOn: boolean;
  setIsMinaOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LobbyContext = createContext<LobbyContextValues>({
  players: [],
  starting: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setStarting: () => {},
  channel: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPlayers: () => {},
  isMinaOn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIsMinaOn: () => {},
});

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);

  if (!context) {
    throw new Error("useLobbyContext must be used within a LobbyProvider");
  }

  return context;
};

function LobbyProvider({
  children,
  user,
  lobbyId,
}: {
  children: React.ReactNode;
  user: Player;
  lobbyId: string;
}) {
  const [starting, setStarting] = useState<boolean>(false);
  const [isMinaOn, setIsMinaOn] = useState<boolean>(false);

  const [players, setPlayers, channel] = useLobbyChannel(
    user,
    lobbyId,
    user.host,
    {
      "client-joined": (data: Player) => {
        console.log("in client-joined");

        // @ts-expect-error - will fix type error later
        setPlayers((prev) => data);

        console.log("hi");
      },
      "client-left": (data: Player) => {
        setPlayers((prev) => prev.filter((player) => player.id !== data.id));
      },
      "client-ready": (data: Player) => {
        setPlayers((prev) =>
          prev.map((player) =>
            player.username === data.username
              ? { ...player, ready: !player.ready }
              : player,
          ),
        );
      },
      "client-not-ready": (data: Player) => {
        setPlayers((prev) =>
          prev.map((player) => {
            if (player.id === data.id) {
              return {
                ...player,
                isReady: false,
              };
            }
            return player;
          }),
        );
      },
      "client-start-game": () => {
        setStarting(true);
      },
      "client-mina-on": () => {
        setIsMinaOn(true);
      },
      "client-mina-off": () => {
        setIsMinaOn(false);
      },
    },
  );

  const value = useMemo(() => {
    return {
      players,
      setPlayers,
      starting,
      setStarting,
      channel,
      isMinaOn,
      setIsMinaOn,
    };
  }, [players, setPlayers, starting, channel, isMinaOn, setIsMinaOn]);

  return (
    <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
  );
}

// export default React.memo(LobbyProvider); // worthless since passing children prop
export default LobbyProvider;
