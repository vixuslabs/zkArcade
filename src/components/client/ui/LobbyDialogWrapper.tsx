"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

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
} from "@/components/ui/dialog";

const InviteFriendsButton = dynamic(
  () => import("@/components/client/ui/InviteFriendsDialog"),
);

function LobbyDialogWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex w-1/2 flex-col items-center">
      <Dialog onOpenChange={() => setIsOpen((prev) => !prev)}>
        <DialogTrigger asChild>
          <Button variant="outline">Invite</Button>
        </DialogTrigger>
        {isOpen && <InviteFriendsButton setOpen={setIsOpen} />}
      </Dialog>
    </div>
  );

  // return (
  //   <Button asChild>
  //     {isOpen  && (
  //       <InviteFriendsButton
  //         setOpen={setIsOpen}
  //         className="relative flex w-1/2 flex-col items-center"
  //       />
  //     ) }
  //   </Button>
  // );
}

export default LobbyDialogWrapper;
