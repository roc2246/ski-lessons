import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // "/api": "http://localhost:2000", // your backend URL
      "/api": "https://ski-lessons-7410677781cb.herokuapp.com", // your backend URL
    },
  },
});
