import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

// Load .env when running in a Node environment (e.g., for server‑side scripts or tests)
if (typeof import.meta?.env === "undefined") {
  loadEnv({ path: "./.env" });
}

// Vite injects environment variables prefixed with VITE_ at build time.
// In the browser we rely on import.meta.env only.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
