# Deployment Guide (Cloudflare Pages only)

This app is deployed as a static Vite build on **Cloudflare Pages**.

## Local setup

1. Install dependencies:
   - `npm install`
2. Set required environment variables in your local environment or `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the development server:
   - `npm run dev`

## Build and verify

- Build command: `npm run build`
- Build output directory: `dist`
- Full deployment verification (lint + build + stale-string scan): `npm run verify`

## Cloudflare Pages configuration

Use the following settings in Cloudflare Pages:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Notes

- Deployment is **Cloudflare Pages only**.
- Do **not** deploy this repository using Cloudflare Workers.
- `.wrangler/` files are ignored and should not be committed.
