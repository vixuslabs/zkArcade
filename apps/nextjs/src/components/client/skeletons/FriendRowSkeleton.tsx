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
    // <div className="flex items-center justify-between gap-x-6 py-5">
    //   <div className="flex min-w-0 gap-x-4">
    //     <Skeleton className="h-8 w-8 rounded-full" />
    //     <div className="min-w-0 flex-auto">
    //       <Skeleton className="mt-1 h-6 w-28 truncate leading-5" />
    //     </div>
    //   </div>
    //   <Skeleton className="ml-16 h-5 w-12 justify-end rounded-full" />
    // </div>
    <div className="flex items-center space-x-4 rounded-md px-4 py-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export { FriendRowSkeleton, FriendRowSkeletonItem };
