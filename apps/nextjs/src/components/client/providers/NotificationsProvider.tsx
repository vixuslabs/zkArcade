"use client";

import React, { useContext, createContext, useMemo } from "react";

// import { useFriendsProvider } from "./FriendsChannelProvider";

const NotificationsContext = createContext({});

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider",
    );
  }

  return context;
};

// Not currently in use
function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // const { pendingFriendRequests } = useFriendsProvider();

  const values = useMemo(() => ({}), []);

  return (
    <NotificationsContext.Provider value={values}>
      <>{children}</>
    </NotificationsContext.Provider>
  );
}

export default NotificationsProvider;
