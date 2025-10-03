import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Removed the define block for Supabase keys.
  // Vite will now automatically pick up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  // from your .env file locally or from Vercel environment variables during deployment.
}));