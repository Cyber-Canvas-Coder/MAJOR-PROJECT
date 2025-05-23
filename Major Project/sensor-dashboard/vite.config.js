import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sensor_data.json": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
