"use client";

import { Copy } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { MouseEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api } from "@/trpc/react";

function DialogCloseButton({
  // className,
  setOpen,
}: {
  // className?: string;
  setOpen: (open: boolean) => void;
}) {
  const friends = api.friendships.getUsersFriends.useQuery();

  const handleSendInvite = (id: string) => {
    console.log("invited");
    console.log(id);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Challege a Friend to Play!</DialogTitle>
        <DialogDescription>May the best player win!</DialogDescription>
      </DialogHeader>

      {friends.isLoading && <p>Loading...</p>}

      {friends.isSuccess && (
        <ScrollArea className="max-h-full">
          <ul role="list" className="divide-y divide-gray-100">
            {friends.data.map(({ username, firstName, imageUrl, id }) => (
              <Fragment key={username ?? id}>
                <li className="flex items-center justify-between gap-x-6 py-5">
                  <div className="flex min-w-0 gap-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={imageUrl ?? undefined}
                        alt="Profile Picture"
                      />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6">
                        {firstName}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {username}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSendInvite(id)}
                    variant="secondary"
                    key={id}
                    className="rounded-full shadow-sm "
                  >
                    Invite
                  </Button>
                </li>
                <Separator />
              </Fragment>
            ))}
          </ul>
        </ScrollArea>
      )}

      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default DialogCloseButton;
