"use client";

import React, { useState, createContext, useContext, useMemo } from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";

interface FriendsInfo {
  friends: {
    username: string;
    firstName: string | null;
    imageUrl: string;
    id?: string;
  }[];
}

function FriendsList({ friends }: FriendsInfo) {
  return (
    <>
      <Card className="w-full">
        <CardHeader className="items-center">
          <CardTitle>Friends</CardTitle>
          <CardDescription>Challenge friends to play!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <ul role="list" className="divide-y divide-gray-100">
            {friends.map(({ username, firstName, imageUrl, id }) => (
              <>
                <li
                  key={id ?? username}
                  className="flex items-center justify-between gap-x-6 py-5"
                >
                  <div className="flex min-w-0 gap-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={imageUrl} alt="Profile Picture" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {firstName}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {username}
                      </p>
                    </div>
                  </div>
                  <a
                    href={"#"}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Invite
                  </a>
                </li>
                <Separator />
              </>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <a
            href="#"
            className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
          >
            View all
          </a>
        </CardFooter>
      </Card>
    </>
  );
}

export default FriendsList;
