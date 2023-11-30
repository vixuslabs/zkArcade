import type { Config } from "tailwindcss";

import baseConfig from "@hot-n-cold/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
