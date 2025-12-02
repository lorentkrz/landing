import type { User } from "../types";

export const profileRowToUser = (row: any): User => {
  const lastActive = row?.last_active_at ?? row?.updated_at ?? row?.created_at ?? null;
  const lastActiveDate = lastActive ? new Date(lastActive) : null;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  return {
    id: row.id,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    email: row.email ?? undefined,
    avatar:
      row.avatar_url ??
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop",
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    bio: row.bio ?? undefined,
    gender: row.gender ?? undefined,
    birthdate: row.birthdate ?? undefined,
    lastActive: lastActive ?? undefined,
    isOnline: lastActiveDate ? lastActiveDate.getTime() > fiveMinutesAgo : false,
  };
};
