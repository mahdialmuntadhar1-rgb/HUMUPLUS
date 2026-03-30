# HUMUS

HUMUS is a production-focused Iraq business directory app that uses **Supabase as the only backend**.

## What this app includes

- Supabase Auth integration (Google OAuth + profile sync)
- Supabase-backed business directory listings
- Supabase-backed featured businesses, events, stories, deals, and postcards
- Owner/admin dashboard with profile updates, post publishing, and postcard ingestion
- Multilingual UI (English, Arabic, Kurdish)

## Backend policy

- Firebase is not used.
- Mock/demo business datasets are not used in the production data flow.
- App data reads/writes go through Supabase tables in `supabase/migrations/20260328_bootstrap_public_tables.sql`.

## Local setup

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (or `.env`) from `.env.example` and set values.
3. Run the app:
   ```bash
   npm run dev
   ```

## Required environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Checks

```bash
npm run lint
npm run build
```

## Deployment notes

- Ensure hosting provider env vars are set for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Ensure Supabase OAuth redirect URLs are configured for your production domain.
- Apply the SQL migration in `supabase/migrations/20260328_bootstrap_public_tables.sql` before production launch.
