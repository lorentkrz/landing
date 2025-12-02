-- Enable row level security
alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.check_ins enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.connection_requests enable row level security;
alter table public.contact_book enable row level security;
alter table public.profile_photos enable row level security;
alter table public.user_activity enable row level security;
alter table public.admins enable row level security;
alter table public.app_guides enable row level security;

-- Profiles
create policy "Users can read their profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their profile" on public.profiles
  for update using (auth.uid() = id);

-- Venues
create policy "Public venues readable" on public.venues
  for select using (true);

-- Check-ins
create policy "Users read own checkins" on public.check_ins
  for select using (auth.uid() = user_id);

create policy "Users manage own checkins" on public.check_ins
  for insert with check (auth.uid() = user_id);

create policy "Users delete own checkins" on public.check_ins
  for delete using (auth.uid() = user_id);

-- Conversations & participants
create policy "Conversation visibility" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id and cp.profile_id = auth.uid()
    )
  );

create policy "Conversation insert" on public.conversations
  for insert with check (auth.uid() is not null);

create policy "Participants select" on public.conversation_participants
  for select using (auth.uid() = profile_id);

create policy "Participants insert" on public.conversation_participants
  for insert with check (auth.uid() = profile_id or auth.uid() is not null);

-- Messages
create policy "Conversation participants read messages" on public.messages
  for select using (
    auth.uid() in (
      select profile_id from public.conversation_participants
      where conversation_id = messages.conversation_id
    )
  );

create policy "Send message" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    auth.uid() in (
      select profile_id from public.conversation_participants
      where conversation_id = messages.conversation_id
    )
  );

-- Credits
create policy "Credit transactions owner" on public.credit_transactions
  for select using (auth.uid() = user_id);

create policy "Insert credit transaction" on public.credit_transactions
  for insert with check (auth.uid() = user_id);

-- Referrals
create policy "View own referrals" on public.referrals
  for select using (auth.uid() = inviter_id or auth.uid() = invitee_id);

create policy "Create referral record" on public.referrals
  for insert with check (auth.uid() = inviter_id);

-- Connection requests
create policy "Requests owner" on public.connection_requests
  for select using (auth.uid() in (sender_id, receiver_id));

create policy "Requests insert" on public.connection_requests
  for insert with check (auth.uid() = sender_id);

create policy "Requests update" on public.connection_requests
  for update using (auth.uid() in (sender_id, receiver_id));

-- Contact book
create policy "Contacts readable" on public.contact_book
  for select using (auth.uid() in (owner_id, contact_id));

create policy "Contacts insert" on public.contact_book
  for insert with check (auth.uid() in (owner_id, contact_id));

-- Profile photos
create policy "Profile photos read" on public.profile_photos
  for select using (auth.uid() = user_id);

create policy "Profile photos insert" on public.profile_photos
  for insert with check (auth.uid() = user_id);

create policy "Profile photos update" on public.profile_photos
  for update using (auth.uid() = user_id);

create policy "Profile photos delete" on public.profile_photos
  for delete using (auth.uid() = user_id);

-- User activity
create policy "Activity read" on public.user_activity
  for select using (auth.uid() = user_id);

create policy "Activity insert" on public.user_activity
  for insert with check (auth.uid() = user_id);

-- Admins (ERP operators)
create policy "Admins can view themselves" on public.admins
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = admins.profile_id and p.id = auth.uid()
    )
  );

create policy "Admins self-manage record" on public.admins
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = admins.profile_id and p.id = auth.uid()
    )
  );

create policy "Guides readable" on public.app_guides
  for select using (true);
