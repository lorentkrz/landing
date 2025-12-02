import { StatCard } from "@/components/cards/StatCard";
import { CreditAdjustForm, CreditRowActions } from "@/components/forms/CreditForm";
import { getSupabaseServer } from "@/lib/supabaseServer";

type LedgerRow = {
  id: string;
  user: string;
  type: string;
  amount: number;
  price?: number | null;
  createdAt: string;
};

type PackageSummary = {
  label: string;
  sold: number;
  revenue: number;
};

export default async function CreditsPage() {
  const supabase = getSupabaseServer();

  let ledgers: LedgerRow[] = [];
  let metrics = [
    { label: "Credits sold (24h)", value: "0", change: "Connect Supabase" },
    { label: "Credits redeemed", value: "0", change: "Lifetime" },
    { label: "Pending payouts", value: "0", change: "Manual" },
    { label: "Disputes", value: "0", change: "Chargebacks" },
  ];
  let packages: PackageSummary[] = [];
  let message = "Connect Supabase to view credit transactions.";

  if (supabase) {
    const now = new Date();
    const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("credit_transactions")
      .select(
        `
        id,
        amount,
        price,
        type,
        created_at,
        user:profiles!credit_transactions_user_id_fkey(first_name,last_name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      ledgers = data.map((row) => ({
        id: row.id,
        user: row.user ? `${row.user.first_name} ${row.user.last_name}` : "Unknown",
        type: row.type,
        amount: row.amount ?? 0,
        price: row.price,
        createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "—",
      }));

      const soldLast24 = data
        .filter((row) => row.created_at && row.created_at >= last24 && row.type === "purchase")
        .reduce((sum, row) => sum + (row.amount ?? 0), 0);

      const redeemed = data.filter((row) => row.type === "redeem").reduce((sum, row) => sum + (row.amount ?? 0), 0);
      const pendingPayouts = data.filter((row) => row.type === "purchase" && !row.price);
      const disputes = data.filter((row) => row.type === "chargeback");

      metrics = [
        { label: "Credits sold (24h)", value: soldLast24.toLocaleString(), change: "Purchases" },
        { label: "Credits redeemed", value: redeemed.toLocaleString(), change: "Lifetime" },
        { label: "Pending payouts", value: String(pendingPayouts.length), change: "Need settlement" },
        { label: "Disputes", value: String(disputes.length), change: "Chargebacks" },
      ];

      const packageMap = new Map<string, PackageSummary>();
      ledgers
        .filter((entry) => entry.type === "purchase")
        .forEach((entry) => {
          const bucket = entry.price ? `$${entry.price.toFixed(2)}` : "Custom";
          const current = packageMap.get(bucket) ?? { label: bucket, sold: 0, revenue: 0 };
          current.sold += entry.amount;
          current.revenue += entry.price ?? 0;
          packageMap.set(bucket, current);
        });
      packages = Array.from(packageMap.values()).sort((a, b) => b.revenue - a.revenue);

      message = ledgers.length === 0 ? "No transactions yet." : "";
    } else {
      message = "Unable to load transactions.";
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Credits</p>
        <h1 className="text-2xl font-semibold text-white">Ledger, payouts & packages</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi, index) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} variant={index === 3 ? "critical" : "default"} />
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Adjust credits</p>
        <p className="text-sm text-slate-400">Manually credit or debit a user. Purchases will count toward revenue; adjustments track ops decisions.</p>
        <div className="mt-4">
          <CreditAdjustForm />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Packages</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {packages.length === 0 ? (
              <p className="text-sm text-slate-400">{message}</p>
            ) : (
              packages.slice(0, 4).map((pkg) => (
                <div key={pkg.label} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4">
                  <p className="text-sm font-semibold text-white">{pkg.label}</p>
                  <p className="text-xs text-slate-500">{pkg.sold.toLocaleString()} credits sold</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-300">${pkg.revenue.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Collection notes</p>
          <p className="mt-2 text-sm text-slate-400">
            Hook this up to Stripe payouts to track when venue shares are automatically settled. Manual overrides can be logged via a future ERP form.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a]">
        {ledgers.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">{message}</p>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((entry) => (
                <tr key={entry.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-white">{entry.id}</td>
                  <td className="px-4 py-3">{entry.user}</td>
                  <td className="px-4 py-3 uppercase tracking-widest text-xs">{entry.type}</td>
                  <td className="px-4 py-3">{entry.amount}</td>
                  <td className="px-4 py-3">{entry.price ? `$${entry.price.toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3">{entry.createdAt}</td>
                  <td className="px-4 py-3">
                    <CreditRowActions transactionId={entry.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-slate-500">Data sourced from Supabase `credit_transactions` + `profiles`.</p>
    </div>
  );
}
