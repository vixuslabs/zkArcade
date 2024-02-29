"use client";

import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import {
  HotnColdPreGame,
  LobbySettings,
  PlayersContainer,
} from "@/components/client/ui/lobby";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHotnCold, useLobbyStore, usePusher } from "@/lib/stores";
import type { GameNames, HotnColdPlayer, LobbyEventMap } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { Transition } from "@headlessui/react";
import type { PresenceChannel } from "pusher-js";
import { MinaProvider } from "../../providers";

function Lobby({
  hostUsername,
  lobbyId,
}: {
  hostUsername: string;
  lobbyId: string;
}) {
  const [showInstructions, setShowInstructions] =
    React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState(false);

  const { user, isSignedIn } = useUser();

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
    initLobbyEventsToPresenceChannel,
    updatePlayer,
    setGameStarting,
    gameStarting,
    players,
    setIsMinaOn,
    initGameEventsToPresenceChannel,
    setPresenceChannel,
    channel: presenceChannel,
    me: lobbyMe,
  } = useLobbyStore();

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
        initGameEventsToPresenceChannel(presenceChannelName, gameName);

        setGameStarting(true);
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
    setPresenceChannel(channel as PresenceChannel);

    initLobbyEventsToPresenceChannel(
      presenceChannelName,
      lobbyEvents,
      hostUsername === user.username!,
    );

    return () => {
      unsubscribeFromChannel(presenceChannelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, presenceChannelName, isSignedIn]);

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

      if (!presenceChannel) {
        console.log("Lobby: Could not find presence channel");
        return;
        // throw new Error("LobbyZ: Could not find presence channel");
      }

      presenceChannel.trigger("client-ready-toggle", {
        ready: !player.ready,
        username: player.username,
      });
    },
    [updatePlayer, presenceChannel, players],
  );

  return (
    <>
      {/* Lobby UI */}
      <Transition
        show={!gameStarting && mounted}
        // show={false}
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
            starting={gameStarting}
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
          className="border-none"
        >
          <MinaProvider localPlayer={lobbyMe}>
            <HotnColdPreGame />
          </MinaProvider>
        </Transition.Child>
      </Transition>

      {/* Start and Settings Buttons, always anchored at the bottom */}
      <div className="absolute bottom-16 flex items-center gap-x-12">
        {!gameStarting && (
          <>
            <Button
              variant="default"
              className="relative"
              disabled={
                useLobbyStore.getState().players.some((p) => !p.ready) ||
                hostUsername !== me?.username ||
                gameStarting
              }
              onClick={() => {
                if (hostUsername === me?.username) {
                  presenceChannel?.trigger("client-game-started", {
                    starting: true,
                    gameName: "Hot 'n Cold",
                  });

                  initGameEventsToPresenceChannel(
                    presenceChannelName,
                    "Hot 'n Cold",
                  );

                  setGameStarting(true);
                }
              }}
            >
              Start Game
            </Button>
            <LobbySettings
              isHost={me?.username === hostUsername}
              channel={presenceChannel}
            />
          </>
        )}
      </div>
    </>
  );
}

export default Lobby;
