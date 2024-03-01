"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const InviteFriendsButton = dynamic(
  () => import("@/components/lobby/InviteFriendsDialog"),
);

function LobbyDialogWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex w-1/2 flex-col items-center">
      <Dialog onOpenChange={() => setIsOpen((prev) => !prev)}>
        <DialogTrigger asChild>
          <Button variant="outline">Invite</Button>
        </DialogTrigger>
        {isOpen && <InviteFriendsButton />}
      </Dialog>
    </div>
  );
}

export default LobbyDialogWrapper;
