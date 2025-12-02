import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  variant?: "default" | "warning" | "critical";
};

export const StatCard = ({ label, value, change, variant = "default" }: StatCardProps) => {
  const changeColor =
    variant === "critical" ? "text-rose-400" : variant === "warning" ? "text-amber-300" : "text-emerald-300";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {change ? <p className={cn("text-xs font-medium", changeColor)}>{change}</p> : null}
    </div>
  );
};
