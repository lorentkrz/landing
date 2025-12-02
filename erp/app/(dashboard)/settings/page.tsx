export default function SettingsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not configured";
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-white">Control center</h1>
      </header>
      <div className="space-y-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-lg font-semibold text-white">Supabase project</p>
          <p className="text-sm text-slate-400">{supabaseUrl}</p>
          <p className="text-xs text-slate-500">Service role configured: {hasServiceRole ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-lg font-semibold text-white">Roles & permissions</p>
          <p className="text-sm text-slate-400">
            Create Supabase auth entries with `vendor_admin` role to restrict ERP access. These screens will soon hook into role-based policies.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-lg font-semibold text-white">Branding</p>
          <p className="text-sm text-slate-400">Update theme tokens shared with the Expo app so operations stays on-brand.</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">Settings currently read from environment variables. Hook into Supabase tables for multi-admin editing.</p>
    </div>
  );
}
