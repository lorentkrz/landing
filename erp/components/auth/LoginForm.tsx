"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

export const LoginForm = () => {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    const { data: adminRecord } = await supabase
      .from("admins")
      .select("id,is_active")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!adminRecord || adminRecord.is_active === false) {
      await supabase.auth.signOut();
      setError("You do not have access to the ERP. Contact an administrator.");
      setIsLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-white" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-white outline-none focus:border-[#4dabf7]"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-white outline-none focus:border-[#4dabf7]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-[#4dabf7] py-2 font-semibold text-white disabled:opacity-70"
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
};
