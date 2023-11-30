import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

export const transformer = superjson;

import type { AppRouter } from "./src/root";

export type { AppRouter } from "./src/root";

export { appRouter } from "./src/root";
export { createTRPCContext } from "./src/trpc";

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
