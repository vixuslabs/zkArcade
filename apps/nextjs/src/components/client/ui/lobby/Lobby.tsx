"use client";

import React, { Fragment, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLobbyContext } from "@/components/client/providers/LobbyProvider";
import { useHotnCold } from "@/components/client/stores";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

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
    players,
    setPlayers,
    starting,
    setStarting,
    channel,
    isMinaOn,
    setIsMinaOn,
  } = useLobbyContext();

  const user = useUser();
  const me = useMemo(() => {
    return players.find((p) => p.username === user.user?.username);
  }, [players, user.user?.username]);

  const handleReady = () => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.username === user.user?.username
          ? { ...player, ready: !player.ready }
          : player,
      ),
    );

    channel?.trigger("client-ready", {
      username: user.user?.username,
    });
  };

  return (
    <>
      <div
        className={cn(
          "flex h-screen w-screen items-center",
          players.length > 1 ? "justify-evenly" : "justify-evenly",
        )}
      >
        {players.map((player, index) => (
          <Fragment key={player.username}>
            <div
              className="relative flex w-1/2 flex-col items-center"
              key={player.username}
            >
              <PlayerCard
                username={player.username}
                imageUrl={player.imageUrl}
                isHost={player.host}
                handleReady={handleReady}
                isReady={player.ready}
              />
            </div>
            {index === 0 && (
              <Separator className="h-24 text-white" orientation="vertical" />
            )}
          </Fragment>
        ))}
        {players.length === 1 && <LobbyDialogWrapper />}
      </div>
      <div className="absolute bottom-16 flex items-center gap-x-12">
        {!starting ? (
          <>
            <Button
              variant="default"
              className="relative"
              disabled={
                players.some((p) => !p.ready) ||
                players.find((p) => p.username === user?.user!.username)
                  ?.host === false ||
                starting
              }
              onClick={() => {
                if (
                  user.user?.username &&
                  players.find((p) => p.username === user?.user.username)?.host
                ) {
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
              isHost={me?.host}
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
