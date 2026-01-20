import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@preload": resolve(__dirname, "src/preload"),
      "@database": resolve(__dirname, "src/main/database"),
      "@services": resolve(__dirname, "src/main/services"),
      "@repositories": resolve(__dirname, "src/main/repositories"),
      "@controllers": resolve(__dirname, "src/main/controllers"),
      "@utils": resolve(__dirname, "src/main/utils"),
      "@constants": resolve(__dirname, "src/main/constants"),
      "@errors": resolve(__dirname, "src/main/errors"),
      "@components": resolve(__dirname, "./src/renderer/components"),
      "@pages": resolve(__dirname, "./src/renderer/pages"),
      "@": resolve(__dirname, "./src/renderer"),
    },
  },
});
