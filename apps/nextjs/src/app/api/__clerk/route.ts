import { env } from "@/env.mjs";

export default {
  async fetch(req: Request): Promise<Response> {
    const url = req.url.replace(
      env.NEXT_PUBLIC_CLERK_PROXY_URL,
      env.CLERK_FAPI,
    );
    const proxyReq = new Request(req, {
      redirect: "manual",
    });

    proxyReq.headers.set("Clerk-Proxy-Url", env.NEXT_PUBLIC_CLERK_PROXY_URL);
    proxyReq.headers.set("Clerk-Secret-Key", env.CLERK_SECRET_KEY);
    proxyReq.headers.set(
      "X-Forwarded-For",
      req.headers.get("CF-Connecting-IP") ?? "",
    );

    return fetch(url, proxyReq);
  },
};
