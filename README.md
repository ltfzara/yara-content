# Yara | یارا

Persian-first, RTL Instagram content strategist for Persian-speaking small businesses.

## Current implementation
- Supabase email OTP login and user-owned business profile/drafts
- Persian chat UI with persisted chat history
- Authenticated Supabase Edge Function at `supabase/functions/yara-chat/index.ts`
- Gemini API calls happen server-side; the Gemini key is never placed in browser code

## Deploy the AI function
1. In Google AI Studio, create an API key for a project that remains on the **Gemini API Free tier**: https://aistudio.google.com/app/apikey
2. In Supabase, open **Edge Functions** and create a function named `yara-chat` using the code in `supabase/functions/yara-chat/index.ts`. Deploy it.
3. In Supabase **Project Settings → Edge Functions → Secrets** (or the Functions secrets area), add `GEMINI_API_KEY` with your AI Studio key. Do not add it to `index.html` or GitHub.
4. Confirm the Supabase Edge Function is deployed, then refresh the Vercel site and try the **گفت‌وگو با یارا** tab.

The function checks the caller's Supabase access token before using Gemini. Supabase's default Edge Function JWT verification should remain enabled.

## Free-tier and privacy notes
- Gemini API has a free tier with limited model availability and rate limits. Availability and quotas can change; check the project's active limits in AI Studio.
- Google's published free-tier pricing page says content submitted on the free tier may be used to improve its products. Do not send sensitive customer data, passwords, payment details, or confidential business information through the free-tier model.
- If the free quota is exhausted, Yara should show an error rather than silently switch to a paid model. Do not link billing or upgrade the project unless the owner explicitly chooses to.
- Supabase and Vercel free plans also have their own limits and terms.

## Database
The initial schema is in `supabase/schema.sql`. It creates business profiles, chat messages, and content drafts with row-level security policies scoped to the authenticated user. The project owner should periodically review policies and backups.

## Local development
This is a static HTML app. Open `index.html` through a local static server or deploy the repository with Vercel. The frontend uses the Supabase project URL and publishable key; the publishable key is intended for client use when RLS is correctly configured.
