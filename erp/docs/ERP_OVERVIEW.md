# Nata ERP — Complete Operations & Product Control Room (expanded, SA-aligned)

## 0 — Quick summary (one-paragraph)

Nata ERP is the admin/control web app for NataApp2. It reads/writes the same Supabase project via a service-role server client, manages venues, users, check-ins, credits, events, moderation and finance, and exposes dashboards, alerts and direct actions venue owners / staff / operator roles need to run the nightlife platform reliably. It must provide secure RBAC, realtime check-in streams & hardware health, financial reconciliation, audit logs, data exports and integrations (Stripe/QuickBooks, push services), plus operational tooling: runbooks, monitoring, backups and CI/CD.

## 1 — Goals & non-goals

### Goals
- Full CRUD for Venues, Users, Events, Check-ins, Credits.
- Realtime visibility of in-venue activity and hardware health.
- Strong RBAC with admin + venue owner scopes.
- Finance workflows: credit adjustments, payouts, invoices.
- Moderation, dispute resolution, and audit trails.
- Easy dashboards + exports for venue owners and accounting.

### Non-goals (initial)
- Replace full POS systems of venues — ERP surfaces data & integrations only.
- Complex ML recommendations in Phase 1 (can be Phase 3).

## 2 — High-level architecture (logical)
- UI: Next.js (App Router) + Tailwind + TypeScript.
- Backend: Next.js server functions using `lib/supabaseServer.ts` (service role key) + small Node workers for heavy jobs (optional).
- DB: Supabase (Postgres) — tables below.
- Realtime: Supabase Realtime (or dedicated WebSocket service for scaling).
- Storage: Supabase Storage for images/receipts.
- Payments: Stripe (connect for venue payouts) + webhook handler.
- Scheduler & jobs: serverless cron (Vercel/Cloud Run) or small worker queue (BullMQ/Redis or Supabase Edge Functions).
- Observability: Sentry + Prometheus/Grafana (or Datadog) + Supabase audit logs.
- Deployment: Vercel for Next.js, Supabase managed DB.

## 3 — Expanded modules & responsibilities

### 3.1 Overview (Dashboard)
**Data sources**: `venues`, `check_ins`, `credit_transactions`, `profiles`, `hardware_status`, `alerts`.

**UI**: KPI cards (active venues, last 24h check-ins, revenue), live activity feed (recent check-ins + incidents), alerts panel, top venues by traffic.

**Operator actions**: Acknowledge alerts, create incident, contact venue, degrade/unpublish venue.

**Needs**: time filters, city filter, CSV export, charting (line, bar), realtime stream.

### 3.2 Venues
**Data**: venue metadata, images, QR config, capacities, owner(s), tags, settings (age limits, featured).

**UI**: list + detail. Detail has tabs: overview, check-ins (latest N), images, photos moderation, analytics.

**Actions**: edit venue, upload images, regenerate QR, pause venue, set featured, set promotional banners.

**API**: CRUD endpoints, image upload to Supabase Storage signed URLs, QR regeneration endpoint.

### 3.3 Users (Profiles)
**Data**: profile, verification status, reported count, last seen, check-in history, credits.

**UI**: list, profile detail, connection requests, reports, ban/soft-ban controls.

**Actions**: suspend/reactivate, adjust credits, review reported content, mark verified.

**Need**: admin impersonation (read-only) for debugging with audit logs.

### 3.4 Check-ins
**Data**: `check_ins` table with timestamp, venue_id, profile_id, device_id, checkin_method (qr, manual), scanner_id, hardware_status snapshot.

**UI**: recent check-ins table, filters, per-venue stream, per-profile history.

**Actions**: refund/remove check-in (rare), mark false positive, export check-in logs.

**Realtime**: stream new check-ins; for scaling, use Supabase Realtime or a dedicated socket.

### 3.5 Credits & Accounting
**Data**: `credit_transactions`, `credit_balance`, invoices, payouts.

**UI**: ledger view (filter by user / venue), payout queue, export CSV, reconciliation view.

**Actions**: manual credit adjustments (with reason), refund, create payout, approve payouts, generate invoices, attach receipts.

**Integration**: Stripe for payments, QuickBooks or Xero for accounting exports.

### 3.6 Conversations & Moderation
**Data**: rooms, participants, messages (store minimal), transcripts (optional), flags.

**UI**: recent rooms, open flagged messages, conversation viewer, transcript download, dispute case workflow.

**Actions**: warn, delete message, suspend user, escalate to legal.

**Privacy**: retention policy and redaction for GDPR.

### 3.7 Notifications / Campaigns
**Data**: push templates, campaign schedule, segments.

**UI**: composer: audience selection (e.g., active in last 30d in city X), preview, send now / schedule.

**Actions**: send test, send campaign, view delivery statistics.

**Integration**: FCM & APNs via push service; email via provider (SendGrid/Mailgun).

### 3.8 Accounting (Finance)
**Data**: aggregated `credit_transactions`, Stripe payouts, fees, invoices.

**UI**: revenue by venue, monthly revenue, refunds, taxes calculation.

**Actions**: export to CSV, send invoice, reconcile payouts.

**Integration**: Stripe webhooks handler, CSV exports for QuickBooks.

### 3.9 Settings & Admin
**Data**: environment config, feature flags, API keys (masked), admin users & roles.

**UI**: project info (Supabase URL), role management, feature toggle UI, branding assets upload.

**Actions**: add admin, change roles, rotate keys (instructions).

## 4 — Database design (tables + key columns)
See `spec` above for full list: `profiles`, `venues`, `check_ins`, `credit_transactions`, `events`, `conversations/messages`, `admins`, `hardware_status`, `audit_logs`, `notifications/campaigns`. All include timestamps and necessary indexing. (Refer to “Data model examples” section for SQL snippet.)

