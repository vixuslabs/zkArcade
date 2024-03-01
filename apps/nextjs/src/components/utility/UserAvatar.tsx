"use client";

import React from "react";
import { useDashboardTabContext } from "@/components/providers/DashboardTabProvider";
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
import { usePusher } from "@/lib/stores";
import { RedirectToSignIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";

function UserAvatar() {
  const { pusher, removePusher } = usePusher();
  const { setActiveTab } = useDashboardTabContext();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  user
                    ? `/api/imageProxy?url=${encodeURIComponent(
                        user?.imageUrl ?? "",
                      )}`
                    : ""
                }
                // src={convertToSafeUrl(user.imageUrl ?? "")}
                alt="Profile Picture"
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.username}
              </p>
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
              void signOut(() => {
                if (pusher) {
                  removePusher();
                }
              });
            }}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SignedOut>
        <RedirectToSignIn redirectUrl={"/"} />
      </SignedOut>
    </>
  );
}

export default UserAvatar;
