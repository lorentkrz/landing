import { StatCard } from "@/components/cards/StatCard";
import { UserCreateForm, UserRowActions } from "@/components/forms/UserForm";
import { getSupabaseServer } from "@/lib/supabaseServer";

type UserRow = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  city: string | null;
  country: string | null;
  lastActive: string;
  lastActiveDate: number;
  createdAt: number;
  flags: number;
  isPrivate: boolean | null;
  bio?: string | null;
};

type CityInsight = {
  city: string;
  users: number;
  active: number;
  privateProfiles: number;
};

export default async function UsersPage() {
  const supabase = getSupabaseServer();

  let users: UserRow[] = [];
  let metrics = [
    { label: "Total users", value: "0", change: "Connect Supabase" },
    { label: "Active (24h)", value: "0", change: "Last Seen" },
    { label: "Private profiles", value: "0", change: "Privacy toggled" },
    { label: "Pending reports", value: "0", change: "Requests awaiting review" },
  ];
  let flagged: UserRow[] = [];
  let newest: UserRow[] = [];
  let cityInsights: CityInsight[] = [];
  let message = "Connect Supabase to list users.";

  if (supabase) {
    const now = new Date();
    const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last24Timestamp = new Date(last24).getTime();

    const [profileResult, totalResult, activeResult, privateResult, pendingResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, first_name, last_name, city, country, last_active_at, is_private, created_at, bio")
        .order("last_active_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_active_at", last24),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_private", true),
      supabase.from("connection_requests").select("receiver_id").eq("status", "pending"),
    ]);

    if (!profileResult.error && profileResult.data) {
      const pendingCounts =
        pendingResult.data?.reduce<Record<string, number>>((acc, request) => {
          if (request.receiver_id) {
            acc[request.receiver_id] = (acc[request.receiver_id] ?? 0) + 1;
          }
          return acc;
        }, {}) ?? {};

      users = profileResult.data.map((row) => {
        const lastActiveDate = row.last_active_at ? new Date(row.last_active_at).getTime() : 0;
        const createdAt = row.created_at ? new Date(row.created_at).getTime() : 0;
        return {
          id: row.id,
          name: `${row.first_name} ${row.last_name}`,
          firstName: row.first_name,
          lastName: row.last_name,
          city: row.city,
          country: row.country,
          lastActive: row.last_active_at ? new Date(row.last_active_at).toLocaleString() : "Unknown",
          lastActiveDate,
          createdAt,
          flags: pendingCounts[row.id] ?? 0,
          isPrivate: row.is_private,
          bio: row.bio,
        };
      });

      const totalUsers = totalResult.count ?? users.length;
      const activeUsers = activeResult.count ?? users.filter((row) => row.lastActiveDate >= last24Timestamp).length;
      const privateProfiles = privateResult.count ?? users.filter((row) => row.isPrivate).length;
      const pendingReports = pendingResult.data?.length ?? 0;

      metrics = [
        { label: "Total users", value: String(totalUsers), change: "Profiles synced" },
        { label: "Active (24h)", value: String(activeUsers), change: "Last seen" },
        { label: "Private profiles", value: String(privateProfiles), change: "Ops visibility off" },
        { label: "Pending reports", value: String(pendingReports), change: "Requires moderation" },
      ];

      flagged = users
        .filter((user) => user.flags > 0)
        .sort((a, b) => b.flags - a.flags)
        .slice(0, 4);

      newest = [...users]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4);

      const cityMap = new Map<string, CityInsight>();
      users.forEach((user) => {
        const key = user.city ?? "Unassigned";
        const record = cityMap.get(key) ?? { city: key, users: 0, active: 0, privateProfiles: 0 };
        record.users += 1;
        if (user.lastActiveDate >= last24Timestamp) {
          record.active += 1;
        }
        if (user.isPrivate) {
          record.privateProfiles += 1;
        }
        cityMap.set(key, record);
      });
      cityInsights = Array.from(cityMap.values()).sort((a, b) => b.users - a.users);

      message = users.length === 0 ? "No profiles yet." : "";
    } else {
      message = "Unable to load profiles.";
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Users</p>
        <h1 className="text-2xl font-semibold text-white">Identity, verification & reports</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} />
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Create profile</p>
        <p className="text-sm text-slate-400">
          Enter the Supabase Auth user ID to create the matching profile record. Once the user logs into the mobile app they will inherit these details.
        </p>
        <div className="mt-4">
          <UserCreateForm />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Flagged for review</p>
            {flagged.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No pending reports right now.</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {flagged.map((user) => (
                  <div key={user.id} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-3">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.city ?? "Unassigned city"}</p>
                    <p className="mt-1 text-xs text-rose-300">{user.flags} open report(s)</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">New signups</p>
            {newest.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">{message}</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {newest.map((user) => (
                  <div key={user.id} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-3">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.country ?? "Unknown country"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown date"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Cities</p>
          <div className="mt-4 space-y-3">
            {cityInsights.length === 0 ? (
              <p className="text-sm text-slate-400">{message}</p>
            ) : (
              cityInsights.slice(0, 6).map((city) => (
                <div key={city.city} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{city.city}</p>
                    <p className="text-xs text-slate-500">
                      {city.users} users / {city.active} active
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{city.privateProfiles} private</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a]">
        {users.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">{message}</p>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Pending reports</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-white">{user.name}</td>
                  <td className="px-4 py-3">{user.city ?? "-"}</td>
                  <td className="px-4 py-3">{user.country ?? "-"}</td>
                  <td className="px-4 py-3">{user.lastActive}</td>
                  <td className="px-4 py-3">{user.flags}</td>
                  <td className="px-4 py-3">
                    <UserRowActions
                      profile={{
                        id: user.id,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        city: user.city,
                        country: user.country,
                        bio: user.bio ?? null,
                        is_private: user.isPrivate ?? null,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-slate-500">Data sourced from Supabase `profiles` + `connection_requests` for pending incidents.</p>
    </div>
  );
}