## 5 — API / server endpoints
- `GET /api/admin/venues`, `POST /api/admin/venues`, `PUT /api/admin/venues/:id`, `POST /api/admin/venues/:id/regenerate-qr`
- `GET /api/admin/checkins`, `POST /api/admin/checkins/:id/revoke`
- `GET /api/admin/users/:id`, `POST /api/admin/users/:id/suspend`
- `POST /api/admin/credits/adjust`, `POST /webhooks/stripe`, `POST /webhooks/hardware`
- `POST /api/admin/reports/export`, `GET /api/admin/metrics/top-venues`
Each endpoint enforces RBAC (see section 6) and logs actions.

## 6 — Auth & RBAC matrix
Roles: `super_admin`, `ops`, `moderator`, `finance`, `vendor_admin`. See table in spec for detailed permissions (view/edit venues, check-ins, credits, payouts, content moderation, financial visibility).

## 7 — QR & Check-In security design
- Each venue has `qr_key` for HMAC-signed tokens.
- Token payload: `{ venue_id, nonce, expires_at }`, short TTL, prevent replay (track nonce or time window).
- `/api/checkin/verify` validates signature, TTL, scanner_id whitelist; manual override requires audit entry.

## 8 — Realtime & Hardware
- Realtime: Supabase Realtime (or dedicated sockets) to push check-ins to dashboard; fallback to polling.
- Hardware: scanners send heartbeat to `/webhooks/hardware` (battery, firmware, last_scan_id). ERP shows hardware health, alerts for offline/battery issues, maintenance flagging.

## 9 — Monitoring, alerts & SLOs
- SLOs: check-in latency ≤2s (p95), API success 99.9%, webhook <5s.
- Monitoring: Sentry, Prometheus/Grafana or Datadog, Supabase logs.
- Alerts: PagerDuty/Slack for DB failures, high error rates, webhook failures, scanner fleet offline, realtime stream down.

## 10 — Data retention, privacy & compliance
- Messages kept 90 days; transcripts 1 year if escalated.
- Audit logs retained 3 years.
- GDPR: remove PII on request, keep anonymized analytics.
- Encryption: TLS, Supabase at rest; backups encrypted.

## 11 — Jobs, exports & integrations
- Async jobs: exports, campaign sending, nightly reconciliation.
- Integrations: Stripe, QuickBooks/Xero, SendGrid, FCM/APNs, hardware vendor webhooks.

## 12 — Testing, QA & staging
- Environments: dev/local, staging (separate Supabase project), prod.
- Tests: Jest unit, Playwright integration/E2E, Storybook for components, contract tests for webhooks.

## 13 — CI/CD & deployment
- Repo branching (`main`, `staging`).
- CI steps: lint → test → build → deploy. Vercel for Next.js; Supabase migrations tracked in repo.
- Secrets managed via Vercel envs, rotated regularly.

## 14 — Backups & disaster recovery
- Daily logical backups, weekly offsite snapshot, quarterly restore drill.
- RTO 4h, RPO 24h (improve with PITR if needed).

## 15 — Runbooks & operator playbooks
- **Scanner fleet offline**: check `hardware_status`, ping devices, reboot/replace, inform venue, tag incident.
- **Fraudulent check-ins**: detect duplicates, disable QR, revoke check-ins, notify finance.
- **Stripe webhook failures**: inspect logs, replay events, ensure idempotency keys.

## 16 — Operational metrics & reports
- DAU/MAU, venue throughput, revenue per venue, refund rate, hardware uptime, moderation resolution time.

## 17 — UX/UI patterns
- Sidebar navigation, top-bar context.
- Tabs per resource (overview, analytics, history).
- Right rail for metadata/audit.
- Bulk actions, impersonation (read-only), modal confirmations.

## 18 — Data model example (SQL)
```
CREATE TABLE check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  checkin_at timestamptz NOT NULL DEFAULT now(),
  method text,
  scanner_id text,
  device_info jsonb,
  hardware_snapshot jsonb,
  created_at timestamptz DEFAULT now()
);
```

## 19 — Privacy / data lifecycle rules
- Delete PII on request; keep anonymized stats 3 years.
- Messages auto-delete after retention window.
- Audit logs preserved 3 years.

## 20 — Roadmap & phased milestones
- **Phase A (30d)**: CRUD across modules, QR security, base dashboard, admin roles.
- **Phase B (60d)**: Stripe payouts, campaign composer, hardware monitoring.
- **Phase C (90d)**: Realtime scale, analytics, moderation tooling, vendor portal, accounting export.

## 21 — Checklist & tactical tasks
- **P0**: RBAC enforcement, QR regen + security, hardware heartbeat, audit logs, exports.
- **P1**: Stripe reconciliation, campaign composer, suspension workflow.
- **P2**: Storybook + Playwright, Sentry/monitoring, feature toggles.

## 22 — Security checklist
- Server-only service role key.
- JWT + `admins` table verification.
- Rate limiting, audit logging, encrypted backups, key rotation.

## 23 — Costs & scaling considerations
- Supabase DB grows with check-ins (consider partitioning, retention).
- Vercel concurrency costs; offload heavy jobs to workers.
- Stripe fees, monitoring charges.

## 24 — Deliverables available next
- DB migration SQL.
- Next.js server handlers (`/api/admin/checkins`, `/webhooks/hardware`, `/api/admin/venues/:id/regenerate-qr`).
- Operator runbooks or additional modules/components.

## 25 — Final notes & priorities
- ERP is the control plane; lock down RBAC + QR security + audit first.
- Instrument everything (errors, latency) from day one.
- Maintain runbooks and perform backup restore drills.
