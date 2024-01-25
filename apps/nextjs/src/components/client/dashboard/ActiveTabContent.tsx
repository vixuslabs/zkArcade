"use client";

import React from "react";
import { useDashboardTabContext } from "@/components/client/providers/DashboardTabProvider";

interface ActiveTabContentProps {
  friends: React.ReactNode;
  settings: React.ReactNode;
}

function ActiveTabContent({ friends, settings }: ActiveTabContentProps) {
  const { activeTab } = useDashboardTabContext();

  return (
    <>
      {activeTab === "friends" && friends}
      {activeTab === "settings" && settings}
    </>
  );
}

export default ActiveTabContent;
