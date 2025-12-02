## Supabase setup

This folder contains the SQL you need to bootstrap Supabase for the Nata app.

### Files

- `schema.sql` – creates all tables used by the mobile app.
- `policies.sql` – enables row level security and defines the policies that let the client read/write its own data.
- `seed.sql` – optional sample venue rows so the UI has data immediately.

### Applying the SQL

You can run the scripts from the Supabase SQL editor or via `psql`:

```bash
# 1) create tables
psql "$SUPABASE_DB_URL" -f supabase/schema.sql

# 2) enable RLS + policies
psql "$SUPABASE_DB_URL" -f supabase/policies.sql

# 3) optional demo data
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

> `profiles.id` references `auth.users.id`, so create users via Supabase Auth (email/password or magic links) before inserting profile rows.

### Environment variables

Create a `.env` file (there’s an `.env.example` to copy) so Expo loads the keys automatically:

```bash
cp .env.example .env
# then edit to include your real Supabase URL + anon key
```

### Notes

- `profiles.last_active_at` is updated whenever the client fetches the authenticated profile. The UI uses it to show “online” users.
- Client-side inserts (messages, conversations, requests, contacts, credits) all respect the policies in `policies.sql`. If you tighten policies in production, remember to replace the prototype logic that currently inserts rows on behalf of both users (conversation participants + contacts).
- The map module expects latitude/longitude + visibility flags on each venue. `schema.sql` already creates `latitude`, `longitude`, `map_visible`, and `is_featured` columns, so make sure your venue rows populate them (see `seed.sql` for an example).

### Profile gallery & activity tables

To power the profile photo grid and recent activity feed, run this snippet after the base schema:

```sql
alter table public.profiles add column if not exists notifications_enabled boolean default true;
alter table public.profiles add column if not exists is_private boolean default false;

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  image_url text not null,
  is_profile boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);
```

Finally, create a Supabase Storage bucket named `profile_photos` (dashboard → Storage). The app uploads gallery images there and stores the resulting public URL in `profile_photos.image_url`.

### Referral system + credit rewards

Invites/referrals live in `public.referrals`. Each row stores:

- `inviter_id`, optional `invitee_id`
- the shareable `referral_code`
- status (`pending`, `joined`, `rewarded`, `revoked`)
- credit amounts for inviter/invitee
- timestamps for joined/rewarded

When a referral code is redeemed we call the helper function `public.complete_referral(code text, invitee uuid)` which:

1. Locks the referral row (so it can only be used once)
2. Associates the new `invitee_id`
3. Inserts the credit transactions for both people in a single transaction

You can run the function manually from SQL if needed:

```sql
select public.complete_referral('NATA1234', '00000000-0000-0000-0000-000000000000');
```

ERP operators can view/refund invites and, if necessary, insert manual rows (set `reward_inviter_credits`/`reward_invitee_credits` to the appropriate bonus).

### In-app guides (“How to check in”)

Tutorial copy lives in `public.app_guides`. Seed data includes the `how-to-check-in` slug that powers the mobile onboarding modal. Each row stores:

- `slug` – unique key (e.g., `how-to-check-in`)
- `title`, `subtitle`, `media_url`
- `steps` – JSON array of `{ title, description }`

Update guides from the ERP “Guides” screen. Mobile clients fetch the guide dynamically and fall back to baked-in copy if the table is empty.

### Admin access table

ERP access is controlled through the public.admins table. After creating a Supabase Auth user + profile, insert a corresponding admin row:

`sql
insert into public.admins (profile_id, email, role)
values ('<profile-uuid>', 'ops@nata.app', 'super_admin');
`

Set is_active = true to enable login. Remove or set is_active = false to revoke access.

