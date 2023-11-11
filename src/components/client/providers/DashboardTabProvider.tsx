"use client";

import React, { useState, createContext, useContext, useMemo } from "react";

import type {
  ActiveDashboardTabContext,
  ActiveDashboardTab,
} from "@/lib/types";

const ActiveDashboardTabContext = createContext<ActiveDashboardTabContext>({
  activeTab: "home",
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
  const [activeTab, setActiveTab] = useState<ActiveDashboardTab>("home");

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
