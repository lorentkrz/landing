import { StatCard } from "@/components/cards/StatCard";
import { VenueCreateForm, VenueRowActions } from "@/components/forms/VenueForm";
import { getSupabaseServer } from "@/lib/supabaseServer";

type VenueRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  type: string | null;
  rating: number | null;
  capacity: number | null;
  updated_at: string | null;
  checkIns: number;
};

type CityInsight = {
  city: string;
  venues: number;
  guests: number;
  capacity: number;
};

export default async function VenuesPage() {
  const supabase = getSupabaseServer();

  let venues: VenueRow[] = [];
  let metrics = [
    { label: "Total venues", value: "0", change: "Connect Supabase to list venues" },
    { label: "Venues w/ guests", value: "0", change: "Live check-ins" },
    { label: "Live check-ins", value: "0", change: "Realtime" },
    { label: "Avg capacity", value: "0", change: "Across all venues" },
  ];
  let spotlight: VenueRow[] = [];
  let cityInsights: CityInsight[] = [];
  let message = "Connect Supabase to list venues.";

  if (supabase) {
    const now = new Date();
    const [{ data, error }, activeCheckIns] = await Promise.all([
      supabase
        .from("venues")
        .select("id,name,city,country,type,rating,capacity,updated_at")
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase.from("check_ins").select("venue_id, expires_at").gte("expires_at", now.toISOString()),
    ]);

    if (!error && data) {
      const counts = new Map<string, number>();
      activeCheckIns.data?.forEach((entry) => {
        if (entry.venue_id) {
          counts.set(entry.venue_id, (counts.get(entry.venue_id) ?? 0) + 1);
        }
      });
      venues = data.map((venue) => ({
        ...venue,
        checkIns: counts.get(venue.id) ?? 0,
      }));
      const liveVenues = venues.filter((venue) => venue.checkIns > 0).length;
      const totalCapacity = venues.reduce((sum, venue) => sum + (venue.capacity ?? 0), 0);
      const activeGuests = activeCheckIns.data?.length ?? 0;
      const avgCapacity = venues.length > 0 ? Math.round(totalCapacity / venues.length) : 0;

      metrics = [
        { label: "Total venues", value: String(venues.length), change: "Latest sync" },
        { label: "Venues w/ guests", value: String(liveVenues), change: "Live check-ins" },
        { label: "Live check-ins", value: String(activeGuests), change: `${liveVenues} venues active` },
        { label: "Avg capacity", value: avgCapacity ? `${avgCapacity} ppl` : "0", change: "Across all venues" },
      ];

      spotlight = [...venues]
        .sort((a, b) => b.checkIns - a.checkIns)
        .slice(0, 4);

      const cityMap = new Map<string, CityInsight>();
      venues.forEach((venue) => {
        const key = venue.city ?? "Unassigned";
        const record = cityMap.get(key) ?? { city: key, venues: 0, guests: 0, capacity: 0 };
        record.venues += 1;
        record.guests += venue.checkIns;
        record.capacity += venue.capacity ?? 0;
        cityMap.set(key, record);
      });
      cityInsights = Array.from(cityMap.values()).sort((a, b) => b.guests - a.guests);
      message = venues.length === 0 ? "No venues have been created yet." : "";
    } else {
      message = "Unable to load venues. Check Supabase policies.";
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Venues</p>
        <h1 className="text-2xl font-semibold text-white">Manage locations & rooms</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} />
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Create venue</p>
            <h2 className="text-lg font-semibold text-white">Add a new location</h2>
          </div>
        </div>
        <div className="mt-4">
          <VenueCreateForm />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Spotlight</p>
              <h2 className="text-lg font-semibold text-white">Venues with the highest live presence</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {spotlight.length === 0 ? (
              <p className="text-sm text-slate-400">{message}</p>
            ) : (
              spotlight.map((venue) => (
                <div key={venue.id} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4">
                  <p className="text-sm uppercase tracking-widest text-slate-500">{venue.city ?? "Unassigned"}</p>
                  <p className="text-lg font-semibold text-white">{venue.name}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{venue.type ?? "Unknown type"}</span>
                    <span className="text-white">{venue.checkIns} guests live</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">City breakdown</p>
          <div className="mt-4 space-y-3">
            {cityInsights.length === 0 ? (
              <p className="text-sm text-slate-400">{message}</p>
            ) : (
              cityInsights.slice(0, 6).map((city) => (
                <div key={city.city} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{city.city}</p>
                    <p className="text-xs text-slate-500">
                      {city.venues} venues / {city.capacity ? `${city.capacity} cap` : "0 cap"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white">{city.guests} guests</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a]">
        {venues.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">{message}</p>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Check-ins (live)</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-white">{venue.name}</td>
                  <td className="px-4 py-3">{venue.city ?? "-"}</td>
                  <td className="px-4 py-3">{venue.type ?? "-"}</td>
                  <td className="px-4 py-3">{venue.capacity ? `${venue.capacity} ppl` : "-"}</td>
                  <td className="px-4 py-3">{venue.checkIns}</td>
                  <td className="px-4 py-3">{venue.rating ? venue.rating.toFixed(1) : "-"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{venue.updated_at ? new Date(venue.updated_at).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3">
                    <VenueRowActions
                      defaultValues={{
                        id: venue.id,
                        name: venue.name,
                        city: venue.city,
                        country: venue.country,
                        type: venue.type,
                        capacity: venue.capacity,
                        rating: venue.rating,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-slate-500">Data sourced from Supabase `venues` and `check_ins` tables.</p>
    </div>
  );
}
