import { StatCard } from "@/components/cards/StatCard";
import { PayoutCreateForm, PayoutRowActions } from "@/components/forms/PayoutForm";
import type { Database } from "@/lib/database.types";
import { getSupabaseServer } from "@/lib/supabaseServer";

type PayoutRow = {
  partner: string;
  amount: number;
  transactions: number;
};

type MonthlyStat = {
  month: string;
  revenue: number;
  refunds: number;
};

type PayoutRecord = Database["public"]["Tables"]["payouts"]["Row"] & {
  venue?: { name: string | null; city: string | null } | null;
};

export default async function AccountingPage() {
  const supabase = getSupabaseServer();

  let payouts: PayoutRow[] = [];
  let payoutQueue: PayoutRecord[] = [];
  let monthly: MonthlyStat[] = [];
  let metrics = [
    { label: "Gross credits", value: "0", change: "Connect Supabase" },
    { label: "Refunds", value: "0", change: "Disputes" },
    { label: "Net revenue", value: "0", change: "Gross - refunds" },
    { label: "Payout queue", value: "0", change: "Ready to settle" },
  ];
  let message = "Connect Supabase to review payouts.";

  if (supabase) {
    const [{ data, error }, payoutResponse] = await Promise.all([
      supabase
        .from("credit_transactions")
        .select(
          `
        user_id,
        amount,
        type,
        price,
        created_at,
        user:profiles!credit_transactions_user_id_fkey(first_name,last_name)
      `,
        ),
      supabase
        .from("payouts")
        .select("id, venue_id, amount, status, scheduled_for, paid_at, notes, created_at, updated_at, venue:venues(name, city)")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (!error && data) {
      const gross = data.filter((row) => row.type === "purchase").reduce((sum, row) => sum + (row.amount ?? 0), 0);
      const refunds = data.filter((row) => row.type === "refund").reduce((sum, row) => sum + (row.amount ?? 0), 0);
      const net = gross - refunds;
      const pendingCredits = data.filter((row) => row.type === "purchase" && !row.price).length;

      metrics = [
        { label: "Gross credits", value: gross.toLocaleString(), change: "Purchases" },
        { label: "Refunds", value: refunds.toLocaleString(), change: "Chargebacks" },
        { label: "Net revenue", value: net.toLocaleString(), change: "Gross - refunds" },
        { label: "Payout queue", value: String(pendingCredits), change: "Need settlement" },
      ];

      const partnerMap = new Map<string, { total: number; count: number; label: string }>();
      const monthlyMap = new Map<string, { revenue: number; refunds: number }>();

      data.forEach((row) => {
        const monthKey = row.created_at ? new Date(row.created_at).toLocaleString("default", { month: "short", year: "numeric" }) : "Unknown";
        const monthEntry = monthlyMap.get(monthKey) ?? { revenue: 0, refunds: 0 };
        if (row.type === "purchase") {
          monthEntry.revenue += row.amount ?? 0;
          if (row.user_id && row.amount) {
            const label = row.user ? `${row.user.first_name} ${row.user.last_name}` : row.user_id;
            const existing = partnerMap.get(row.user_id) ?? { total: 0, count: 0, label };
            existing.total += row.amount;
            existing.count += 1;
            partnerMap.set(row.user_id, existing);
          }
        } else if (row.type === "refund") {
          monthEntry.refunds += row.amount ?? 0;
        }
        monthlyMap.set(monthKey, monthEntry);
      });

      payouts = Array.from(partnerMap.values())
        .map((value) => ({ partner: value.label, amount: value.total, transactions: value.count }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

      monthly = Array.from(monthlyMap.entries())
        .map(([month, dataPoint]) => ({ month, revenue: dataPoint.revenue, refunds: dataPoint.refunds }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      message = payouts.length === 0 ? "No purchases recorded yet." : "";
    } else {
      message = "Unable to load transactions.";
    }

    payoutQueue =
      payoutResponse.data?.map((row) => ({
        ...row,
        venue: row.venue ?? null,
      })) ?? [];
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Accounting</p>
        <h1 className="text-2xl font-semibold text-white">Revenue shares & invoices</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi, index) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} variant={index === 1 ? "critical" : "default"} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Queue payout</p>
          <p className="text-sm text-slate-400">Request or log a payout for a partner venue. Finance will approve and mark paid.</p>
          <div className="mt-4">
            <PayoutCreateForm />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Payout queue</p>
          {payoutQueue.length === 0 ? (
            <p className="text-sm text-slate-400">No payouts queued yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Venue</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Scheduled</th>
                    <th className="px-3 py-2">Paid at</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutQueue.map((payout) => (
                    <tr key={payout.id} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{payout.venue?.name ?? payout.venue_id ?? "Venue"}</span>
                          <span className="text-xs text-slate-500">{payout.venue?.city ?? "Unknown city"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">{payout.amount.toLocaleString()} credits</td>
                      <td className="px-3 py-2 capitalize">{payout.status}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {payout.scheduled_for ? new Date(payout.scheduled_for).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">{payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2">
                        <PayoutRowActions payout={{ id: payout.id, status: payout.status, notes: payout.notes }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Top venues / partners</p>
          {payouts.length === 0 ? (
            <p className="text-sm text-slate-400">{message}</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {payouts.map((payout) => (
                <div key={payout.partner} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4">
                  <p className="text-lg font-semibold text-white">{payout.partner}</p>
                  <p className="text-xs text-slate-500">{payout.transactions} transactions</p>
                  <p className="mt-2 text-xl font-semibold text-emerald-300">{payout.amount.toLocaleString()} credits</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Next steps</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>• Connect Stripe webhooks for automatic settlement.</li>
            <li>• Generate invoices per venue with tax breakdowns.</li>
            <li>• Export ledger CSV for accounting suite.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Monthly performance</p>
        {monthly.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No transaction history yet.</p>
        ) : (
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            {monthly.map((stat) => (
              <div key={stat.month} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-white">{stat.month}</p>
                  <p className="text-xs text-slate-500">Refunds {stat.refunds.toLocaleString()}</p>
                </div>
                <p className="text-lg font-semibold text-emerald-300">{stat.revenue.toLocaleString()} credits</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500">
        Data sourced from Supabase `credit_transactions` for revenue metrics and `payouts` for finance workflow. Extend with Stripe reconciliation jobs for
        production use.
      </p>
    </div>
  );
}
