"use client";

import { XRCanvas } from "@coconut-xr/natuerlich/defaults";

import { Battleships } from "./zkBattleship";

export function XRStage() {
  return (
    <XRCanvas className="relative">
      <Battleships />
    </XRCanvas>
  );
}
