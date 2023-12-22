"use client";

import React from "react";
import { useDashboardTabContext } from "@/components/client/providers/DashboardTabProvider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ChartPieIcon,
  CogIcon,
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

type ActiveDashboardTab = "home" | "friends" | "leaderboard" | "settings";

function SidebarNav() {
  const { activeTab, setActiveTab } = useDashboardTabContext();

  return (
    <Tabs
      defaultValue="home"
      role="list"
      className="h-[25vh] bg-inherit"
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
            value="home"
            className={cn(
              activeTab === "home"
                ? "border-r-8 border-r-gray-900 bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white",
              "group flex gap-x-3 rounded-none p-3 text-sm font-semibold leading-6",
            )}
          >
            <HomeIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          </TabsTrigger>
          <TabsTrigger
            value="friends"
            className={cn(
              activeTab === "friends"
                ? "border-r-8 border-r-gray-900 bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white",
              "group flex gap-x-3 rounded-none p-3 text-sm font-semibold leading-6",
            )}
          >
            <UsersIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className={cn(
              activeTab === "leaderboard"
                ? "border-r-8 border-r-gray-900 bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white",
              "group flex gap-x-3 rounded-none p-3 text-sm font-semibold leading-6",
            )}
          >
            <ChartPieIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className={cn(
              activeTab === "settings"
                ? "border-r-8 border-r-gray-900 bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white",
              "group flex gap-x-3 rounded-none p-3 text-sm font-semibold leading-6",
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
