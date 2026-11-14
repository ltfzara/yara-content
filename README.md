# Yara | یارا

Persian-first, RTL, mobile-first Instagram content and growth assistant for Persian-speaking sellers.

## Product direction
- Conversational onboarding that gradually learns each business
- Reactive content help: ideas, hooks, Reels scripts, captions, Stories and CTAs
- Proactive weekly content recommendations
- Saved and editable content drafts

## Stack
- Frontend: planned lightweight web app
- Backend: Supabase Auth, Postgres and Edge Functions
- AI: server-side only; never expose a model API secret in the browser

## Setup status
This repository is being initialized. The Supabase schema is in `supabase/schema.sql`.
The schema has **not** been applied to the Supabase project yet, and the AI endpoint is not configured.

## Next steps
1. Apply `supabase/schema.sql` in the Supabase SQL Editor.
2. Configure the frontend with the Supabase project URL and publishable/anon key.
3. Add an Edge Function for AI requests; keep all provider secrets in Supabase Function Secrets.
4. Add authentication and connect the UI to the database.

## Security
Never commit `service_role` keys, database passwords, or AI provider secrets.
