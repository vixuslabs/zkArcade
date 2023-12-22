"use client";

import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  //   useHotnCold,
  useLobbyStore,
  usePusher,
} from "@/components/client/stores";
import type { LobbyEventMap } from "@/components/client/stores";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import type { PresenceChannel } from "pusher-js";
import { shallow } from "zustand/shallow";

import { LobbyDialogWrapper, LobbySettings, PlayerCard } from ".";

const MinaProvider = dynamic(
  () => import("@/components/client/providers/MinaProvider"),
  {
    ssr: false,
  },
);

const InitiateMina = dynamic(
  () => import("@/components/client/mina/InitiateMina"),
  {
    ssr: false,
  },
);

function Lobby() {
  const {
    username: hostUsername,
    lobbyId,
  }: { username: string; lobbyId: string } = useParams();

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
  }, shallow);
  const {
    addEventsToPresenceChannel,
    updatePlayer,
    channel,
    isMinaOn,
    setIsMinaOn,
    setStarting,
    starting,
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
        console.log("client ready");
        console.log("username: ", username);
        console.log("ready: ", ready);

        const players = useLobbyStore.getState().players;

        console.log("_players: ", players);

        const opponent = players.find((p) => p.username === username);
        console.log("opponent: ", opponent);
        if (!opponent) {
          throw new Error("LobbyZ client-ready: Could not find opponent");
        }

        updatePlayer({
          ...opponent,
          ready,
        });
      },
      "client-mina-toggle": () => {
        console.log("client mina on");
      },
      "client-game-started": () => {
        console.log("client game started");
      },
    };
  }, [me?.username, updatePlayer]);

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

    console.log("subscribing to presence lobby channel");
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
      console.log("unsubscribing from presence channel");
      unsubscribeFromChannel(presenceChannelName);
      setLobbyChannel(null);
    };
  }, [lobbyId, presenceChannelName, isSignedIn]);

  const handleReady = useCallback(
    (username: string) => {
      console.log("inside handleReady");

      const players = useLobbyStore.getState().players;

      const player = players.find((p) => p.username === username);

      if (!player) {
        throw new Error("LobbyZ: Could not find player");
      }

      updatePlayer({
        ...player,
        ready: !player.ready,
      });
      console.log("player: ", player);

      lobbyChannel?.trigger("client-ready-toggle", {
        ready: !player.ready,
        username: player.username,
      });
    },
    [updatePlayer, lobbyChannel],
  );

  return (
    <>
      <div
        className={cn(
          "flex h-screen w-screen items-center",
          useLobbyStore.getState().players.length > 1
            ? "justify-evenly"
            : "justify-evenly",
        )}
      >
        {useLobbyStore.getState().players.map((player, index) => (
          <Fragment key={player.username}>
            <div
              className="relative flex w-1/2 flex-col items-center"
              key={player.username}
            >
              <PlayerCard
                username={player.username}
                imageUrl={player.imageUrl}
                isHost={player.host}
                handleReady={() => handleReady(player.username)}
                isReady={player.ready}
              />
            </div>
            {index === 0 && (
              <Separator className="h-24 text-white" orientation="vertical" />
            )}
          </Fragment>
        ))}
        {useLobbyStore.getState().players.length === 1 && (
          <LobbyDialogWrapper />
        )}
      </div>
      <div className="absolute bottom-16 flex items-center gap-x-12">
        {!starting ? (
          <>
            <Button
              variant="default"
              className="relative"
              disabled={
                useLobbyStore.getState().players.some((p) => !p.ready) ||
                hostUsername === me?.username ||
                starting
              }
              onClick={() => {
                if (hostUsername === me?.username) {
                  console.log("starting");
                  channel?.trigger("client-start-game", {
                    starting: true,
                  });
                  setStarting(true);
                }
              }}
            >
              Start Game
            </Button>
            <LobbySettings
              isMinaOn={isMinaOn}
              setIsMinaOn={setIsMinaOn}
              isHost={me?.username === hostUsername}
              channel={channel}
            />
          </>
        ) : isMinaOn ? (
          <MinaProvider>
            <InitiateMina player={me!} />
          </MinaProvider>
        ) : (
          <Button variant={"default"} asChild>
            <Link href={"/game"}>Start Game</Link>
          </Button>
        )}
      </div>
    </>
  );
}

export default Lobby;
