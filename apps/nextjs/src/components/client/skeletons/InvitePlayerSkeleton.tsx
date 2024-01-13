"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function InvitePlayersSkeleton({ rows = 1 }: { rows?: number }) {
  const arr = React.useMemo(() => {
    return Array.from({ length: rows }).map((_, i) => i);
  }, [rows]);
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {arr.map((i) => (
        <InvitePlayerSkeletonItem key={i} />
      ))}
    </div>
  );
}

function InvitePlayerSkeletonItem() {
  return (
    <div className="flex items-center justify-between gap-x-6 py-5">
      <div className="flex min-w-0 gap-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="min-w-0 flex-auto">
          <Skeleton className="mt-1 h-6 w-28 truncate leading-5" />
        </div>
      </div>
      <Skeleton className="ml-16 h-5 w-12 justify-end rounded-full" />
    </div>
  );
}

export { InvitePlayersSkeleton, InvitePlayerSkeletonItem };
