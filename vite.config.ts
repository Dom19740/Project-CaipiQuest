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
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify("https://trggmzsqxodmftgygpqd.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZ2dtenNxeG9kbWZ0Z3lncHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDc2MDMsImV4cCI6MjA3NDgyMzYwM30.gZF6aoT6eQsKbxiggUilv5rwliLplkGARP5u0DujQMs"),
  },
}));