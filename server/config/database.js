const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// 🔗 Connexion Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Test Supabase connection
supabase
  .from("admin")
  .select("*", { count: "exact", head: true })
  .then(({ error }) => {
    if (error) {
      console.error("❌ Supabase connection error:", error.message);
    } else {
      console.log("✅ Supabase connecté");
    }
  });

module.exports = { supabase };
