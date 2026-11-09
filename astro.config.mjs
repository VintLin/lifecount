import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://vintlin.com",
  base: "/lifecount/",
  trailingSlash: "always",
  build: {
    format: "directory"
  }
});
