import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      proxy: {
        "/api": {
          target:
            mode === "development"
              ? "http://localhost:5000"
              : "https://myjek-api.srv1213369.hstgr.cloud",
          changeOrigin: true,
          secure: mode !== "development",
          ws: true,
        },
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
  };
});
