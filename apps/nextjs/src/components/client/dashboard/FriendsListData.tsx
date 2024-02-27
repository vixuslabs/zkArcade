"use client";

import React, { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import { FriendProfileDialog } from ".";
import { FriendRowSkeleton } from "../skeletons";

const IS_EXTERNAL_LINK = true;

function FriendsListData() {
  const activeFriends = api.friendships.getUsersFriends.useQuery(
    {
      externalLink: IS_EXTERNAL_LINK,
    },
    {
      refetchOnWindowFocus: false,
      // refetchOnMount: false,
      cacheTime: 6000,
      trpc: {
        ssr: true,
      },
    },
  );

  if (activeFriends.error) {
    toast({
      title: "Error",
      description:
        "There was an error fetching your friends list. Please try again later.",
      variant: "destructive",
      duration: 5000,
    });

    return <></>;
  }

  if (activeFriends.data) {
    return (
      <ScrollArea
        type="scroll"
        className="z-20 max-h-48  overscroll-contain hover:scroll-ml-12 hover:overflow-scroll"
      >
        <ul className="divide-y divide-gray-100">
          {activeFriends.data.map(({ username, imageUrl, id }, i) => (
            <Fragment key={username ?? id}>
              <li
                className={cn(
                  i === activeFriends.data.length - 1
                    ? "-mb-4 gap-x-3"
                    : "gap-x-6",
                  "flex items-center justify-between py-5",
                )}
              >
                <div className="flex min-w-0 gap-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        IS_EXTERNAL_LINK
                          ? imageUrl ?? ""
                          : `/api/imageProxy?url=${encodeURIComponent(
                              imageUrl ?? "",
                            )}` ?? undefined
                      }
                      alt="Profile Picture"
                    />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-auto">
                    <p className="font-semibold leading-6">{username}</p>
                  </div>
                </div>
                <FriendProfileDialog
                  username={username}
                  imageUrl={imageUrl ?? ""}
                  id={id}
                />
              </li>
            </Fragment>
          ))}
        </ul>
      </ScrollArea>
    );
  }

  return (
    <>
      <FriendRowSkeleton />
      <Separator />
      <FriendRowSkeleton className="-mb-4" />
    </>
  );
}

export default FriendsListData;
