"use client";
import { BellIcon } from "@heroicons/react/24/outline";

import React, { Fragment } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";

type PendingFriendRequests = {
  requestId: number;
  imageUrl: string;
  username: string | null;
  firstName: string | null;
};

function NotificationButton({
  pendingFriendRequests,
}: {
  pendingFriendRequests: PendingFriendRequests[];
}) {
  const acceptRequestMutation =
    api.friendships.acceptFriendRequest.useMutation();
  const declineRequestMutation =
    api.friendships.declineFriendRequest.useMutation();

  const handleAcceptRequest = async (
    requestId: number,
    username: string | null,
  ) => {
    await acceptRequestMutation.mutateAsync({
      requestId,
    });

    const description = username ? `You are now friends with ${username}!` : "";

    toast({
      title: "Friend request accepted",
      description: description,
      duration: 5000,
    });
  };

  const handleDeclineRequest = (requestId: number) => {
    declineRequestMutation.mutate({
      requestId,
    });

    toast({
      title: "Friend request declined",
      description: "You have declined a friend request.",
      duration: 5000,
    });
  };

  return (
    <div className="mb-6 text-gray-400 hover:text-gray-300">
      {/* <button type="button" className=" mb-6 text-gray-400 hover:text-gray-300">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
      </button> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="rounded-full">
            <BellIcon
              className="h-full w-full active:border-0"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-96"
          align="end"
          side="right"
          forceMount
        >
          <DropdownMenuLabel
            className="sticky items-center font-normal"
            asChild
          >
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Notifications</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="my-2">
            {pendingFriendRequests.length ? (
              pendingFriendRequests.map((request) => (
                <Fragment key={request.requestId}>
                  <div className="my-2 flex flex-1 justify-between">
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {request.username}
                        </p>
                        <p className="text-xs leading-none">
                          sent you a friend request
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <div className="flex gap-x-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleAcceptRequest(
                            request.requestId,
                            request.username,
                          )
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeclineRequest(request.requestId)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </Fragment>
              ))
            ) : (
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    No new friend requests
                  </p>
                </div>
              </DropdownMenuItem>
            )}
            {/* <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem> */}
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default NotificationButton;
