"use client";

/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLobbyChannel } from "@/lib/hooks/useLobbyChannel";
import type { GameState, LobbyContextValues, Player } from "@/lib/types";
import { calculateProximity } from "@/lib/utils";

import { usePusher } from "../stores";

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
  started: { current: false },
});

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);

  // not going to check this since components are shared between sandbox and game modes.
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
  const pusherStore = usePusher();

  console.log("channels", pusherStore.pusher?.allChannels());

  const [starting, setStarting] = useState<boolean>(false);
  const [isMinaOn, setIsMinaOn] = useState<boolean>(false);
  const started = useRef<boolean>(false);
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
      info: null,
      isConnected: false,
      isIdle: false,
      isHiding: false,
      isSeeking: false,
    },
    oppObject: {
      objectPosition: null,
      objectMatrix: null,
      objectProximity: null,
      objectFound: false,
      objectSet: false,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [xrStarted, setXrStarted] = useState<boolean>(false);

  const [players, setPlayers, channel, me] = useLobbyChannel(
    user,
    lobbyId,
    user.host,
    {
      "client-joined": (data: Player) => {
        console.log("in client-joined");

        setPlayers((prev) => {
          if (prev.find((player) => player.id === data.id)) {
            return prev;
          }
          return [...prev, data];
        });
      },
      "client-left": (data: Player) => {
        console.log("in client-left");
        setPlayers((prev) => prev.filter((player) => player.id !== data.id));
      },
      "client-ready": (data: Player) => {
        console.log("in client-ready");
        setPlayers((prev) =>
          prev.map((player) =>
            player.username === data.username
              ? { ...player, ready: !player.ready }
              : player,
          ),
        );
      },
      "client-not-ready": (data: Player) => {
        console.log("in client-not-ready");
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
        console.log("in client-start-game");
        setStarting(true);
      },
      "client-mina-on": () => {
        setIsMinaOn(true);
      },
      "client-mina-off": () => {
        setIsMinaOn(false);
      },
      "client-game-joined": (data: Player) => {
        console.log("in client-game-joined");
        setGameState({
          isGameStarted: false,
          isGameEnded: false,
          opponent: {
            info: data,
            isConnected: false,
            isIdle: true,
            isHiding: false,
            isSeeking: false,
          },
          me: {
            isHiding: false,
            isSeeking: false,
            isIdle: true,
          },
        });

        // if (gameState?.me.isIdle) {
        channel?.trigger("client-game-getRoomLayout", {});
        // }
      },
      "client-game-left": () => {
        console.log("in client-game-left");
        setGameState(undefined);
      },
      "client-game-started": () => {
        console.log("in client-game-started");
        // if I am the host, I am hiding the object first
        if (user.host) {
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
                  isHiding: true,
                },
              };
            }
            return prev;
          });
        }
      },
      "client-game-roomLayout": (data: Player) => {
        console.log("in client-game-roomLayout");
        if (!data.roomLayout) {
          throw new Error("roomLayout not set");
        }

        console.log("data.roomLayout", data.roomLayout);

        const { meshes, planes } = data.roomLayout;

        if (user.host) {
          setGameState((prev) => {
            if (prev) {
              console.log("prev", prev);
              return {
                ...prev,
                isGameStarted: true,
                opponent: {
                  ...prev.opponent,
                  isIdle: false,
                  isHiding: true,
                  info: {
                    ...prev.opponent.info!,
                    roomLayout: {
                      meshes,
                      planes,
                    },
                  },
                },
                me: {
                  ...prev.me,
                  isIdle: true,
                  isHiding: false,
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
                  isIdle: true,
                  isHiding: false,
                  info: {
                    ...prev.opponent.info!,
                    roomLayout: {
                      meshes,
                      planes,
                    },
                  },
                },
                me: {
                  ...prev.me,
                  isIdle: false,
                  isHiding: true,
                },
              };
            }
            return prev;
          });
        }

        // setGameState((prev) => {
        //   if (prev) {
        //     return {
        //       ...prev,
        //       opponent: {
        //         ...prev.opponent,
        //         info: {
        //           ...prev.opponent.info!,
        //           roomLayout: {
        //             meshes,
        //             planes,
        //           },
        //         },
        //       },
        //     };
        //   }
        //   return prev;
        // });

        console.log("channel");

        const triggered = channel?.trigger("client-game-hiding", {});
        console.log('triggered "client-game-hiding"', triggered);
      },
      "client-game-hiding": () => {
        console.log("in client-game-hiding");
      },
      "client-game-hiding-done": (data: Player) => {
        console.log("in client-game-hiding-done");

        console.log(data.objectPosition);

        if (!data.objectPosition) {
          throw new Error("objectPosition not set");
        }

        // @ts-expect-error - will fix type error later (sike)
        setGameState((prev) => {
          if (prev) {
            return {
              ...prev,
              me: {
                ...prev.me,
                isIdle: false,
                isSeeking: true,
              },
              opponent: {
                ...prev.opponent,
                isIdle: false,
                isSeeking: true,
              },
              oppObject: {
                objectPosition: data.objectPosition!,
                // objectMatrix: data.objectMatrix,
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
        console.log("in client-game-seeking-start");
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
        console.log("in client-game-requestProximity");
        console.log("data", data);
        console.log("data.playerPosition", data.playerPosition);
        console.log("gameState.me", gameState?.me);
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

        console.log("calculate proximity");
        console.log("playerPosition", playerPosition);
        console.log("myObjectPosition", myObjectPosition);
        console.log("proximity", proximity);

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
        console.log("in client-game-setProximity");
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
        console.log("in client-game-setObjectPosition");
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
        console.log("in client-game-seeking-done");
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
      started,
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
    started,
  ]);

  return (
    <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
  );
}

// export default React.memo(LobbyProvider); // worthless since passing children prop
export default LobbyProvider;
