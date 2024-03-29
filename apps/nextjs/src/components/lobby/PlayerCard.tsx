"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Check, X } from "lucide-react";

interface PlayerCardProps {
  username: string | null;
  imageUrl: string | null;
  handleReady: (username: string) => void;
  isReady: boolean;
  starting: boolean;
  isHost?: boolean;
  className?: string;
}

function PlayerCard({
  username,
  handleReady,
  isReady,
  imageUrl,
  className,
  starting,
}: PlayerCardProps) {
  const user = useUser();

  return (
    <Card className={cn("w-[380px]", className)}>
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
          className={cn(
            user.user?.username !== username
              ? `hover:cursor-not-allowed`
              : "hover:auto",
          )}
          onClick={() => {
            if (user.user?.username === username && username) {
              console.log("ready");
              handleReady(username);
            } else {
              console.log("cant ready somebody else silly");
            }
          }}
          disabled={starting}
        >
          Ready Up
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PlayerCard;
