import { StatCard } from "@/components/cards/StatCard";
import { NotificationCreateForm } from "@/components/forms/NotificationForm";
import { getSupabaseServer } from "@/lib/supabaseServer";

type CampaignRow = {
  title: string;
  description: string;
  segment: string;
  createdAt: string;
  createdAtValue: number;
};

export default async function NotificationsPage() {
  const supabase = getSupabaseServer();

  let campaigns: CampaignRow[] = [];
  let metrics = [
    { label: "Campaigns (24h)", value: "0", change: "Connect Supabase" },
    { label: "Transactional", value: "0", change: "System events" },
    { label: "Segments", value: "0", change: "Targeted audiences" },
    { label: "Delivery errors", value: "0", change: "Provider feedback" },
  ];
  const segments: Record<string, number> = {};
  let message = "Connect Supabase to see activity.";

  if (supabase) {
    const reference = new Date();
    const nowTimestamp = reference.getTime();
    const last24 = nowTimestamp - 24 * 60 * 60 * 1000;

    const { data, error } = await supabase
      .from("user_activity")
      .select("title, description, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      campaigns = data.map((row) => {
        const createdAtValue = row.created_at ? new Date(row.created_at).getTime() : 0;
        const title = row.title ?? "Notification";
        const segment = title.includes("[segment:") ? title.split("[segment:")[1]?.split("]")[0] ?? "general" : "general";
        segments[segment] = (segments[segment] ?? 0) + 1;

        return {
          title,
          description: row.description ?? "—",
          segment,
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "—",
          createdAtValue,
        };
      });

      const campaigns24 = campaigns.filter((campaign) => campaign.createdAtValue >= last24).length;
      const transactional = campaigns.filter((campaign) => campaign.title.toLowerCase().includes("transactional")).length;

      metrics = [
        { label: "Campaigns (24h)", value: String(campaigns24), change: "Last day" },
        { label: "Transactional", value: String(transactional), change: "System events" },
        { label: "Segments", value: String(Object.keys(segments).length), change: "Targeted audiences" },
        { label: "Delivery errors", value: "0", change: "Hook provider logs" },
      ];

      message = campaigns.length === 0 ? "No activity logged yet." : "";
    } else {
      message = "Unable to load activity logs.";
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Notifications</p>
        <h1 className="text-2xl font-semibold text-white">Campaigns & transactional messaging</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi, index) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} variant={index === 3 ? "critical" : "default"} />
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Compose</p>
        <p className="text-sm text-slate-400">Log a campaign/notification. Segments help align with future push/email integrations.</p>
        <div className="mt-4">
          <NotificationCreateForm />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Recent campaigns</p>
          {campaigns.length === 0 ? (
            <p className="text-sm text-slate-400">{message}</p>
          ) : (
            campaigns.slice(0, 8).map((campaign) => (
              <div key={`${campaign.title}-${campaign.createdAt}`} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-white">{campaign.title.replace(/\[segment:.*?\]\s?/i, "")}</p>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs uppercase tracking-wide text-slate-400">
                    {campaign.segment}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{campaign.description}</p>
                <p className="text-xs text-slate-500">{campaign.createdAt}</p>
              </div>
            ))
          )}
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Segments</p>
          <div className="mt-4 space-y-3">
            {Object.keys(segments).length === 0 ? (
              <p className="text-sm text-slate-400">No segments detected. Prefix activity titles with `[segment:name]` to categorize.</p>
            ) : (
              Object.entries(segments).map(([segment, count]) => (
                <div key={segment} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-sm">
                  <span className="font-semibold text-white">{segment}</span>
                  <span className="text-xs text-slate-400">{count} sends</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Provider status</p>
        <p className="mt-2 text-sm text-slate-400">
          Connect FCM/APNs + email providers and write delivery logs back to Supabase for a full timeline. This placeholder shows where error counts and retry
          controls will live.
        </p>
      </section>

      <p className="text-xs text-slate-500">Currently backed by Supabase `user_activity`. Extend with dedicated notification tables or provider callbacks.</p>
    </div>
  );
}
