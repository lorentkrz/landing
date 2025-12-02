"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-none border-r border-[var(--border)] bg-[#050b1b] p-4 text-sm text-slate-200 md:flex md:flex-col">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-slate-500">Nata ERP</p>
        <p className="text-lg font-semibold text-white">Operations</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isActive ? "bg-[#1b1f3d] text-white" : "text-slate-400 hover:bg-[#101631] hover:text-white",
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-xl border border-[var(--border)] bg-[#0a1023] p-3 text-xs text-slate-400">
        <p className="font-semibold text-white">Status</p>
        <p className="mt-1">All services operational</p>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-emerald-400">Live</p>
      </div>
    </aside>
  );
};
