"use client";

import React, { useState, createContext, useContext, useMemo } from "react";

import { ActiveDashboardTabContext } from "@/lib/types";
import type { ActiveDashboardTab } from "@/lib/types";

const ActiveDashboardTabContext = createContext<ActiveDashboardTabContext>({
  activeTab: "friends",
  setActiveTab: () => {
    ("");
  },
});

export const useDashboardTabContext = () => {
  const context = useContext(ActiveDashboardTabContext);

  if (!context) {
    throw new Error(
      "useActiveDashboardTab must be used within a ActiveDashboardTabProvider",
    );
  }
  return context;
};

function DashboardTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveDashboardTab>("friends");

  const values = useMemo(() => {
    return {
      activeTab,
      setActiveTab,
    };
  }, [activeTab, setActiveTab]);

  return (
    <ActiveDashboardTabContext.Provider value={values}>
      {children}
    </ActiveDashboardTabContext.Provider>
  );
}

export default DashboardTabProvider;
