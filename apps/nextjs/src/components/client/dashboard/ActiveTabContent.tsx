"use client";

import React from "react";
import { useDashboardTabContext } from "@/components/client/providers/DashboardTabProvider";

interface ActiveTabContentProps {
  home: React.ReactNode;
  friends: React.ReactNode;
  leaderboard: React.ReactNode;
  settings: React.ReactNode;
}

function ActiveTabContent({
  home,
  friends,
  leaderboard,
  settings,
}: ActiveTabContentProps) {
  const { activeTab } = useDashboardTabContext();

  return (
    <>
      {activeTab === "home" && home}
      {activeTab === "friends" && friends}
      {activeTab === "leaderboard" && leaderboard}
      {activeTab === "settings" && settings}
    </>
  );
}

export default ActiveTabContent;
