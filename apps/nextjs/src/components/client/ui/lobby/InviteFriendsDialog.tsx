"use client";

import { Fragment } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";

function DialogCloseButton() {
  const friends = api.friendships.getUsersFriends.useQuery();
  const { lobbyId }: { lobbyId: string } = useParams();

  const invite = api.games.sendGameInvite.useMutation();

  const handleSendInvite = (id: string, username: string) => {
    if (!lobbyId) throw new Error("No lobbyId found");

    invite.mutate({
      receiverId: id,
      lobbyId,
    });

    toast({
      title: "Invite Sent!",
      description: `${username} has been invited to play!`,
      variant: "default",
      duration: 3000,
    });
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Challege a Friend to Play!</DialogTitle>
        <DialogDescription>May the best player win!</DialogDescription>
      </DialogHeader>

      {friends.isLoading && (
        <>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </>
      )}

      {friends.isSuccess && (
        <ScrollArea className="max-h-full">
          <ul className="divide-y divide-gray-100">
            {friends.data.map(({ username, imageUrl, id }) => (
              <Fragment key={username ?? id}>
                <li className="flex items-center justify-between gap-x-6 py-5">
                  <div className="flex min-w-0 gap-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          imageUrl
                            ? `/api/imageProxy?url=${encodeURIComponent(
                                imageUrl,
                              )}`
                            : undefined
                        }
                        alt="Profile Picture"
                      />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-auto">
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {username}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSendInvite(id, username)}
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
