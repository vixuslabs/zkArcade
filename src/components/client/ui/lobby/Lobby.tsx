"use client";

import React, { Fragment } from "react";

import { PlayerCard, LobbyDialogWrapper, LobbySettings } from ".";
import { useLobbyContext } from "@/components/client/providers/LobbyProvider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useUser } from "@clerk/nextjs";

function Lobby() {
  const { players, setPlayers, starting, channel, isMinaOn, setIsMinaOn } =
    useLobbyContext();
  const user = useUser();

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
        <Button
          variant="default"
          className="relative"
          disabled={
            players.some((p) => !p.ready) ||
            players.find((p) => p.username === user?.user!.username)?.host ===
              false
          }
          onClick={() => {
            if (
              user.user?.username &&
              players.find((p) => p.username === user?.user.username)?.host
            ) {
              console.log("starting");
              channel?.trigger("client-starting", {
                starting: true,
              });
            }
          }}
        >
          Start Game
        </Button>
        <LobbySettings isMinaOn={isMinaOn} setIsMinaOn={setIsMinaOn} />
      </div>
    </>
  );
}

export default Lobby;
