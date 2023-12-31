"use client";

import React, { Fragment } from "react";
import { useRouter } from "next/navigation";
import { useFriendsProvider } from "@/components/client/providers/FriendsChannelProvider";
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
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { BellIcon } from "@heroicons/react/24/outline";

function NotificationButton() {
  const { allNotifications } = useFriendsProvider();
  const { user } = useUser();

  const router = useRouter();

  const acceptRequestMutation =
    api.friendships.acceptFriendRequest.useMutation();
  const declineRequestMutation =
    api.friendships.declineFriendRequest.useMutation();
  const acceptGameInviteMutation = api.games.acceptGameInvite.useMutation();

  const handleAcceptFriendRequest = async (
    requestId: number,
    username: string | null,
  ) => {
    await acceptRequestMutation.mutateAsync({
      requestId: requestId,
    });

    const description = username ? `You are now friends with ${username}!` : "";

    toast({
      title: "Friend request accepted",
      description: description,
      duration: 5000,
    });
  };

  const handleDeclineFriendRequest = (requestId: number) => {
    declineRequestMutation.mutate({
      requestId: requestId,
    });

    toast({
      title: "Friend request declined",
      description: "You have declined a friend request.",
      duration: 5000,
    });
  };

  const handleAcceptGameInvite = (gameId: string, url: string) => {
    acceptGameInviteMutation.mutate({
      lobbyId: gameId,
    });
    router.push(url);
  };

  return (
    <div className="mb-6 text-gray-400 hover:text-gray-300">
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
            {allNotifications.length ? (
              allNotifications.map((noti) => {
                if (noti.type === "GameInvite") {
                  if (!user || noti.sender.username === user.username) return;
                  return (
                    <Fragment key={noti.gameId}>
                      <div className="my-2 flex flex-1 justify-between">
                        <DropdownMenuItem>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {noti.sender.username} invited you to a game!
                            </p>
                          </div>
                        </DropdownMenuItem>
                        <div className="flex gap-x-2">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              void handleAcceptGameInvite(
                                noti.gameId,
                                `/play/${noti.sender.username}/${noti.gameId}`,
                              )
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              console.log("cannot decline rn");
                              // handleDeclineGameInvite(
                              //   noti.gameId,
                              //   noti.sender.username,
                              // );
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Fragment>
                  );
                } else if (noti.type === "PendingFriendRequest") {
                  return (
                    <Fragment key={noti.requestId}>
                      <div className="my-2 flex flex-1 justify-between">
                        <DropdownMenuItem>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {noti.sender.username} sent you a friend request!
                            </p>
                          </div>
                        </DropdownMenuItem>
                        <div className="flex gap-x-2">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              console.log("accepting friend request");
                              void handleAcceptFriendRequest(
                                noti.requestId,
                                noti.sender.username,
                              );
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              handleDeclineFriendRequest(noti.requestId);
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Fragment>
                  );
                }
              })
            ) : (
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    No new notifications
                  </p>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default NotificationButton;
