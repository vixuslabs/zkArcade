"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { useFriendsChannel } from "@/lib/hooks/useFriendsChannel";
import type {
  Invite,
  Notification,
  PendingFriendRequests,
  PusherClientContextValues,
  TaggedGameInvite,
  TaggedPendingFriendRequest,
  UserInfo,
} from "@/lib/types";
import { api } from "@/trpc/react";

const PusherClientContext = createContext<PusherClientContextValues>({
  activeFriends: [],
  pendingFriendRequests: [],
  gameInvites: [],
  allNotifications: [],
});

export const useFriendsProvider = () => {
  const context = useContext(PusherClientContext);
  if (!context) {
    throw new Error(
      "useFriendsProvider must be used within a FriendsChannelProvider",
    );
  }
  return context;
};

function FriendsChannelProvider({
  children,
  initFriendsInfo,
  initFriendRequests,
  initGameInvites,
}: {
  children: React.ReactNode;
  initFriendsInfo: UserInfo[];
  initFriendRequests: PendingFriendRequests[];
  initGameInvites: Invite[];
}) {
  const [activeFriends, setActiveFriends] =
    useState<UserInfo[]>(initFriendsInfo);
  const [pendingFriendRequests, setPendingFriendRequests] =
    useState<PendingFriendRequests[]>(initFriendRequests);
  const [gameInvites, setGameInvites] = useState<Invite[]>(initGameInvites);

  const acceptFriendRequestMutation =
    api.friendships.acceptFriendRequest.useMutation();
  const acceptGameInviteMutation = api.games.acceptGameInvite.useMutation();

  const router = useRouter();

  useFriendsChannel({
    "friend-added": (data) => {
      console.log("friend added", data);
      setPendingFriendRequests((prev) =>
        prev.filter((request) => request.sender.username !== data.username),
      );
      setActiveFriends((prev) => {
        return [
          ...prev,
          {
            username: data.username,
            imageUrl: data.imageUrl,
            id: data.id,
          },
        ];
      });
    },
    "friend-deleted": (data) => {
      console.log("friend deleted", data);
      setActiveFriends((prev) =>
        prev.filter((friend) => friend.id !== data.id),
      );
      toast({
        title: "Friend Deleted!",
        description: `${data.username} has been removed from your friends list.`,
        variant: "destructive",
        duration: 5000,
      });
    },
    "friend-request-pending": (data) => {
      console.log("friend request pending", data);
      if (!data.requestId) {
        throw new Error("No request id found");
      }

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

      setPendingFriendRequests((prev) => [
        ...prev,
        {
          requestId: data.requestId!,
          sender: {
            id: data.id,
            username: data.username,
            imageUrl: data.imageUrl,
          },
        },
      ]);
    },
    "invite-sent": (data) => {
      if (!data.gameId) {
        throw new Error("No game id found");
      }

      console.log("invite sent", data);

      setGameInvites((prev) => [
        ...prev,
        {
          gameId: data.gameId!,
          sender: {
            username: data.username,
            imageUrl: data.imageUrl,
            id: data.id,
          },
        },
      ]);

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

  const values = useMemo(() => {
    const taggedPendingFriendRequests: TaggedPendingFriendRequest[] =
      pendingFriendRequests.map((request) => ({
        ...request,
        type: "PendingFriendRequest" as const,
      }));

    const taggedGameInvites: TaggedGameInvite[] = gameInvites.map((invite) => ({
      ...invite,
      type: "GameInvite" as const,
    }));

    const allNotifications: Notification[] = [
      ...taggedPendingFriendRequests,
      ...taggedGameInvites,
    ];

    return {
      activeFriends,
      pendingFriendRequests,
      gameInvites,
      allNotifications,
    };
  }, [activeFriends, pendingFriendRequests, gameInvites]);

  return (
    <PusherClientContext.Provider value={values}>
      {children}
    </PusherClientContext.Provider>
  );
}

export default React.memo(FriendsChannelProvider);
