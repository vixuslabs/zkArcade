"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon } from "@heroicons/react/24/outline";

import { NotificationSkeleton } from "../../skeletons";
import NotificationData from "./NotificationsData";

function NotificationButton() {
  return (
    <div className="my-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="rounded-full">
            <BellIcon
              className="h-full w-full active:border-0"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-96"
          align="end"
          side="right"
          forceMount
        >
          <DropdownMenuLabel
            className="sticky items-center font-normal"
            asChild
          >
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Notifications</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="my-2">
            <Suspense fallback={<NotificationSkeleton />}>
              <NotificationData />
            </Suspense>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default NotificationButton;
