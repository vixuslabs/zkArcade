/* eslint @typescript-eslint/no-unsafe-call: 0 */ // for config, config defined as any
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */ // for module
/* eslint @typescript-eslint/no-unsafe-return: 0 */ // for config return

import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["three"],
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.glsl/,
      loader: "webpack-glsl-loader",
    });

    return config;
  },
};

export default config;
