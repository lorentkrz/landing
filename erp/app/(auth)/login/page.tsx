import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // Next.js 16 forbids mutating cookies here; ignore.
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const { data: adminRecord } = await supabase
      .from("admins")
      .select("id,is_active")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    if (adminRecord?.is_active) {
      redirect("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#03050f] to-[#0c1227] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[#050b1b]/90 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-slate-500">Nata ERP</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Operations access</h1>
        <p className="text-sm text-slate-400">Sign in with your admin credentials.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
