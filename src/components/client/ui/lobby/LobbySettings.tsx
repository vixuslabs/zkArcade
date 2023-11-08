"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { PresenceChannel } from "pusher-js";

function LobbySettings({
  isMinaOn,
  setIsMinaOn,
  isHost,
  channel,
}: {
  isMinaOn: boolean;
  setIsMinaOn: React.Dispatch<React.SetStateAction<boolean>>;
  isHost: boolean | undefined;
  channel: PresenceChannel | null;
}) {
  console.log(isMinaOn, "isMinaOn");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="relative">
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={10} className="w-64">
        <div className="flex items-center space-x-2">
          <Switch
            disabled={!isHost}
            checked={isMinaOn}
            onCheckedChange={() => {
              setIsMinaOn((prev) => !prev);

              if (isHost) {
                channel?.trigger(`client-mina-${isMinaOn ? "off" : "on"}`, {
                  isMinaOn: !isMinaOn,
                });
              }
            }}
            id="mina"
          />
          <Image
            className="inline-flex hover:cursor-pointer"
            width={18}
            height={18}
            src="/mina.svg"
            alt="mina"
            onClick={() => window.open("https://minaprotocol.com/", "_blank")}
          />
          <Label htmlFor="mina">Mina Activation</Label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default LobbySettings;
