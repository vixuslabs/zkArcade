import { api } from "@/trpc/server";

import { HotnColdGame } from "@/components/client/xr";

async function GamePage() {
  const currentUser = await api.users.getCurrentUser.query();

  return (
    <div className="flex items-center justify-center">
      <HotnColdGame user={currentUser} />
    </div>
  );
}

export default GamePage;
