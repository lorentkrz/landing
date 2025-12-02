import { StatCard } from "@/components/cards/StatCard";
import { ReferralUpdateForm } from "@/components/forms/ReferralForm";
import type { Database } from "@/lib/database.types";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ReferralRow = Database["public"]["Tables"]["referrals"]["Row"] & {
  inviter?: { first_name: string | null; last_name: string | null; email: string | null } | null;
  invitee?: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

const statusLabel: Record<ReferralRow["status"], string> = {
  pending: "Pending",
  joined: "Joined",
  rewarded: "Rewarded",
  revoked: "Revoked",
};

const statusColor: Record<ReferralRow["status"], string> = {
  pending: "#fbbf24",
  joined: "#60a5fa",
  rewarded: "#34d399",
  revoked: "#fb7185",
};

const getSuspiciousReferrals = (rows: ReferralRow[]) => {
  const thresholdMs = 14 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  return rows.filter((ref) => {
    if (ref.status !== "pending") return false;
    const created = ref.created_at ? new Date(ref.created_at).getTime() : 0;
    return created > 0 && now - created > thresholdMs;
  });
};

export default async function ReferralsPage() {
  const supabase = getSupabaseServer();

  let referrals: ReferralRow[] = [];
  let message = "Connect Supabase to manage referrals.";

  if (supabase) {
    const { data, error } = await supabase
      .from("referrals")
      .select(
        `
        *,
        inviter:profiles!referrals_inviter_id_fkey(first_name,last_name,email),
        invitee:profiles!referrals_invitee_id_fkey(first_name,last_name,email)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      referrals = data;
      message = referrals.length === 0 ? "No invites have been sent yet." : "";
    } else {
      message = "Unable to load referrals.";
    }
  }

  const totalInvites = referrals.length;
  const joined = referrals.filter((ref) => ref.status === "joined" || ref.status === "rewarded");
  const rewarded = referrals.filter((ref) => ref.status === "rewarded");
  const totalCredits = rewarded.reduce(
    (sum, ref) => sum + (ref.reward_inviter_credits ?? 0) + (ref.reward_invitee_credits ?? 0),
    0,
  );
  const conversionRate = totalInvites ? Math.round((joined.length / totalInvites) * 100) : 0;

  const suspicious = getSuspiciousReferrals(referrals);

  const topInviters = Object.values(
    referrals.reduce<Record<string, { inviter: ReferralRow["inviter"]; count: number; rewarded: number }>>(
      (acc, ref) => {
        if (!ref.inviter_id) return acc;
        if (!acc[ref.inviter_id]) {
          acc[ref.inviter_id] = {
            inviter: ref.inviter ?? null,
            count: 0,
            rewarded: 0,
          };
        }
        acc[ref.inviter_id].count += 1;
        if (ref.status === "rewarded") {
          acc[ref.inviter_id].rewarded += 1;
        }
        return acc;
      },
      {},
    ),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Referrals</p>
        <h1 className="text-2xl font-semibold text-white">Invite rewards & fraud monitoring</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total invites" value={String(totalInvites)} change={message || "Rolling 200"} />
        <StatCard label="Join rate" value={`${conversionRate}%`} change={`${joined.length} joined`} />
        <StatCard label="Rewarded" value={String(rewarded.length)} change="Paid out" />
        <StatCard label="Credits issued" value={totalCredits.toLocaleString()} change="Inviter + invitee" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Active referrals</p>
              <h2 className="text-lg font-semibold text-white">Latest invites</h2>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            {referrals.length === 0 ? (
              <p className="text-sm text-slate-400">{message}</p>
            ) : (
              <table className="w-full text-sm text-slate-300">
                <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Inviter</th>
                    <th className="px-3 py-2">Invitee</th>
                    <th className="px-3 py-2">Rewards</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2 font-semibold text-white">{referral.referral_code}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-white">
                            {referral.inviter?.first_name} {referral.inviter?.last_name}
                          </span>
                          <span className="text-xs text-slate-500">{referral.inviter?.email}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          {referral.invitee ? (
                            <>
                              <span className="text-white">
                                {referral.invitee.first_name} {referral.invitee.last_name}
                              </span>
                              <span className="text-xs text-slate-500">{referral.invitee.email}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">{referral.invitee_contact ?? "Pending"}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs text-slate-400">
                          <p>Inviter: {referral.reward_inviter_credits ?? 0}</p>
                          <p>Invitee: {referral.reward_invitee_credits ?? 0}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ backgroundColor: statusColor[referral.status], color: "#050b1b" }}
                        >
                          {statusLabel[referral.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <ReferralUpdateForm
                          referral={{
                            id: referral.id,
                            status: referral.status,
                            reward_inviter_credits: referral.reward_inviter_credits,
                            reward_invitee_credits: referral.reward_invitee_credits,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Potential abuse</p>
            {suspicious.length === 0 ? (
              <p className="text-sm text-slate-400">No pending invites older than 14 days.</p>
            ) : (
              <div className="space-y-3 text-sm text-slate-300">
                {suspicious.map((ref) => (
                  <div key={ref.id} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-3">
                    <p className="font-semibold text-white">{ref.referral_code}</p>
                    <p className="text-xs text-slate-500">
                      Sent {new Date(ref.created_at ?? "").toLocaleDateString()} • {ref.invitee_contact ?? "No contact"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Top inviters</p>
            {topInviters.length === 0 ? (
              <p className="text-sm text-slate-400">No inviters yet.</p>
            ) : (
              <div className="space-y-3 text-sm text-slate-300">
                {topInviters.map((item) => (
                  <div key={`${item.inviter?.email ?? ""}-${item.count}`} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2">
                    <div>
                      <p className="font-semibold text-white">
                        {item.inviter?.first_name} {item.inviter?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{item.inviter?.email ?? "Unknown"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{item.count} invites</p>
                      <p className="text-xs text-slate-500">{item.rewarded} rewarded</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
