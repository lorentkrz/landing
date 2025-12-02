import { StatCard } from "@/components/cards/StatCard";
import { ConversationRowActions } from "@/components/forms/ConversationActions";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ConversationRow = {
  id: string;
  venue: string;
  participants: string[];
  createdAt: string;
  createdAtValue: number;
};

export default async function ConversationsPage() {
  const supabase = getSupabaseServer();

  let conversations: ConversationRow[] = [];
  let metrics = [
    { label: "Active rooms", value: "0", change: "Connect Supabase" },
    { label: "Avg participants", value: "0", change: "Per room" },
    { label: "Open disputes", value: "0", change: "Flagged" },
    { label: "Messages tracked", value: "0", change: "Connect Supabase" },
  ];
  let highlighted: ConversationRow[] = [];
  let message = "Connect Supabase to view conversations.";

  if (supabase) {
    const reference = new Date();
    const nowTimestamp = reference.getTime();
    const last60 = nowTimestamp - 60 * 60 * 1000;

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        created_at,
        venue:venues(name),
        participants:conversation_participants(
          profile:profiles(first_name,last_name)
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      conversations = data.map((row) => {
        const participantNames =
          row.participants?.map((participant) =>
            participant.profile ? `${participant.profile.first_name} ${participant.profile.last_name}` : "Unknown",
          ) ?? [];
        const createdAtValue = row.created_at ? new Date(row.created_at).getTime() : 0;
        return {
          id: row.id,
          venue: row.venue?.name ?? "Unknown venue",
          participants: participantNames,
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "—",
          createdAtValue,
        };
      });

      const activeRooms = conversations.filter((conversation) => conversation.createdAtValue >= last60).length;
      const avgParticipants = conversations.length
        ? conversations.reduce((sum, conv) => sum + conv.participants.length, 0) / conversations.length
        : 0;
      const disputes = conversations.filter((conversation) => conversation.participants.length >= 3).length;

      metrics = [
        { label: "Active rooms", value: String(activeRooms), change: "Last hour" },
        { label: "Avg participants", value: avgParticipants.toFixed(1), change: "Per room" },
        { label: "Open disputes", value: String(disputes), change: "3+ participants" },
        { label: "Messages tracked", value: "—", change: "Hook to Supabase `messages`" },
      ];

      highlighted = conversations.slice(0, 6);
      message = conversations.length === 0 ? "No conversations yet." : "";
    } else {
      message = "Unable to load conversations.";
    }
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Conversations</p>
        <h1 className="text-2xl font-semibold text-white">Moderate chats & disputes</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((kpi, index) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={kpi.change} variant={index === 2 ? "warning" : "default"} />
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Recent rooms</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {highlighted.length === 0 ? (
            <p className="text-sm text-slate-400">{message}</p>
          ) : (
            highlighted.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[#0c1227] p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-widest text-slate-500">{item.venue}</p>
                <p className="text-base font-semibold text-white">{item.id}</p>
                <p className="mt-1 text-xs text-slate-400">{item.participants.join(" · ") || "Participants not synced"}</p>
                <p className="text-xs text-slate-500">{item.createdAt}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[#0f172a]">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">{message}</p>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conversation) => (
                <tr key={conversation.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-white">{conversation.id}</td>
                  <td className="px-4 py-3">{conversation.venue}</td>
                  <td className="px-4 py-3">{conversation.participants.join(", ") || "—"}</td>
                  <td className="px-4 py-3">{conversation.createdAt}</td>
                  <td className="px-4 py-3">
                    <ConversationRowActions conversationId={conversation.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-slate-500">Powered by Supabase `conversations` + `conversation_participants`. Hook in the `messages` table for transcript review.</p>
    </div>
  );
}
