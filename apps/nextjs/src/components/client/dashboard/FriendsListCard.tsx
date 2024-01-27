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
          {/* <ScrollArea className="max-h-48 w-full"> */}
          <Suspense
            fallback={
              <>
                <FriendRowSkeleton />
                <Separator />
                <FriendRowSkeleton className="-mb-4" />
              </>
            }
          >
            <FriendsListData />
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}

export default FriendsListCard;
