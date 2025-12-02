"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
};

export const ModuleCard = ({ title, description, href }: ModuleCardProps) => (
  <Link
    href={href}
    className="rounded-2xl border border-[var(--border)] bg-[#0c1227] p-4 text-slate-200 transition hover:border-[#4dabf7]"
  >
    <div className="flex items-center justify-between">
      <p className="text-lg font-semibold text-white">{title}</p>
      <ArrowUpRight size={16} />
    </div>
    <p className="mt-2 text-sm text-slate-400">{description}</p>
  </Link>
);
