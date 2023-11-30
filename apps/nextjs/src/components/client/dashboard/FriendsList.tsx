"use client";

import React, { Fragment } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFriendsProvider } from "@/components/client/providers/FriendsChannelProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

function FriendsList() {
  const { activeFriends } = useFriendsProvider();

  return (
    <>
      <Card className="w-full">
        <CardHeader className="items-center">
          <CardTitle>Friends</CardTitle>
          <CardDescription>Challenge friends to play!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <ScrollArea className="max-h-full">
            <ul className="divide-y divide-gray-100">
              {activeFriends.map(({ username, firstName, imageUrl, id }) => (
                <Fragment key={username ?? id}>
                  <li className="flex items-center justify-between gap-x-6 py-5">
                    <div className="flex min-w-0 gap-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={imageUrl} alt="Profile Picture" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-auto">
                        <p className="font-semibold leading-6">{username}</p>
                        <p className="mt-1 truncate text-sm leading-5 text-gray-500">
                          {firstName}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Invite
                    </button>
                  </li>
                  <Separator />
                </Fragment>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <button
            className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
          >
            View all
          </button>
        </CardFooter>
      </Card>
    </>
  );
}

export default FriendsList;
