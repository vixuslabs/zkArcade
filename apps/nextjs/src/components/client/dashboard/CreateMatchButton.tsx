"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GameNames } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useZkArcade } from "@/lib/zkArcadeStore";
import { usePusherClient } from "@/pusher/client";
import { useUser } from "@clerk/nextjs";

interface CreateMatchButtonProps {
  gameName: GameNames;
  className?: string;
}

function CreateMatchButton({ gameName, className }: CreateMatchButtonProps) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const { matchPath, setMatchPath } = useZkArcade();
  const { pusher } = usePusherClient();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // setMatchPath(`/play/${user.username}/${id}`);

      if (user.username) {
        setMatchPath(user.username, id);
      } else {
        console.log(
          "CreateMatchButton - useEffect: user.username is undefined",
        );
      }
    }
  }, [user, setMatchPath, id]);

  return (
    <>
      {gameName === "Hot 'n Cold" ? (
        <Button
          variant="default"
          disabled={!user || matchPath === ""}
          className={cn(
            className
              ? className
              : "rounded-md px-3.5 py-2.5 text-sm font-medium",
            "",
          )}
          asChild
        >
          <Link
            href={matchPath}
            onPointerDown={() => {
              console.log("inside Link - onPointerDown");
              pusher?.subscribe(`presence-lobby-${id}`);
            }}
            prefetch={false}
          >
            Create Match
          </Link>
        </Button>
      ) : (
        <Button
          disabled
          variant="default"
          className={cn(
            className
              ? className
              : "rounded-md px-3.5 py-2.5 text-sm font-medium",
            "",
          )}
        >
          Coming Soon
        </Button>
      )}
    </>
  );
}

export default CreateMatchButton;
