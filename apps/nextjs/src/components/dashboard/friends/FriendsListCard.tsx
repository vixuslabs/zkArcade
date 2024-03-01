"use client";

import React, { Suspense } from "react";
import { FriendRowSkeleton } from "@/components/skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { FriendsListData } from "..";

function FriendsListCard() {
  return (
    <>
      <Card className="w-full">
        <CardHeader className="items-center">
          <CardTitle>Friends</CardTitle>
          <CardDescription>Challenge friends to play!</CardDescription>
        </CardHeader>
        {/* <Separator /> */}
        <CardContent className="min-h-96">
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
