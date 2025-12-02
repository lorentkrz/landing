"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createVenue,
  deleteVenue,
  updateVenue,
  venueActionInitialState,
  type VenueActionState,
} from "@/lib/actions/venues";

type BaseProps = {
  defaultValues?: {
    id?: string;
    name?: string;
    city?: string | null;
    country?: string | null;
    type?: string | null;
    capacity?: number | null;
    rating?: number | null;
  };
};

const Field = ({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
}) => (
  <label className="flex flex-col text-xs text-slate-400">
    {label}
    <input
      className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
    />
  </label>
);

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#4dabf7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
    >
      {pending ? "Saving…" : label}
    </button>
  );
};

export const VenueCreateForm = () => {
  const [state, formAction] = useActionState<VenueActionState, FormData>(createVenue, venueActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Name" name="name" />
        <Field label="City" name="city" />
        <Field label="Country" name="country" />
        <Field label="Type" name="type" />
        <Field label="Capacity" name="capacity" type="number" />
        <Field label="Rating" name="rating" type="number" />
      </div>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <SubmitButton label="Create venue" />
    </form>
  );
};

export const VenueEditForm = ({ defaultValues }: BaseProps) => {
  const [state, formAction] = useActionState<VenueActionState, FormData>(updateVenue, venueActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={defaultValues?.id} />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Name" name="name" defaultValue={defaultValues?.name ?? ""} />
        <Field label="City" name="city" defaultValue={defaultValues?.city ?? ""} />
        <Field label="Country" name="country" defaultValue={defaultValues?.country ?? ""} />
        <Field label="Type" name="type" defaultValue={defaultValues?.type ?? ""} />
        <Field label="Capacity" name="capacity" type="number" defaultValue={defaultValues?.capacity ?? ""} />
        <Field label="Rating" name="rating" type="number" defaultValue={defaultValues?.rating ?? ""} />
      </div>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <div className="flex items-center gap-3">
        <SubmitButton label="Save changes" />
      </div>
    </form>
  );
};

export const VenueDeleteForm = ({ venueId }: { venueId: string }) => {
  const [state, formAction] = useActionState<VenueActionState, FormData>(deleteVenue, venueActionInitialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={venueId} />
      {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
      <button type="submit" className="rounded-xl border border-rose-500 px-3 py-1 text-xs text-rose-200">
        Delete venue
      </button>
    </form>
  );
};

export const VenueRowActions = ({ defaultValues }: BaseProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!defaultValues?.id) return null;

  return (
    <div className="text-xs text-slate-400">
      <button
        type="button"
        className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-white"
        onClick={() => setIsEditing((prev) => !prev)}
      >
        {isEditing ? "Close" : "Edit"}
      </button>
      {isEditing ? (
        <div className="mt-3 space-y-3 rounded-2xl border border-[var(--border)] bg-[#050b1b] p-3">
          <VenueEditForm defaultValues={defaultValues} />
          <VenueDeleteForm venueId={defaultValues.id} />
        </div>
      ) : null}
    </div>
  );
};
