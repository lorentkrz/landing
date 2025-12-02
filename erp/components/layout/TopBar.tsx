"use client";

import { useMemo } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

type TopBarProps = {
  adminName: string;
  adminRole: string;
};

export const TopBar = ({ adminName, adminRole }: TopBarProps) => {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[#050b1b] px-6 py-4">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-sm text-slate-200">
        <Search size={16} className="text-slate-500" />
        <input className="bg-transparent outline-none placeholder:text-slate-500" placeholder="Search venues, users, scans..." />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-full border border-[var(--border)] p-2 text-slate-200 transition-colors hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-400" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-xs">
          <Image
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop"
            alt="Admin avatar"
            width={28}
            height={28}
            className="rounded-full"
          />
          <div className="leading-tight text-left">
            <p className="text-white">{adminName}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{adminRole}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-xs text-slate-300 transition hover:text-white"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </header>
  );
};
