"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  if (!email || !password) {
    return redirect(`/login?error=${encodeURIComponent("Preencha email e senha.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "Email ou senha incorretos."
        : error.message;
    return redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";
  redirect(safeRedirect);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
