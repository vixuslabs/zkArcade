"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GameNames } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePusherClient } from "@/pusher/client";
import { useUser } from "@clerk/nextjs";

interface CreateMatchButtonProps {
  gameName: GameNames;
  className?: string;
}

function CreateMatchButton({ gameName: _, className }: CreateMatchButtonProps) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const [url, setUrl] = useState<string>("");
  const { pusher } = usePusherClient();
  const user = useUser();

  useEffect(() => {
    if (user) {
      console.log("user ", user);
      setUrl(`/play/${user.user?.username}/${id}`);
    }
  }, [user, setUrl, id]);

  return (
    <>
      <Button
        variant="default"
        onClick={() => {
          console.log("Start Game");
          console.log("pusher user ", pusher?.user);
          console.log("inside Button - onClick");
          // pusher?.subscribe(`presence-lobby-${id}`);
        }}
        className={cn(
          className
            ? className
            : "rounded-md px-3.5 py-2.5 text-sm font-medium",
          "",
        )}
        asChild
      >
        {/* {user.user && ( */}
        {/* <Link href={`${url}?game=${gameName}`} prefetch={false}> */}
        <Link
          href={url}
          onPointerDown={() => {
            console.log("inside Link - onPointerDown");
            pusher?.subscribe(`presence-lobby-${id}`);
          }}
          prefetch={false}
        >
          Create Match
        </Link>
        {/* // )} */}
      </Button>
    </>
  );
}

export default CreateMatchButton;
