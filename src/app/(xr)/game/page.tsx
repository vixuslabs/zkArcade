import { api } from "@/trpc/server";

import { HotnColdGame } from "@/components/client/xr";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function GamePage() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/");

  const user = await api.users.getCurrentUser.query();

  return (
    <div className="flex items-center justify-center">
      <HotnColdGame user={user} />
    </div>
  );
}

export default GamePage;
