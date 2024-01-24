"use client";

import React, { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import { FriendProfileDialog } from ".";

const IS_EXTERNAL_LINK = true;

function FriendsListData() {
  const [activeFriends, _] = api.friendships.getUsersFriends.useSuspenseQuery(
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

  return (
    <ScrollArea
      type="scroll"
      className="z-20 max-h-48  overscroll-contain hover:scroll-ml-12 hover:overflow-scroll"
    >
      <ul className="divide-y divide-gray-100">
        {activeFriends.map(({ username, imageUrl, id }, i) => (
          <Fragment key={username ?? id}>
            <li
              className={cn(
                i === activeFriends.length - 1 ? "-mb-4 gap-x-3" : "gap-x-6",
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
              {/* <button
              type="button"
              className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Invite
            </button> */}
              <FriendProfileDialog
                username={username}
                imageUrl={imageUrl ?? ""}
                id={id}
              />
            </li>
          </Fragment>
        ))}

        {activeFriends.length === 0 && <></>}
      </ul>
    </ScrollArea>
  );
}

export default FriendsListData;
