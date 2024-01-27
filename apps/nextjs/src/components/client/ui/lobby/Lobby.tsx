"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
// import dynamic from "next/dynamic";
import {
  HotnColdInstructions,
  LobbySettings,
  PlayersContainer,
} from "@/components/client/ui/lobby";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GameNames } from "@/lib/constants";
import { useHotnCold, useLobbyStore, usePusher } from "@/lib/stores";
import type { HotnColdPlayer, LobbyEventMap } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useSessionSupported } from "@coconut-xr/natuerlich/react";
import { Transition } from "@headlessui/react";
import type { PresenceChannel } from "pusher-js";

import { HotnColdGame } from "../../xr";

// const MinaStartButton = dynamic(
//   () => import("@/components/client/mina/MinaStartButton"),
//   {
//     ssr: false,
//   },
// );

function Lobby({
  hostUsername,
  lobbyId,
}: {
  hostUsername: string;
  lobbyId: string;
}) {
  const [toXR, setToXR] = React.useState<boolean>(false);
  // const [launchXR, setLaunchXR] = React.useState<boolean>(false);
  // const [xrLoaded, setXrLoaded] = React.useState<boolean>(false);
  const [showInstructions, setShowInstructions] =
    React.useState<boolean>(false);
  const [xrSupported, setXRSupported] = useState<boolean>(false);

  const _ = useSessionSupported("immersive-ar");

  // const enterAR = useEnterXR("immersive-ar", sessionOptions);

  const { user, isSignedIn } = useUser();

  // const HotnColdGame = dynamic(
  //   () => import("@/components/client/xr/HotnColdGame"),
  //   {
  //     ssr: false,
  //     // loading: ({ isLoading, error }) => {
  //     //   isLoading ? setXrLoaded(false) : setXrLoaded(true);

  //     //   if (error) {
  //     //     throw new Error("Error loading XR component");
  //     //   }

  //     //   return null;
  //     // },
  //   },
  // );

  const { gameEventsInitialized } = useHotnCold((state) => {
    return {
      gameEventsInitialized: state.gameEventsInitialized,
    };
  });

  const {
    subscribeToChannel,
    activeChannels,
    unsubscribeFromChannel,
    me,
    pusherInitialized,
    initPusher,
  } = usePusher((state) => {
    return {
      subscribeToChannel: state.subscribeToChannel,
      activeChannels: state.activeChannels,
      unsubscribeFromChannel: state.unsubscribeFromChannel,
      me: state.me,
      pusherInitialized: state.pusherInitialized,
      initPusher: state.initPusher,
    };
  });

  const {
    addEventsToPresenceChannel,
    updatePlayer,
    isMinaOn,
    setIsMinaOn,
    setStarting,
    starting,
    // me: lobbyMe,
    players,
    initGameEventsToPresenceChannel,
  } = useLobbyStore();
  const [lobbyChannel, setLobbyChannel] =
    React.useState<PresenceChannel | null>(null);

  const lobbyEvents: LobbyEventMap = useMemo(() => {
    return {
      "client-ready-toggle": ({
        ready,
        username,
      }: {
        ready: boolean;
        username: string;
      }) => {
        const players = useLobbyStore.getState().players;

        const opponent = players.find((p) => p.username === username);

        if (!opponent) {
          throw new Error("LobbyZ client-ready: Could not find opponent");
        }

        updatePlayer({
          ...opponent,
          ready,
        });
      },
      "client-mina-toggle": ({ minaToggle }: { minaToggle: boolean }) => {
        setIsMinaOn(minaToggle);
      },
      "client-game-started": ({ gameName }: { gameName: GameNames }) => {
        setStarting(true);

        initGameEventsToPresenceChannel(presenceChannelName, gameName);
      },
      "client-game-events-initialized": ({
        oppInfo,
        gameName,
      }: {
        oppInfo: HotnColdPlayer;
        gameName: GameNames;
      }) => {
        const { me: gameMe } = useHotnCold.getState();

        console.log("client-game-events-initialized: ", oppInfo, gameName);

        switch (gameName) {
          case "Hot 'n Cold":
            // setOpponent(oppInfo);
            useHotnCold.setState({
              opponent: oppInfo,
              gameEventsInitialized: gameMe ? true : false,
            });
            break;
          default:
            throw new Error("lobbyEvents in Lobby: Unknown game name");
        }

        if (!gameMe) {
          throw new Error("lobbyEvents in Lobby: Could not find gameMe");
        }

        // setXrLoaded(true);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.username, updatePlayer, setIsMinaOn]);

  const presenceChannelName = useMemo(
    () => `presence-lobby-${lobbyId}`,
    [lobbyId],
  );

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    if (!pusherInitialized) {
      initPusher(
        me
          ? {
              userId: me.id,
              username: me.username ?? "",
              imageUrl: me.imageUrl,
            }
          : {
              userId: user.id,
              username: user.username ?? "",
              imageUrl: user.imageUrl,
            },
      );
    }

    if (activeChannels.find((c) => c.name === presenceChannelName)) {
      console.log("already subscribed to presence channel");
      return;
    }

    const channel = subscribeToChannel(presenceChannelName);

    if (!channel) {
      throw new Error(
        `Could not subscribe to presence channel: presence-lobby-${lobbyId}`,
      );
    }
    setLobbyChannel(channel as PresenceChannel);

    addEventsToPresenceChannel(
      presenceChannelName,
      lobbyEvents,
      hostUsername === user.username!,
    );

    return () => {
      unsubscribeFromChannel(presenceChannelName);
      setLobbyChannel(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, presenceChannelName, isSignedIn]);

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    if (mounted || !user) {
      return;
    }
    if (players.length === 0) {
      updatePlayer({
        host: user.username === hostUsername,
        ready: false,
        inGame: false,
        username: user.username!,
        id: user.id,
        imageUrl: `/api/imageProxy?url=${encodeURIComponent(user.imageUrl)}`,
      });
    }

    setMounted(true);
  }, [mounted, user, hostUsername, updatePlayer, players]);

  const handleReady = useCallback(
    (username: string) => {
      const player = players.find((p) => p.username === username);

      if (!player) {
        throw new Error("LobbyZ: Could not find player");
      }

      updatePlayer({
        ...player,
        ready: !player.ready,
      });

      lobbyChannel?.trigger("client-ready-toggle", {
        ready: !player.ready,
        username: player.username,
      });
    },
    [updatePlayer, lobbyChannel, players],
  );

  return (
    <>
      {/* Lobby UI */}
      <Transition
        show={!toXR && mounted}
        beforeEnter={() => console.log("transition starting to open")}
        afterEnter={() => console.log("transition opened")}
        beforeLeave={() => console.log("transition starting to close")}
        afterLeave={() => setShowInstructions(true)}
      >
        <Transition.Child
          as={Fragment}
          enter="transform duration-200 transition ease-out-in"
          enterFrom="opacity-50 scale-50"
          enterTo="opacity-100 scale-100"
          leave="transform duration-200 transition ease-in-out"
          leaveFrom="opacity-100 rotate-0 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <PlayersContainer
            players={players}
            handleReady={handleReady}
            starting={starting}
          />
        </Transition.Child>
      </Transition>

      {/* Game Instructions */}
      <Transition show={showInstructions}>
        <Transition.Child
          as={Card}
          enter="transform duration-200 transition ease-out-in"
          enterFrom="opacity-50 scale-50"
          enterTo="opacity-100 scale-100"
          leave="transform duration-200 transition ease-in-out"
          leaveFrom="opacity-100 rotate-0 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <HotnColdInstructions />
        </Transition.Child>
      </Transition>

      {/* Start and Settings Buttons, always anchored at the bottom */}
      <div className="absolute bottom-16 flex items-center gap-x-12">
        {
          !starting ? (
            <>
              <Button
                variant="default"
                className="relative"
                disabled={
                  useLobbyStore.getState().players.some((p) => !p.ready) ||
                  hostUsername !== me?.username ||
                  starting
                }
                onClick={() => {
                  if (hostUsername === me?.username) {
                    lobbyChannel?.trigger("client-game-started", {
                      starting: true,
                      gameName: "Hot 'n Cold",
                    });

                    initGameEventsToPresenceChannel(
                      presenceChannelName,
                      "Hot 'n Cold",
                    );

                    setStarting(true);
                    setToXR(true);
                  }
                }}
              >
                Start Game
              </Button>
              <LobbySettings
                toXR={toXR}
                isMinaOn={isMinaOn}
                setIsMinaOn={setIsMinaOn}
                isHost={me?.username === hostUsername}
                channel={lobbyChannel}
              />
            </>
          ) : null
          // isMinaOn ? (
          //   <MinaStartButton
          //     setToXR={setToXR}
          //     publicKey={lobbyMe?.publicKey}
          //     privateKey={lobbyMe?.privateKey}
          //   >
          //     <Button
          //       variant={"default"}
          //       onPointerDown={() => {
          //         // setLaunchXR(true);
          //         void enterAR();
          //       }}
          //       disabled={launchXR || !gameEventsInitialized || !xrSupported}
          //     >
          //       {!xrSupported ? "XR Not Supported" : "Launch XR"}
          //     </Button>
          //   </MinaStartButton>
          // ) : (
          //   <Button
          //     variant={"default"}
          //     onPointerDown={() => setLaunchXR(true)}
          //     disabled={!isXRSupported || !gameEventsInitialized || !xrSupported}
          //   >
          //     {!isXRSupported ? "XR Not Supported" : "Launch XR"}
          //   </Button>
          // )
        }

        {/* Game */}
        {starting && (
          <HotnColdGame
            gameEventsInitialized={gameEventsInitialized}
            // launchXR={launchXR}
            xrSupported={xrSupported}
            setXRSupported={setXRSupported}
          />
        )}
      </div>
    </>
  );
}

export default Lobby;
