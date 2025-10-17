import path from "path";
import { fileURLToPath } from "url";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  proxy: {
    "/s3": {
      target: "https://memory-forest-test.s3.ap-northeast-2.amazonaws.com",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/s3/, ""),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@page": path.resolve(__dirname, "./src/pages"),
      "@images": path.resolve(__dirname, "./src/assets/images/clothes"),
      "@calendar": path.resolve(__dirname, "./src/pages/Calendar"),
      "@store": path.resolve(__dirname, "./src/store"),
    },
  },
});
