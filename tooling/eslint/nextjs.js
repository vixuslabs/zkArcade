/** @type {import('eslint').Linter.Config} */
const config = {

    extends: ["plugin:@next/next/recommended"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
    // lettings shadcn be imported without error
    ignorePatterns: ["src/components/ui/**/*"]
  };
  
  module.exports = config;
  