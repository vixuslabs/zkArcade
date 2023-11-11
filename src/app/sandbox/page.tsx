import { api } from "@/trpc/server";

import { Sandbox } from "@/components/client/xr";

async function SyncPage() {
  const currentUser = await api.users.getCurrentUser.query();

  return (
    <div className="flex items-center justify-center">
      <Sandbox user={currentUser} />
    </div>
  );
}

export default SyncPage;
