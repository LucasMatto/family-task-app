// testSupabase.js – registers a test user and verifies persistence in Supabase
import { supabase } from "../src/services/supabase.js";

async function run() {
  const email = `test_user_${Date.now()}@example.com`;
  const password = "Password123!";
  const firstName = "Test";
  const lastName = "User";
  const role = "Padre"; // change to 'Hijo' to test child insertion

  console.log("Registering user:", email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName, role } }
  });
  if (signUpError) throw signUpError;

  // Insert profile (mirroring AuthContext logic)
  const { error: insertError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    role
  });
  if (insertError) throw insertError;

  // If role is child, insert into children table
  if (role.toLowerCase() === "hijo" || role.toLowerCase() === "hija") {
    await supabase.from("children").insert({ user_id: signUpData.user.id, parent_id: null });
  }

  // Verify persistence
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();
  if (profileError) throw profileError;
  console.log("Profile persisted:", profile);

  // Cleanup: delete user and profile (and child if any)
  await supabase.from("profiles").delete().eq("email", email);
  await supabase.auth.api.deleteUser(signUpData.user.id);
  console.log("Cleanup completed.");
}

run().catch((e) => console.error("Error:", e));
