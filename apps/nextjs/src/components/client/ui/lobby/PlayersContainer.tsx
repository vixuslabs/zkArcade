"use client";

import React, { forwardRef, Fragment } from "react";
import { LobbyDialogWrapper, PlayerCard } from "@/components/client/ui/lobby";
import { Separator } from "@/components/ui/separator";
import type { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

// import type { Transition } from "@headlessui/react";

interface PlayersContainerProps {
  players: Player[];
  handleReady: (username: string) => void;
  starting: boolean;
}

const PlayersContainer = forwardRef<HTMLDivElement, PlayersContainerProps>(
  ({ players, handleReady, starting }, ref) => {
    return (
      <div
        className={cn(
          "flex h-screen w-screen items-center",
          players.length > 1 ? "justify-evenly" : "justify-evenly",
        )}
        ref={ref}
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
                handleReady={() => handleReady(player.username)}
                isReady={player.ready}
                starting={starting}
              />
            </div>
            {index === 0 && (
              <Separator className="h-24 text-white" orientation="vertical" />
            )}
          </Fragment>
        ))}
        {players.length === 1 && <LobbyDialogWrapper />}
      </div>
    );
  },
);

PlayersContainer.displayName = "PlayersContainer";

export default PlayersContainer;
