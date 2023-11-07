import { api } from "@/trpc/server";

import { RoomCapture } from "@/components/client/xr";

// async function SyncPage() {
async function SyncPage() {
  const currentUser = await api.users.getCurrentUser.query();

  return (
    <div className="flex items-center justify-center">
      <RoomCapture user={currentUser} />
    </div>
  );
}

export default SyncPage;
