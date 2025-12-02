import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AdminProvider } from "@/components/providers/AdminProvider";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAuthenticatedAdmin();
  if (!session.admin) {
    redirect("/login");
  }

  return (
    <AdminProvider admin={session.admin}>
      <div className="flex min-h-screen bg-[var(--background)] text-slate-100">
        <Sidebar />
        <div className="flex w-full flex-col">
          <TopBar adminName={session.admin.displayName} adminRole={session.admin.role} />
          <main className="flex-1 bg-[var(--background)]">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
