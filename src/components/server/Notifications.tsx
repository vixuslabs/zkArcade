import { NotificationButton } from "@/components/client/dashboard";

import { api } from "@/trpc/server";
import { clerkClient } from "@clerk/nextjs";

function Notifications() {
  return (
    <>
      <NotificationButton />
    </>
  );
}

export default Notifications;
