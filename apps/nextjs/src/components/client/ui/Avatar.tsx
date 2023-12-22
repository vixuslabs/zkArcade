"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboardTabContext } from "@/components/client/providers/DashboardTabProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";

import { usePusher } from "../stores";

interface UserAvatarProps {
  imageUrl?: string;
  username: string | null;
}

function UserAvatar({ imageUrl, username }: UserAvatarProps) {
  const { pusher, removePusher } = usePusher();
  const { setActiveTab } = useDashboardTabContext();
  const { signOut } = useClerk();
  const router = useRouter();
  //   const handleSignOut = async () => {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={imageUrl} alt="Profile Picture" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onPointerDown={() => setActiveTab("settings")}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onPointerDown={() => {
            if (pusher) {
              removePusher();
            }

            void signOut(() => router.push("/"));
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserAvatar;
