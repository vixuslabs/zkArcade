"use client";

import React from "react";
import Link from "next/link";
import { CreateMatchButton } from "@/components/client/dashboard";
import { Button } from "@/components/ui/button";
import { useZkArcade } from "@/lib/zkArcadeStore";

function GameOverview() {
  const activeGame = useZkArcade((state) => state.activeGame);

  return (
    <div className="flex h-full w-full max-w-4xl flex-col items-center justify-center rounded-lg bg-transparent p-8">
      <div className="grid w-full grid-cols-2 gap-10">
        <div className="flex flex-col px-4 text-center ">
          <h2 className="mb-2 self-center text-lg font-bold">Description</h2>
          <p className="flex-grow text-sm">{activeGame?.mainDescription}</p>
        </div>
        <div className="flex flex-col px-4 text-center ">
          <h2 className="mb-2 self-center text-lg font-bold">
            How are zk Proofs used?
          </h2>
          <p className="flex-grow text-sm">{activeGame?.zkDescription}</p>
        </div>
      </div>
      <div className="mt-8 w-full">
        {activeGame.name === "Sandbox" ? (
          <Button
            variant="default"
            className="w-full rounded px-4 py-2 font-bold "
            asChild
          >
            <Link href={"/sandbox"}>Start Sandbox</Link>
          </Button>
        ) : (
          <CreateMatchButton
            gameName={activeGame.name}
            className="w-full rounded px-4 py-2 font-bold"
          />
        )}
      </div>
    </div>
  );
}

export default GameOverview;
