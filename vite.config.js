import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import eslint from "vite-plugin-eslint";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    eslint({
      failOnError: true, // ❌ stops build if import errors exist
      failOnWarning: false,
    }),
  ],
});