"use client";

import { useState, useEffect, useMemo } from "react";
import { usePusherClient } from "@/pusher/client";
import { usePathname } from "next/navigation";
import { env } from "@/env.mjs";

import type { Player } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";
import type { PresenceChannel } from "pusher-js";

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
  | `client-start-game`
  | "client-mina-on"
  | "client-mina-off";

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

  const pathname = usePathname();

  const hostName = useMemo(() => pathname.split("/")[1]!, [pathname]);

  const newMemberHandler = (member: OnePlayerPush) => {
    console.log(member);
    console.log("member added");

    const id = member.id;
    const info = member.info;

    setPlayers((prev) => {
      const newPlayers: Player[] = [];
      for (const player of prev) {
        newPlayers.push({
          ...player,
          publicKey: env.NEXT_PUBLIC_PUB_KEY1,
          privateKey: env.NEXT_PUBLIC_PRIV_KEY1,
        });
      }

      newPlayers.push({
        username: info.username,
        firstName: null,
        imageUrl: info.imageUrl,
        ready: false,
        // host: isCurrentHost,
        host: false,
        id: id,
        // publicKey: isCurrentHost ? pubKey1 : pubKey2,
        publicKey: env.NEXT_PUBLIC_PUB_KEY2,
        // privateKey: isCurrentHost ? privKey1 : privKey2,
        privateKey: env.NEXT_PUBLIC_PRIV_KEY2,
      });

      // const newPlayers = [{}];

      // channel?.trigger("client-joined", {
      //   players,
      // });

      console.log("checking if channel exists", channel);

      return newPlayers;
      // return newPlayers;
    });
  };

  const successHandler = (members: Members) => {
    console.log("members: ", members);
    if (isHost) return;

    const _players = Object.entries(members.members).map(
      ([memberId, member]) => {
        const isCurrentHost = member.username === hostName;

        console.log("member: ", member);
        return {
          username: member.username,
          firstName: null,
          imageUrl: member.imageUrl,
          ready: false,
          host: isCurrentHost,
          id: memberId,
          privateKey: isCurrentHost
            ? env.NEXT_PUBLIC_PRIV_KEY1
            : env.NEXT_PUBLIC_PRIV_KEY2,
          publicKey: isCurrentHost
            ? env.NEXT_PUBLIC_PUB_KEY1
            : env.NEXT_PUBLIC_PUB_KEY2,
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
