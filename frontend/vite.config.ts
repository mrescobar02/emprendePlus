import type { UserConfig } from "vite";
import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // redirige cualquier /advisor a http://localhost:8000/advisor
      "/advisor": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      
      "^/api/.*": {
      target: "http://localhost:8000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, "/api"),
    },
      
    },}
  // ...
} satisfies UserConfig;
