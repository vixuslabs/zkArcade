"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { PresenceChannel } from "pusher-js";

function LobbySettings({
  toXR,
  isMinaOn,
  setIsMinaOn,
  isHost,
  channel,
}: {
  toXR: boolean;
  isMinaOn: boolean;
  setIsMinaOn: (isMinaOn: boolean) => void;
  isHost: boolean | undefined;
  channel: PresenceChannel | null;
}) {
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
            className={!isHost || toXR ? "hover:cursor-not-allowed" : ""}
            disabled={!isHost || toXR}
            checked={isMinaOn}
            onCheckedChange={() => {
              console.log("isHost", isHost);
              if (isHost) {
                channel?.trigger(`client-mina-toggle`, {
                  minaToggle: !isMinaOn,
                });
                setIsMinaOn(!isMinaOn);
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
