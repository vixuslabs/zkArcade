"use client";

import React, { Fragment, Suspense } from "react";
import { FriendRowSkeleton } from "@/components/client/skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { FriendsListData } from ".";

function FriendsListCard() {
  return (
    <>
      <Card className="w-full">
        <CardHeader className="items-center">
          <CardTitle>Friends</CardTitle>
          <CardDescription>Challenge friends to play!</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="min-h-96">
          <ScrollArea className="max-h-full">
            <Suspense fallback={<FriendRowSkeleton rows={2} />}>
              <FriendsListData />
            </Suspense>
          </ScrollArea>
        </CardContent>
        {/* <CardFooter>
          <button className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0">
            View all
          </button>
        </CardFooter> */}
      </Card>
    </>
  );
}

export default FriendsListCard;
