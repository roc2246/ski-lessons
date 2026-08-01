import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

const apiProxyTarget =
  process.env.VITE_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:2000"
    : "https://ski-lessons-7410677781cb.herokuapp.com");

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": apiProxyTarget,
    },
  },
});
