<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your app (Firebase Auth + Supabase data)

This is a Vite + React frontend-only app.

- **Authentication:** Firebase Auth
- **Data layer:** Supabase (`@supabase/supabase-js`)
- **No Cloudflare Worker backend/proxy layer**

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in `.env.local`:
   - `VITE_SUPABASE_URL` (already set to `https://hsadukhmcclwixuntqwu.supabase.co` in example)
   - `VITE_SUPABASE_ANON_KEY` (from Supabase dashboard)
   - Firebase Auth `VITE_FIREBASE_*` keys
4. Run the app:
   ```bash
   npm run dev
   ```

## Deployment notes (Vercel)

- Deploy only the frontend build output (`vite build` => `dist/`).
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project environment variables.
- Configure Firebase `VITE_FIREBASE_*` variables for authentication.
