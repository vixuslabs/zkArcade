import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@hot-n-cold/api";

export const api = createTRPCReact<AppRouter>();

export { type RouterInputs, type RouterOutputs } from "@hot-n-cold/api";
