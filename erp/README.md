## Nata ERP (web)

React + Next.js control room for every piece of the Nata ecosystem. It shares the same Supabase project as the mobile app and exposes admin tooling for venues, users, check-ins, credits, notifications, accounting, and platform settings.

### Tech stack

- Next.js 16 (App Router, React Server Components)
- Tailwind v4 design tokens
- Supabase JS client (shared tables with the Expo app)
- TypeScript + ESLint

### Getting started

1. Create `erp/.env.local` from the provided example:

   ```bash
   cp .env.example .env.local
   ```

   | Key                           | Description                                    |
   | ----------------------------- | ---------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`    | Same project URL used by the Expo app          |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key                                |
   | `SUPABASE_SERVICE_ROLE_KEY`   | (optional) for future server/admin operations |

2. Install dependencies (already run once, but repeat after pulling new commits):

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   # open http://localhost:3000 (login page: /login)
   ```

### Project structure

```
erp/
├─ app/
│  ├─ (auth)/login/page.tsx     // admin login screen
│  ├─ (dashboard)/layout.tsx    // sidebar + topbar shell (RBAC check)
│  ├─ (dashboard)/page.tsx      // overview KPI dashboard
│  ├─ (dashboard)/{venues,users,check-ins,credits,conversations,notifications,accounting,settings}
├─ lib/
│  ├─ env.ts, database.types.ts // typed Supabase helpers
│  ├─ auth.ts                   // server-side admin session helper
│  ├─ supabaseServer.ts         // service-role client for data fetching
│  └─ navigation.ts / utils.ts  // nav + cn helper
└─ components/
   ├─ layout/Sidebar, TopBar, cards/
   ├─ auth/LoginForm.tsx
   └─ providers/SupabaseProvider + AdminProvider
```

Every page currently renders live Supabase data read via the server service-role client. Hook CRUD/actions into dedicated API routes as backend endpoints become available:

- Venues: `venues`, `profile_photos`, `check_ins`
- Users: `profiles`, `connection_requests`, moderation tables
- Check-ins: `check_ins` + hardware diagnostics
- Credits: `credit_transactions`
- Conversations: `conversations`, `conversation_participants`, `messages`
- Notifications: custom tables / Supabase Functions (future)
- Accounting: `credit_transactions` + finance exports

### Admin access & RBAC
- Create a Supabase Auth user (email/password) and insert a row into `public.admins` with the matching email + role (`super_admin`, `ops`, etc.). Only admins with `is_active = true` are allowed into the ERP.
- Server layouts call `getAuthenticatedAdmin()` to enforce RBAC and redirect unauthorized users to `/login`.
- The TopBar sign-out action clears the Supabase session and returns to the login screen.

### Next steps

- Continue wiring Supabase RPCs/service routes for each module (CRUD + actions).
- Implement QR regeneration security, hardware heartbeat webhooks, audit logs, Stripe payouts, notification campaigns, etc., as outlined in `docs/ERP_OVERVIEW.md`.
