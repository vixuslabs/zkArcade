"use client";

import React from "react";
// import { Battleships } from "@/components/client/xr/zkBattleships/zkBattleship";
// import { Stage } from "@/components/client/xr/zkBattleships";
import { XRSetup } from "@/components/client/xr/zkBattleships/XRSetup";

export default function Page() {
  return (
    <div className="absolute h-full w-full">
      {/* <Stage /> */}
      <XRSetup />
    </div>
  );
}
