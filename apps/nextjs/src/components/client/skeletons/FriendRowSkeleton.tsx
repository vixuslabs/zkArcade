"use client";

import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FriendRowSkeleton({ rows = 1 }: { rows?: number }) {
  const arr = useMemo(() => {
    return Array.from({ length: rows }).map((_, i) => i);
  }, [rows]);

  return (
    <div className="flex flex-col">
      {arr.map((i) => (
        <FriendRowSkeletonItem key={i} />
      ))}
    </div>
  );
}

function FriendRowSkeletonItem() {
  return (
    <div className="flex items-center justify-between gap-x-4 py-5">
      <div className="mr-2 flex min-w-0">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="min-w-0 flex-auto">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <Skeleton className="h-1 w-2 rounded-full px-2.5 py-1" />
    </div>
  );
}

export { FriendRowSkeleton, FriendRowSkeletonItem };
