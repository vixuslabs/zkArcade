"use client";

import React, { Fragment, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";

function NotificationData() {
  const router = useRouter();

  const [pendingFriendRequests, pendingFriendRequestsData] =
    api.friendships.getAllRequestsToUser.useSuspenseQuery(
      {
        type: "pending",
      },
      {
        trpc: {
          ssr: true,
        },
      },
    );
  const [pendingGameInvites, pendingGameInvitesData] =
    api.games.getGameInvites.useSuspenseQuery(
      {
        role: "receiver",
        status: "pending",
      },
      {
        trpc: {
          ssr: true,
        },
      },
    );

  const allNotifications = useMemo(() => {
    const notifications = [...pendingFriendRequests, ...pendingGameInvites];

    notifications.sort((a, b) => {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });

    return notifications;
  }, [pendingFriendRequests, pendingGameInvites]);

  const acceptRequestMutation =
    api.friendships.acceptFriendRequest.useMutation();
  const declineRequestMutation =
    api.friendships.declineFriendRequest.useMutation();
  const acceptGameInviteMutation = api.games.acceptGameInvite.useMutation();
  const declineGameInviteMutation = api.games.declineGameInvite.useMutation();

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

    await pendingFriendRequestsData.refetch();

    // revalidatePath("/dashboard");
  };

  const handleDeclineFriendRequest = async (requestId: number) => {
    await declineRequestMutation.mutateAsync({
      requestId: requestId,
    });

    toast({
      title: "Friend request declined",
      description: "You have declined a friend request.",
      duration: 5000,
    });

    await pendingFriendRequestsData.refetch();

    // revalidatePath("/dashboard");
  };

  const handleAcceptGameInvite = async (lobbyId: string, url: string) => {
    await acceptGameInviteMutation.mutateAsync({
      lobbyId,
    });
    router.push(url);
    // revalidatePath("/dashboard", "layout");
  };

  const handleDeclineGameInvite = async (lobbyId: string) => {
    await declineGameInviteMutation.mutateAsync({
      lobbyId,
    });

    await pendingGameInvitesData.refetch();
  };

  return (
    <Suspense>
      {allNotifications.length > 0 ? (
        allNotifications.map((notification) => {
          if (notification.type === "gameInvite") {
            const noti = notification as (typeof pendingGameInvites)[0];

            return (
              <Fragment key={noti.gameId}>
                <div className="my-2 flex flex-1 justify-between">
                  <DropdownMenuItem disableBgAccent>
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
                        void handleDeclineGameInvite(noti.gameId);
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
          } else if (notification.type === "friendRequest") {
            const noti = notification as (typeof pendingFriendRequests)[0];

            return (
              <Fragment key={noti.requestId}>
                <div className="my-2 flex flex-1 justify-between">
                  <DropdownMenuItem disableBgAccent>
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
                        void handleDeclineFriendRequest(noti.requestId);
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </Fragment>
            );
          } else {
            return null;
          }
        })
      ) : (
        <DropdownMenuItem disableBgAccent>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              No new notifications
            </p>
          </div>
        </DropdownMenuItem>
      )}
    </Suspense>
  );
}

export default NotificationData;
