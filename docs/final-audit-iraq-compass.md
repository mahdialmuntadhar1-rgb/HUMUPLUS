# Iraq Compass — Repository Audit Snapshot

Audit date: 2026-03-25 (UTC)

## Scope confirmed in this repository

- React + Vite frontend.
- Firebase Authentication integration (Google and email/password in `AuthModal`).
- Firestore-backed service layer in `services/api.ts`.
- Firestore Security Rules defined in `firestore.rules`.

## Current architecture notes

1. **Authentication flow**
   - Firebase Auth is the identity provider.
   - App session restore is handled with `onAuthStateChanged`.
   - User profile provisioning currently happens from the client by creating `users/{uid}` when missing.

2. **Authorization model**
   - Admin access is expected to come from Firebase custom claims (`request.auth.token.admin == true`).
   - User documents are limited to non-admin roles from client writes.

3. **Content model**
   - Posts are stored in `posts/{postId}` with `id == postId` for rule consistency.
   - Postcards are stored in `business_postcards/{postcardId}` with server-managed update timestamps.

## Known follow-up work

- Move profile provisioning and role assignment to a trusted backend (Callable Function/Admin SDK).
- Implement cursor-based pagination and count aggregation for business directory queries.
- Add integration tests for security rules + API write paths.
- Decide Kurdish locale direction by target dialect (Sorani RTL vs Kurmanji LTR).
