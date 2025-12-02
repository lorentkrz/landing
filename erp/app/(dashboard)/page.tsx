import { ModuleCard } from "@/components/cards/ModuleCard";
import { StatCard } from "@/components/cards/StatCard";
import { modules } from "@/lib/mockData";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Upcoming = { venue: string; meta: string; time: string }[];
type Alert = { title: string; description: string };

export default async function DashboardPage() {
  const supabase = getSupabaseServer();

  let metrics = [
    { label: "Venues live", value: "0", change: "Connect Supabase to see stats" },
    { label: "Active check-ins", value: "0", change: "—" },
    { label: "Credits sold (24h)", value: "0", change: "—" },
    { label: "New users (7d)", value: "0", change: "—" },
  ];
  let upcoming: Upcoming = [];
  const alerts: Alert[] = [];

  if (supabase) {
    const now = new Date();
    const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: venuesCount }, { count: checkInCount }, purchases, { count: newUsersCount }, pendingRequests, venueRows] =
      await Promise.all([
        supabase.from("venues").select("*", { count: "exact", head: true }),
        supabase.from("check_ins").select("*", { count: "exact", head: true }).gte("expires_at", now.toISOString()),
        supabase
          .from("credit_transactions")
          .select("amount, created_at")
          .eq("type", "purchase")
          .gte("created_at", last24),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", last7),
        supabase.from("connection_requests").select("id").eq("status", "pending"),
        supabase.from("venues").select("id, name, city, type, open_hours, updated_at").order("updated_at", { ascending: false }).limit(2),
      ]);

    const creditsSold =
      purchases.data?.reduce((sum, row) => {
        if (row.amount) return sum + row.amount;
        return sum;
      }, 0) ?? 0;

    metrics = [
      { label: "Venues live", value: String(venuesCount ?? 0), change: "Updated automatically" },
      { label: "Active check-ins", value: String(checkInCount ?? 0), change: "Last 2 hours" },
      { label: "Credits sold (24h)", value: creditsSold.toLocaleString(), change: `Across ${purchases.data?.length ?? 0} orders` },
      { label: "New users (7d)", value: String(newUsersCount ?? 0), change: "+ email verified" },
    ];

    if ((pendingRequests.data?.length ?? 0) > 0) {
      alerts.push({
        title: "Pending connection approvals",
        description: `${pendingRequests.data?.length ?? 0} introductions waiting in Requests.`,
      });
    }
    if ((checkInCount ?? 0) === 0) {
      alerts.push({
        title: "No live check-ins",
        description: "QR scanners are idle. Confirm venues are accepting guests.",
      });
    }

    upcoming = venueRows.data?.map((venue) => ({
      venue: venue.name,
      meta: `${venue.city ?? "Unknown city"} • ${venue.type}`,
      time: venue.open_hours ?? "Hours not set",
    })) ?? [];
  }

  if (alerts.length === 0) {
    alerts.push({ title: "All clear", description: "No outstanding issues detected." });
  }

  return (
    <div className="space-y-8 p-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Live pipeline</p>
              <h2 className="text-xl font-semibold text-white">Upcoming events & activations</h2>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400">No venues have been updated recently.</p>
            ) : (
              upcoming.map((event) => (
                <div key={event.venue} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4">
                  <p className="text-sm uppercase tracking-widest text-slate-500">{event.time}</p>
                  <p className="text-lg font-semibold text-white">{event.venue}</p>
                  <p className="text-xs text-slate-500">{event.meta}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Operational alerts</p>
          <div className="mt-4 space-y-4">
            {alerts.map((alert) => (
              <div key={alert.title} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4">
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="text-xs text-slate-400">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Modules</p>
            <h2 className="text-xl font-semibold text-white">Manage every moving part</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <ModuleCard key={module.href} title={module.name} description={module.description} href={module.href} />
          ))}
        </div>
      </section>
    </div>
  );
}
