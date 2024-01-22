import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import type { AppRouter } from "@zkarcade/api";

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_ENV === "production")
    return `https://zkarcade.vixuslabs.com`;
  if (process.env.VERCEL_ENV === "preview")
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  // return `https://localhost:${process.env.PORT ?? 3000}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
