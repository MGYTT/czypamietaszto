import { createClient } from "@/lib/supabase/server";

export type AdminAccount = {
  id: string;
  email: string;
};

export async function getCurrentAdmin(): Promise<AdminAccount | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
  };
}