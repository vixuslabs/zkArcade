"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { useFriendsChannel } from "@/lib/hooks/useFriendsChannel";
import { api } from "@/trpc/react";

function FriendsWS() {
  const router = useRouter();

  const acceptFriendRequestMutation =
    api.friendships.acceptFriendRequest.useMutation();
  const acceptGameInviteMutation = api.games.acceptGameInvite.useMutation();

  const pendingFriendRequests = api.friendships.getFriendRequests.useQuery(
    {
      role: "receiver",
      status: "pending",
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  const pendingGameInvites = api.games.getGameInvites.useQuery(
    {
      role: "receiver",
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  const friends = api.friendships.getUsersFriends.useQuery(
    {
      externalLink: true,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useFriendsChannel({
    "friend-added": (data) => {
      void friends.refetch();

      toast({
        title: "New Friend!",
        description: `${data.username} has been added to your friends list.`,
        variant: "default",
        duration: 5000,
      });
    },
    "friend-deleted": (data) => {
      void friends.refetch();

      toast({
        title: "Friend Deleted!",
        description: `${data.username} has been removed from your friends list.`,
        variant: "destructive",
        duration: 5000,
      });
    },
    "friend-request-pending": (data) => {
      if (!data.requestId) {
        throw new Error("No request id found");
      }

      void pendingFriendRequests.refetch();

      toast({
        title: "New Friend Request!",
        description: `Sent from ${data.username}`,
        duration: 5000,
        action: (
          <ToastAction
            altText="Accept"
            onClick={() => {
              acceptFriendRequestMutation.mutate({
                requestId: data.requestId!,
              });
            }}
          >
            Accept
          </ToastAction>
        ),
      });
    },
    "invite-sent": (data) => {
      if (!data.gameId) {
        throw new Error("No game id found");
      }
      if (!data.id) {
        throw new Error("No id found");
      }

      if (data.username === "") {
        console.log("username is empty");
      }

      // console.log("invite sent", data);

      // setGameInvites((prev) => [
      //   ...prev,
      //   {
      //     gameId: data.gameId!,
      //     sender: {
      //       username: data.username,
      //       imageUrl: data.imageUrl,
      //       id: data.id,
      //     },
      //   },
      // ]);

      void pendingGameInvites.refetch();

      toast({
        title: "New Game Invite!",
        description: `Sent from ${data.username}`,
        duration: 5000,
        action: (
          <ToastAction
            altText="Accept"
            onClick={() => {
              acceptGameInviteMutation.mutate({
                lobbyId: data.gameId!,
              });
              router.push(`/play/${data.username}/${data.gameId}`);
            }}
          >
            Join
          </ToastAction>
        ),
      });
    },
    "invite-accepted": (data) => {
      console.log("invite accepted", data);

      const { friendId, gameId } = data;

      if (!friendId || !gameId) {
        throw new Error("No friend id or game id found");
      }
    },
  });

  return (
    <>
      <></>
    </>
  );
}

export default FriendsWS;
