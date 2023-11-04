import type { Pointers } from "@/lib/types";

export const initialPointerState: Pointers = {
  left: {
    z: 0,
    state: "NOT_SET",
    heldObject: null,
  },
  right: {
    z: 0,
    state: "NOT_SET",
    heldObject: null,
  },
};
