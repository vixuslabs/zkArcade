"use client";
/* eslint-disable @typescript-eslint/no-empty-function */

import React, { useState, useContext, createContext, useMemo } from "react";

import { useLobbyChannel } from "@/lib/hooks/useLobbyChannel";
import { usePathname } from "next/navigation";
import { calculateProximity } from "@/lib/utils";

import type { PresenceChannel } from "pusher-js";
import type { Player } from "@/lib/types";
import type { Vector3, Mesh } from "three";

interface GameState {
  isGameStarted: boolean;
  isGameEnded: boolean;
  me: {
    isHiding: boolean;
    isSeeking: boolean;
    isIdle: boolean;
    myObjectPosition?: Vector3 | null;
  };
  opponent: {
    info: Player;
    isConnected: boolean;
    isIdle: boolean;
    isHiding: boolean;
    isSeeking: boolean;
    room?: {
      meshes: Mesh[];
      planes: Mesh[];
    };
  };
  oppObject?: {
    objectPosition: Vector3 | null;
    objectProximity: number | null;
    objectFound: boolean;
    objectSet: boolean;
  };
}

interface LobbyContextValues {
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
}

const LobbyContext = createContext<LobbyContextValues>({
  players: [],
  starting: false,
  setStarting: () => {},
  channel: null,
  setPlayers: () => {},
  isMinaOn: false,
  me: null,
  setIsMinaOn: () => {},
  setXrStarted: () => {},
  gameState: undefined,
  setGameState: () => {},
});

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);

  // if (!context) {
  //   throw new Error("useLobbyContext must be used within a LobbyProvider");
  // }

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
  // const [gameState, setGameState] = useState<GameState | undefined>(undefined);
  const [gameState, setGameState] = useState<GameState | undefined>({
    isGameStarted: false,
    isGameEnded: false,
    me: {
      isHiding: false,
      isSeeking: false,
      isIdle: false,
      myObjectPosition: null,
    },
    opponent: {
      info: user,
      isConnected: false,
      isIdle: false,
      isHiding: false,
      isSeeking: false,
    },
    oppObject: {
      objectPosition: null,
      objectProximity: null,
      objectFound: false,
      objectSet: false,
    },
  });
  const [xrStarted, setXrStarted] = useState<boolean>(false);
  const pathname = usePathname();

  const [players, setPlayers, channel, me] = useLobbyChannel(
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
      "client-game-joined": (data: Player) => {
        setGameState({
          isGameStarted: false,
          isGameEnded: false,
          opponent: {
            info: data,
            isConnected: false,
            isIdle: false,
            isHiding: false,
            isSeeking: false,
          },
          me: {
            isHiding: false,
            isSeeking: false,
            isIdle: false,
          },
        });
      },
      "client-game-left": () => {
        setGameState(undefined);
      },
      "client-game-started": () => {
        // if I am the host, I am hiding the object first
        if (me?.host) {
          setGameState((prev) => {
            if (prev) {
              return {
                ...prev,
                isGameStarted: true,
                me: {
                  ...prev.me,
                  isHiding: true,
                },
                opponent: {
                  ...prev.opponent,
                  isIdle: true,
                },
              };
            }
            return prev;
          });
        } else {
          setGameState((prev) => {
            if (prev) {
              return {
                ...prev,
                isGameStarted: true,
                opponent: {
                  ...prev.opponent,
                  isIdle: false,
                },
              };
            }
            return prev;
          });
        }
      },
      "client-game-roomLayout": (data: Player) => {
        if (!data.roomLayout) {
          throw new Error("roomLayout not set");
        }

        setGameState((prev) => {
          if (prev) {
            return {
              ...prev,
              opponent: {
                ...prev.opponent,
                room: data.roomLayout,
              },
            };
          }
          return prev;
        });
      },
      "client-game-hiding": () => {
        setGameState((prev) => {
          if (prev) {
            return {
              ...prev,
              opponent: {
                ...prev.opponent,
                isHiding: true,
              },
            };
          }
          return prev;
        });
      },
      "client-game-hiding-done": () => {
        setGameState((prev) => {
          if (prev) {
            return {
              ...prev,
              me: {
                isHiding: false,
                isIdle: false,
                isSeeking: true,
              },

              opponent: {
                ...prev.opponent,
                isHiding: false,
                isIdle: true,
              },
              oppObject: {
                objectPosition: null,
                objectProximity: null,
                objectFound: false,
                objectSet: true,
              },
            };
          }
          return prev;
        });
      },
      "client-game-seeking-start": () => {
        const myObject = gameState?.me.myObjectPosition;

        if (!myObject) {
          throw new Error("myObject is null or undefined");
        }

        setGameState((prev) => {
          if (prev) {
            return {
              ...prev,
              me: {
                isHiding: false,
                isSeeking: false,
                isIdle: true,
              },
              opponent: {
                ...prev.opponent,
                isIdle: false,
                isSeeking: true,
              },
            };
          }
          return prev;
        });
      },
      "client-game-requestProximity": (data: Player) => {
        if (!data.playerPosition) {
          throw new Error("playerPosition not sent");
        }

        const myObjectPosition = gameState?.me.myObjectPosition;

        if (!myObjectPosition) {
          throw new Error("myObjectPosition not set");
        }

        const playerPosition = data.playerPosition;
        // const myObjectPosition = gameState.myObjectPosition;

        const proximity = calculateProximity(
          playerPosition,
          myObjectPosition,
          3,
        );

        if (proximity >= 0.8) {
          channel?.trigger("client-game-setObjectPosition", {
            ...data,
            objectPosition: myObjectPosition,
          });
        }

        channel?.trigger("client-game-setProximity", {
          ...data,
          proximity: proximity,
        });
      },
      "client-game-setProximity": (data: Player) => {
        const proximity = data.playerProximity;

        if (!proximity) {
          throw new Error("proximity not set");
        }

        setGameState((prev) => {
          if (!prev?.oppObject) {
            throw new Error("oppObject not set");
          }

          if (prev) {
            return {
              ...prev,
              opponent: {
                ...prev.opponent,
                isIdle: false,
                isSeeking: true,
              },
              oppObject: {
                ...prev.oppObject,
                objectProximity: proximity,
              },
            };
          }
          return prev;
        });
      },
      "client-game-setObjectPosition": (data: Player) => {
        if (!data.objectPosition) {
          throw new Error("objectPosition not set yet, wait for it to be set");
        }

        const objectPosition = data.objectPosition;

        setGameState((prev) => {
          if (!prev?.oppObject) {
            throw new Error("oppObject not set");
          }

          if (prev) {
            return {
              ...prev,
              opponent: {
                ...prev.opponent,
                isIdle: false,
                isSeeking: true,
              },
              oppObject: {
                ...prev.oppObject,
                objectPosition: objectPosition,
              },
            };
          }
          return prev;
        });
      },
      "client-game-seeking-done": () => {
        setGameState((prev) => {
          if (prev) {
            return {
              ...prev,
              opponent: {
                ...prev.opponent,
                isIdle: true,
                isSeeking: false,
              },
            };
          }
          return prev;
        });
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
      setXrStarted,
      gameState,
      setGameState,
      me,
    };
  }, [
    players,
    setPlayers,
    starting,
    channel,
    isMinaOn,
    setIsMinaOn,
    setXrStarted,
    gameState,
    setGameState,
    me,
  ]);

  return (
    <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
  );
}

// export default React.memo(LobbyProvider); // worthless since passing children prop
export default LobbyProvider;
