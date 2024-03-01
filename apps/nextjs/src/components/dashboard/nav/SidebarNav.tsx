"use client";

import React from "react";
import { useDashboardTabContext } from "@/components/providers/DashboardTabProvider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CogIcon, UsersIcon } from "@heroicons/react/24/outline";

type ActiveDashboardTab = "friends" | "settings";

function SidebarNav() {
  const { activeTab, setActiveTab } = useDashboardTabContext();

  return (
    <Tabs
      defaultValue="friends"
      role="list"
      className="h-[25vh]"
      onValueChange={(value) => {
        if (value !== activeTab) setActiveTab(value as ActiveDashboardTab);
      }}
      orientation="vertical"
      asChild
    >
      <TabsList
        aria-orientation="vertical"
        asChild
        className="flex flex-col items-center space-y-1"
      >
        <>
          <TabsTrigger
            value="friends"
            className={cn(
              activeTab === "friends"
                ? "border-r-8 border-r-primary bg-primary text-secondary"
                : "",
              "group flex gap-x-3 rounded-none p-3 text-sm font-semibold leading-6 hover:bg-primary hover:text-secondary",
            )}
          >
            <UsersIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className={cn(
              activeTab === "settings"
                ? "border-r-8 border-r-primary bg-primary text-secondary"
                : "",
              "group flex gap-x-3 rounded-none p-3 text-sm font-semibold leading-6 hover:bg-primary hover:text-secondary",
            )}
          >
            <CogIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          </TabsTrigger>
        </>
      </TabsList>
    </Tabs>
  );
}

export default SidebarNav;
