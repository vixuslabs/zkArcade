"use client";

import { useState, useEffect } from "react";
import { usePusherClient } from "@/pusher/client";
import { useUser } from "@clerk/nextjs";

import type { Dispatch, SetStateAction } from "react";
import type { PresenceChannel } from "pusher-js";

interface Player {
  username: string;
  firstName: string | null;
  imageUrl: string | null;
  ready: boolean;
  host: boolean;
  id?: string;
}

type PushMembers = Record<string, { username: string; imageUrl: string }>;

interface OnePlayerPush {
  id: string;
  info: {
    username: string;
    imageUrl: string;
  };
}

interface Members {
  count: number;
  members: PushMembers;
  me: OnePlayerPush;
  myID: string;
}

type LobbyEvents =
  | `client-joined`
  | `client-left`
  | `client-ready`
  | `client-not-ready`
  | `client-start-game`;

type EventCallback = (data: Player) => void;

type EventMap = Record<Partial<LobbyEvents>, EventCallback>;

export const useLobbyChannel = (
  initialPlayer: Player,
  lobbyId: string,
  isHost: boolean,
  events: EventMap,
): [Player[], Dispatch<SetStateAction<Player[]>>, PresenceChannel | null] => {
  const [players, setPlayers] = useState<Player[]>([initialPlayer]);
  const [channel, setChannel] = useState<PresenceChannel | null>(null);
  const { pusher, isLoading } = usePusherClient();

  const user = useUser();

  const newMemberHandler = (member: OnePlayerPush) => {
    console.log(member);
    console.log("member added");

    const id = member.id;
    const info = member.info;

    setPlayers((prev) => {
      const newPlayers = [
        ...prev,
        {
          username: info.username,
          firstName: null,
          imageUrl: info.imageUrl,
          ready: false,
          host: user.user?.id === member.id,
          id: id,
        },
      ];

      // channel?.trigger("client-joined", {
      //   players,
      // });

      console.log("checking if channel exists", channel);

      return newPlayers;
    });
  };

  const successHandler = (members: Members) => {
    console.log("members: ", members);
    if (isHost) return;

    const _players = Object.entries(members.members).map(
      ([memberId, member]) => {
        console.log("member: ", member);
        return {
          username: member.username,
          firstName: null,
          imageUrl: member.imageUrl,
          ready: false,
          host: user.user?.id === memberId,
          id: memberId,
        };
      },
    );

    setPlayers(_players.sort((a, b) => (a.host ? -1 : b.host ? 1 : 0)));
  };

  useEffect(() => {
    if (isLoading || !pusher) return;

    const localChannel: PresenceChannel = pusher.subscribe(
      `presence-lobby-${lobbyId}`,
    ) as PresenceChannel;

    if (!localChannel) {
      console.log("no channel");
      throw new Error("no channel");
    }

    setChannel(localChannel);

    // Bind additional events passed in
    Object.entries(events).forEach(([eventName, handler]) => {
      localChannel.bind(eventName, handler);
    });

    localChannel.bind("pusher:member_added", newMemberHandler);
    localChannel.bind("pusher:subscription_succeeded", successHandler);

    return () => {
      console.log("unsubscribing from lobby channel");
      Object.keys(events).forEach((eventName) => {
        localChannel.unbind(eventName);
      });
      localChannel.unbind("pusher:member_added", newMemberHandler);
      localChannel.unbind("pusher:subscription_succeeded", successHandler);

      // pusher.unsubscribe(`presence-lobby-${lobbyId}`);
      localChannel.unsubscribe();
      setChannel(null);
    };
  }, [isLoading]);

  return [players, setPlayers, channel];
};
