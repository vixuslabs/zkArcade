"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePusherClient } from "@/pusher/client";
import { useUser } from "@clerk/nextjs";

function CreateMatchButton() {
  const id = useMemo(() => crypto.randomUUID(), []);
  const { pusher } = usePusherClient();
  const user = useUser();

  return (
    <>
      <Button
        variant="default"
        onClick={() => {
          console.log("Start Game");
          console.log("pusher user ", pusher?.user);
          pusher?.subscribe(`presence-lobby-${id}`);
        }}
        className="rounded-md px-3.5 py-2.5 text-sm font-medium"
        asChild
      >
        {user.user && (
          <Link href={`/play/${user.user.username}/${id}`}>Create Match</Link>
        )}
      </Button>
    </>
  );
}

export default CreateMatchButton;
