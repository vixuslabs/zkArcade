"use client";

import React, { useState, useMemo, useContext, createContext } from "react";

import { toast } from "@/components/ui/use-toast";
import { useFriendsChannel } from "@/lib/hooks/useFriendsChannel";

interface FriendInfo {
  username: string;
  firstName: string | null;
  imageUrl: string;
  id?: string;
}

type PendingFriendRequests = {
  requestId: number;
  imageUrl: string;
  username: string;
  firstName: string | null;
};

interface PusherClientContextValues {
  activeFriends: FriendInfo[];
  pendingFriendRequests: PendingFriendRequests[];
}

const PusherClientContext = createContext<PusherClientContextValues>({
  activeFriends: [],
  pendingFriendRequests: [],
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
  userId,
}: {
  children: React.ReactNode;
  initFriendsInfo: FriendInfo[];
  initFriendRequests: PendingFriendRequests[];
  userId: string;
}) {
  const [activeFriends, setActiveFriends] =
    useState<FriendInfo[]>(initFriendsInfo);
  const [pendingFriendRequests, setPendingFriendRequests] =
    useState<PendingFriendRequests[]>(initFriendRequests);

  useFriendsChannel({
    [`user:${userId}:friend-added`]: (data) => {
      console.log("friend added", data);
      setActiveFriends((prev) => [...prev, data]);

      if (data.showToast)
        toast({
          title: `New Friend!!`,
          description: `${data.username} accepted your friend request!`,
          variant: "default",
          duration: 5000,
        });
      else
        setPendingFriendRequests((prev) =>
          prev.filter((request) => request.username !== data.username),
        );
    },
    [`user:${userId}:friend-deleted`]: (data) => {
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
    [`user:${userId}:friend-request-pending`]: (data) => {
      if (!data.requestId) {
        throw new Error("No request id found");
      }

      toast({
        title: "New Friend Request!",
        description: `Sent from ${data.username}`,
        duration: 5000,
      });

      setPendingFriendRequests((prev) => [
        ...prev,
        {
          username: data.username,
          firstName: data.firstName,
          imageUrl: data.imageUrl,
          requestId: Number(data.requestId!),
        },
      ]);
    },
  });

  const values = useMemo(() => {
    return {
      activeFriends,
      pendingFriendRequests,
    };
  }, [activeFriends, pendingFriendRequests]);

  return (
    <PusherClientContext.Provider value={values}>
      {children}
    </PusherClientContext.Provider>
  );
}

export default FriendsChannelProvider;
