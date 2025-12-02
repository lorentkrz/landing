import { GuideUpdateForm } from "@/components/forms/GuideForm";
import type { Database } from "@/lib/database.types";
import { getSupabaseServer } from "@/lib/supabaseServer";

type GuideRow = Database["public"]["Tables"]["app_guides"]["Row"];

export default async function GuidesPage() {
  const supabase = getSupabaseServer();
  let guides: GuideRow[] = [];

  if (supabase) {
    const { data } = await supabase.from("app_guides").select("*").order("slug");
    guides = data ?? [];
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-500">Guides</p>
        <h1 className="text-2xl font-semibold text-white">In-app tutorials</h1>
        <p className="text-sm text-slate-400">Edit the copy/steps that power “How to check in” and future guides.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {guides.length === 0 ? (
          <p className="text-sm text-slate-400">No guides found. Seed the `app_guides` table.</p>
        ) : (
          guides.map((guide) => (
            <div key={guide.id} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[#0f172a] p-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">{guide.slug}</p>
                <p className="text-lg font-semibold text-white">{guide.title}</p>
                <p className="text-sm text-slate-400">{guide.subtitle}</p>
              </div>
              <GuideUpdateForm guide={guide} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
