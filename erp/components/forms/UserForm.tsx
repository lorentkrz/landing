"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createProfile, deleteProfile, updateProfile, userActionInitialState, type UserActionState } from "@/lib/actions/users";

const FormField = ({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
}) => (
  <label className="flex flex-col text-xs text-slate-400">
    {label}
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
      className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
    />
  </label>
);

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-[#4dabf7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
      {pending ? "Saving…" : label}
    </button>
  );
};

export const UserCreateForm = () => {
  const [state, formAction] = useActionState<UserActionState, FormData>(createProfile, userActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <FormField label="Auth user ID" name="auth_id" />
        <FormField label="First name" name="first_name" />
        <FormField label="Last name" name="last_name" />
        <FormField label="City" name="city" />
        <FormField label="Country" name="country" />
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input type="checkbox" name="is_private" className="rounded border border-[var(--border)] bg-transparent" />
        Private profile
      </label>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <SubmitButton label="Create profile" />
    </form>
  );
};

export const UserEditForm = ({
  profile,
}: {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    city: string | null;
    country: string | null;
    bio: string | null;
    is_private: boolean | null;
  };
}) => {
  const [state, formAction] = useActionState<UserActionState, FormData>(updateProfile, userActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={profile.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="First name" name="first_name" defaultValue={profile.first_name} />
        <FormField label="Last name" name="last_name" defaultValue={profile.last_name} />
        <FormField label="City" name="city" defaultValue={profile.city} />
        <FormField label="Country" name="country" defaultValue={profile.country} />
      </div>
      <label className="flex flex-col text-xs text-slate-400">
        Bio
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          className="mt-1 min-h-[80px] rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input type="checkbox" name="is_private" defaultChecked={Boolean(profile.is_private)} className="rounded border border-[var(--border)] bg-transparent" />
        Private profile
      </label>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <SubmitButton label="Save profile" />
    </form>
  );
};

export const UserDeleteForm = ({ profileId }: { profileId: string }) => {
  const [state, formAction] = useActionState<UserActionState, FormData>(deleteProfile, userActionInitialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={profileId} />
      {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
      <button type="submit" className="rounded-xl border border-rose-500 px-3 py-1 text-xs text-rose-200">
        Delete profile
      </button>
    </form>
  );
};

export const UserRowActions = ({
  profile,
}: {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    city: string | null;
    country: string | null;
    bio: string | null;
    is_private: boolean | null;
  };
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-xs text-slate-400">
      <button
        type="button"
        className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-white"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Close" : "Edit"}
      </button>
      {open ? (
        <div className="mt-3 space-y-3 rounded-2xl border border-[var(--border)] bg-[#050b1b] p-3">
          <UserEditForm profile={profile} />
          <UserDeleteForm profileId={profile.id} />
        </div>
      ) : null}
    </div>
  );
};
