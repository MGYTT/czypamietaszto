import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/supabase/admin";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/logowanie");
  }

  return (
    <AdminShell adminEmail={admin.email}>
      {children}
    </AdminShell>
  );
}