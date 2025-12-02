import { StatCard } from "@/components/cards/StatCard";
import { CheckInCreateForm, CheckInRowActions } from "@/components/forms/CheckInForm";
import { getSupabaseServer } from "@/lib/supabaseServer";

type CheckInRow = {
  id: string;
  venue: string;
  city: string;
  user: string;
  createdAt: string;
  expiresAt: string;
  expiresAtValue: number;
  createdAtValue: number;
};

type VenueInsight = {
  venue: string;
  city: string;
  guests: number;
};

export default async function CheckInsPage() {
  const supabase = getSupabaseServer();

  let scanners: CheckInRow[] = [];
  let metrics = [
    { label: "Live check-ins", value: "0", change: "Realtime" },
    { label: "Venues active", value: "0", change: "Using QR" },
    { label: "Expiring soon", value: "0", change: "< 10 min" },
    { label: "Manual overrides", value: "0", change: "Requires review" },
  ];
  let venuesLive: VenueInsight[] = [];
  let expiring: CheckInRow[] = [];
  let message = "Connect Supabase to view check-ins.";

  if (supabase) {
    const reference = new Date();
    const nowIso = reference.toISOString();
    const tenMinutesTimestamp = reference.getTime() + 10 * 60 * 1000;

    const [{ data, error }, { data: active }] = await Promise.all([
      supabase
        .from("check_ins")
        .select(
          `
        id,
        created_at,
        expires_at,
        venue:venues(name, city),
        user:profiles!check_ins_user_id_fkey(first_name, last_name)
      `,
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("check_ins").select("id, venue_id").gte("expires_at", nowIso),
    ]);

    if (!error && data) {
      scanners = data.map((row) => {
        const createdAtValue = row.created_at ? new Date(row.created_at).getTime() : 0;
        const expiresAtValue = row.expires_at ? new Date(row.expires_at).getTime() : 0;
        return {
          id: row.id,
          venue: row.venue?.name ?? "Unknown venue",
          city: row.venue?.city ?? "Unknown city",
          user: row.user ? `${row.user.first_name} ${row.user.last_name}` : "Unknown guest",
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "—",
          expiresAt: row.expires_at ? new Date(row.expires_at).toLocaleString() : "—",
          createdAtValue,
          expiresAtValue,
        };
      });
      const activeCount = active?.length ?? 0;
      const venuesSet = new Set(active?.map((entry) => entry.venue_id).filter(Boolean));
      const expiringSoonCount = scanners.filter((checkIn) => checkIn.expiresAtValue > 0 && checkIn.expiresAtValue <= tenMinutesTimestamp).length;
      const manualCount = 0;

      metrics = [
        { label: "Live check-ins", value: String(activeCount), change: "Realtime" },
        { label: "Venues active", value: String(venuesSet.size), change: "Using QR" },
        { label: "Expiring soon", value: String(expiringSoonCount), change: "< 10 min" },
        { label: "Manual overrides", value: String(manualCount), change: "Requires review" },
      ];

      const venueMap = new Map<string, VenueInsight>();
      scanners.forEach((row) => {
        const key = `${row.venue}-${row.city}`;
        const current = venueMap.get(key) ?? { venue: row.venue, city: row.city, guests: 0 };
        current.guests += 1;
        venueMap.set(key, current);
      });
      venuesLive = Array.from(venueMap.values()).sort((a, b) => b.guests - a.guests).slice(0, 4);

      expiring = scanners
        .filter((row) => row.expiresAtValue > 0 && row.expiresAtValue <= tenMinutesTimestamp)
        .sort((a, b) => a.expiresAtValue - b.expiresAtValue)
        .slice(0, 5);

      message = scanners.length === 0 ? "No check-ins yet." : "";
    } else {
      message = "Unable to fetch check-ins.";
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Check-ins</p>
        <h1 className="text-2xl font-semibold text-white">Realtime QR telemetry</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi, index) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} variant={index === 2 ? "warning" : "default"} />
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Manual check-in</p>
        <p className="text-sm text-slate-400">Create a temporary check-in for guests who need human assistance. This will respect the same expiry timer.</p>
        <div className="mt-4">
          <CheckInCreateForm />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Venues live now</p>
            {venuesLive.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">{message}</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {venuesLive.map((venue) => (
                  <div key={`${venue.venue}-${venue.city}`} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-3">
                    <p className="text-sm font-semibold text-white">{venue.venue}</p>
                    <p className="text-xs text-slate-500">{venue.city}</p>
                    <p className="mt-1 text-xs text-white">{venue.guests} guests checked-in</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Expiring in next 10 minutes</p>
            {expiring.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No QR sessions expiring soon.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {expiring.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-xs text-slate-300">
                    <p className="font-semibold text-white">{entry.user}</p>
                    <p className="text-slate-500">
                      {entry.venue} · Expires {entry.expiresAt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Scanner health</p>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>Hardware heartbeat integration pending.</p>
            <p className="text-xs text-slate-500">Once scanners report status, this panel will show battery & connectivity.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a]">
        {scanners.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">{message}</p>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Check-in time</th>
                <th className="px-4 py-3">Expires at</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanners.map((scanner) => (
                <tr key={scanner.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-white">{scanner.user}</td>
                  <td className="px-4 py-3">{scanner.venue}</td>
                  <td className="px-4 py-3">{scanner.city}</td>
                  <td className="px-4 py-3">{scanner.createdAt}</td>
                  <td className="px-4 py-3">{scanner.expiresAt}</td>
                  <td className="px-4 py-3">
                    <CheckInRowActions checkInId={scanner.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-slate-500">Data streamed from Supabase `check_ins` joined with `venues` and `profiles`.</p>
    </div>
  );
}
