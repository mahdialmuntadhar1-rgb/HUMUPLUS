<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Iraq Compass (Supabase + Cloudflare)

This app uses a Supabase-first architecture for authentication, data APIs, and realtime feeds, and is intended to deploy behind Cloudflare.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Create `.env.local` with required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_AI_API_BASE_URL` (required, points to your secure AI backend endpoint)
   - `VITE_CLOUDFLARE_ACCOUNT_ID` (required for deployment workflows)
   - `VITE_CLOUDFLARE_PROJECT_NAME` (required for deployment workflows)
   - `VITE_CLOUDFLARE_WORKER_NAME` (optional; only if your deployment scripts target Workers directly)
   - `GEMINI_API_KEY` (server-side only; do not expose to the browser bundle)
3. Run the app:
   `npm run dev`

## Build

`npm run build`

## Preflight / Launch Checks

Use the preflight script before release:

`./scripts/preflight.sh`

It validates:
- Type/lint checks (`npm run lint`)
- Production build (`npm run build`)
- Required Supabase + Cloudflare + AI API environment variables

## Architecture

- Auth: Supabase Auth (Google OAuth)
- Data: Supabase Postgres tables via `@supabase/supabase-js`
- Realtime: Supabase channels for social feed updates
- AI: proxied through a secure backend endpoint (`VITE_AI_API_BASE_URL`)
- Edge/deploy: Cloudflare

## Database setup (production baseline)

This repository now includes Supabase schema + RLS baseline migrations:

- `supabase/migrations/20260326_initial_schema.sql`

Apply with Supabase CLI from project root:

```bash
supabase db push
```

The migration includes:
- core tables (`users`, `businesses`, `posts`, `events`, `deals`, `stories`, `business_postcards`)
- row level security enabled on all tables
- policies for public reads, owner writes, and admin-only postcard ingestion
