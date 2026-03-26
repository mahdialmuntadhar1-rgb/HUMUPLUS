<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Iraq Compass (Vite + React + Supabase)

This app uses a frontend-only architecture:

Frontend (Vite + React)
→ Supabase (Auth, Postgres, Realtime)

No Worker runtime exists in this project.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Create `.env.local` with required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the app:
   `npm run dev`

## Build

`npm run build`

The production output is generated in `dist/`.

## Preflight / Launch Checks

Use the preflight script before release:

`./scripts/preflight.sh`

It validates:
- Type/lint checks (`npm run lint`)
- Production build (`npm run build`)
- Required Supabase environment variables

## Architecture

- Auth: Supabase Auth (Google OAuth)
- Data: Supabase Postgres tables via `@supabase/supabase-js`
- Realtime: Supabase channels for social feed updates
- Deploy target: Cloudflare Pages (static site)

## Database setup (production baseline)

This repository includes Supabase schema + RLS baseline migrations:

- `supabase/migrations/20260326_initial_schema.sql`

Apply with Supabase CLI from project root:

```bash
supabase db push
```

The migration includes:
- core tables (`users`, `businesses`, `posts`, `events`, `deals`, `stories`, `business_postcards`)
- row level security enabled on all tables
- policies for public reads, owner writes, and admin-only postcard ingestion
