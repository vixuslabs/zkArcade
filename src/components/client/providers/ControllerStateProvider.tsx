"use client";

import React, { useContext, useState, useCallback, useMemo } from "react";

import { initialPointerState } from "@/lib/constants";

import { PointerState, ControllerStateContextValue } from "@/lib/types";

const ControllerStateContext = React.createContext<
  ControllerStateContextValue | undefined
>(undefined);

export const useControllerStateContext = (): ControllerStateContextValue => {
  const context = useContext(ControllerStateContext);
  if (!context) {
    throw new Error("usePointerContext must be used within a PointerProvider");
  }
  return context;
};

function ControllerStateProvider({ children }: { children: React.ReactNode }) {
  const [pointers, setPointers] = useState(initialPointerState);

  const setLeftPointer = useCallback((data: PointerState) => {
    setPointers((prev) => ({
      ...prev,
      left: data,
    }));
  }, []);

  const setRightPointer = useCallback((data: PointerState) => {
    setPointers((prev) => ({
      ...prev,
      right: data,
    }));
  }, []);

  const values = useMemo(() => {
    return {
      pointers,
      setLeftPointer,
      setRightPointer,
    };
  }, [pointers, setLeftPointer, setRightPointer]);

  return (
    <ControllerStateContext.Provider value={values}>
      {children}
    </ControllerStateContext.Provider>
  );
}

export default ControllerStateProvider;
