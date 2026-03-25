# Cloudflare Pages/Workers deployment (ERESOLVE-safe)

Use the following settings to avoid Firebase dependency tree conflicts during `npm ci`:

## 1) Build command

```bash
npm run build:cf
```

This runs:

```bash
npm ci --legacy-peer-deps && npm run build
```

## 2) Environment variables (Cloudflare dashboard)

Set these in **Settings → Builds & Deployments → Environment variables**:

- `NPM_FLAGS=--legacy-peer-deps`
- `NODE_VERSION=22.16.0`

## 3) Runtime compatibility

`wrangler.toml` enables Node.js compatibility:

- `compatibility_flags = ["nodejs_compat"]`

Use this when your code or dependencies expect Node globals/APIs.

## 4) Package policy

In `package.json`:

- `firebase` is pinned to `11.0.2`
- `firebase-admin` is pinned to `12.7.0`
- `overrides.firebase` forces firebase core resolution to `11.0.2`
- test/tooling packages (`@firebase/rules-unit-testing`, `mocha`, `firebase-tools`) remain in `devDependencies`
