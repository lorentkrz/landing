-- Core database schema for the Nata app.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  first_name text not null,
  last_name text not null,
  city text,
  country text,
  bio text,
  avatar_url text,
  birthdate date,
  gender text,
  last_active_at timestamptz default now(),
  notifications_enabled boolean default true,
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  description text,
  address text,
  city text,
  country text,
  rating numeric(2, 1) default 4.5,
  image_url text,
  cover_image_url text,
  features text[],
  capacity int,
  open_hours text,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  map_visible boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id),
  created_at timestamptz default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  sent_at timestamptz default now(),
  expires_at timestamptz,
  is_read boolean default false
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount int not null,
  price numeric(8, 2) default 0,
  description text,
  type text check (type in ('purchase', 'debit')) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid references public.profiles(id) on delete cascade,
  invitee_id uuid references public.profiles(id),
  invitee_contact text,
  referral_code text not null unique,
  status text check (status in ('pending', 'joined', 'rewarded', 'revoked')) default 'pending',
  reward_inviter_credits int default 0,
  reward_invitee_credits int default 0,
  rewarded_at timestamptz,
  joined_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_referrals_inviter on public.referrals(inviter_id);
create index if not exists idx_referrals_code on public.referrals(referral_code);

create or replace function public.complete_referral(p_code text, p_invitee uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral public.referrals%rowtype;
begin
  select *
  into v_referral
  from public.referrals
  where referral_code = p_code
  for update;

  if not found then
    raise exception 'Invalid referral code';
  end if;

  if v_referral.status = 'revoked' then
    raise exception 'Referral revoked';
  end if;

  if v_referral.inviter_id = p_invitee then
    raise exception 'Cannot use your own referral code';
  end if;

  if v_referral.invitee_id is not null and v_referral.invitee_id <> p_invitee then
    raise exception 'Referral already used by another account';
  end if;

  update public.referrals
  set invitee_id = p_invitee,
      status = 'rewarded',
      joined_at = coalesce(joined_at, now()),
      rewarded_at = now(),
      updated_at = now()
  where id = v_referral.id;

  if coalesce(v_referral.reward_inviter_credits, 0) > 0 then
    insert into public.credit_transactions (user_id, amount, price, description, type, metadata)
    values (
      v_referral.inviter_id,
      v_referral.reward_inviter_credits,
      0,
      'Referral reward',
      'purchase',
      jsonb_build_object('referral_id', v_referral.id, 'code', v_referral.referral_code)
    );
  end if;

  if coalesce(v_referral.reward_invitee_credits, 0) > 0 then
    insert into public.credit_transactions (user_id, amount, price, description, type, metadata)
    values (
      p_invitee,
      v_referral.reward_invitee_credits,
      0,
      'Referral signup bonus',
      'purchase',
      jsonb_build_object('referral_id', v_referral.id, 'code', v_referral.referral_code)
    );
  end if;
end;
$$;

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  message text,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.contact_book (
  owner_id uuid references public.profiles(id) on delete cascade,
  contact_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (owner_id, contact_id)
);

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

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  email text not null unique,
  role text not null check (role in ('super_admin', 'ops', 'moderator', 'finance', 'vendor_admin')),
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now()
);

alter table public.venues
  add column if not exists latitude numeric(10, 6),
  add column if not exists longitude numeric(10, 6),
  add column if not exists map_visible boolean default true,
  add column if not exists is_featured boolean default false;

create table if not exists public.app_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  steps jsonb default '[]'::jsonb,
  media_url text,
  updated_at timestamptz default now()
);
