import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works under any GitHub Pages subpath
// (project page or user page) without hardcoding the repo name.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
