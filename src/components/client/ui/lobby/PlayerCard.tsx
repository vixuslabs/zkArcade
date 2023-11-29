"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerCardProps {
  username: string | null;
  imageUrl: string | null;
  handleReady?: () => void;
  isReady: boolean;
  isHost?: boolean;
  className?: string;
}

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

import { useLobbyContext } from "@/components/client/providers/LobbyProvider";

function PlayerCard({
  username,
  handleReady = () => {
    console.log("ready");
  },
  isReady,
  imageUrl,
  className,
}: PlayerCardProps) {
  const { starting } = useLobbyContext();
  const user = useUser();

  return (
    <Card className={cn("dark w-[380px]", className)}>
      <CardHeader className="items-center">
        <CardTitle
          className={cn("text-sm", isReady ? "text-green-500" : "text-red-500")}
        >
          {isReady ? (
            <div className="flex items-center gap-x-2">
              <Check size={16} />
              <p>Ready</p>
            </div>
          ) : (
            <div className="flex items-center gap-x-2">
              <X size={16} />
              <p>Not Ready</p>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-center gap-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={imageUrl ?? undefined} alt={username ?? ""} />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <h3>{username}</h3>
      </CardContent>
      <CardFooter className="flex w-full flex-col items-center">
        <Button
          variant="default"
          onClick={() => {
            if (user.user?.username === username) {
              handleReady();
            } else {
              console.log("cant ready somebody else silly");
            }
          }}
          disabled={starting || user.user?.username !== username}
        >
          Ready Up
        </Button>
        {/* <button onClick={onReady}>Ready Up</button> */}
      </CardFooter>
    </Card>
  );
}

export default PlayerCard;
