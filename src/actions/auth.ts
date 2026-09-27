"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginErrorCode =
  | "missing-fields"
  | "invalid-credentials"
  | "not-admin";

export async function loginAdmin(formData: FormData) {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  const email =
    typeof emailValue === "string"
      ? emailValue.trim().toLowerCase()
      : "";

  const password =
    typeof passwordValue === "string"
      ? passwordValue
      : "";

  if (!email || !password) {
    redirect("/admin/logowanie?error=missing-fields");
  }

  const supabase = await createClient();

  const {
    data: loginData,
    error: loginError,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError || !loginData.user) {
    redirect("/admin/logowanie?error=invalid-credentials");
  }

  const { data: adminAccount, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", loginData.user.id)
    .maybeSingle();

  if (adminError || !adminAccount) {
    await supabase.auth.signOut();
    redirect("/admin/logowanie?error=not-admin");
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/admin/logowanie");
}