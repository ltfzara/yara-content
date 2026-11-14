# Yara | یارا

Persian-first, RTL Instagram content strategist for Persian-speaking small businesses.

## Current implementation
- Supabase email OTP login and user-owned business profile/drafts
- Persian chat UI with persisted chat history
- Authenticated Supabase Edge Function at `supabase/functions/yara-chat/index.ts`
- AvalAI API calls happen server-side; the AvalAI key is never placed in browser code

## Deploy the AI function
1. Create an API key in your AvalAI dashboard.
2. In Supabase, open **Edge Functions** and create a function named `yara-chat` using the code in `supabase/functions/yara-chat/index.ts`. Deploy it.
3. In Supabase **Edge Function Secrets**, add `AVALAI_API_KEY` with your AvalAI key. Do not add it to `index.html` or GitHub.
4. The function defaults to model `gpt-4.1-mini`. To use a different model available to your account, optionally set `AVALAI_MODEL` as an Edge Function secret.
5. Confirm the Supabase Edge Function is deployed, then refresh the Vercel site and try the **گفت‌وگو با یارا** tab.

The function checks the caller's Supabase access token before using AvalAI. Supabase's default Edge Function JWT verification should remain enabled. The key is sent only from the server-side function to AvalAI.

## Free-tier, credits, and privacy notes
- AvalAI model availability, prices, trial credits, and request limits depend on the account and can change. Check the dashboard before making repeated requests.
- Do not assume the trial credit is unlimited or enable paid top-ups unless you explicitly choose to.
- Do not send passwords, payment details, sensitive customer data, or confidential business information to an AI provider unless you have reviewed its data handling terms.
- If the account has no available credit or reaches a limit, Yara should show an error rather than silently switching to a paid model.
- Supabase and Vercel free plans also have their own limits and terms.

## Database
The initial schema is in `supabase/schema.sql`. It creates business profiles, chat messages, and content drafts with row-level security policies scoped to the authenticated user. The project owner should periodically review policies and backups.

## Local development
This is a static HTML app. Open `index.html` through a local static server or deploy the repository with Vercel. The frontend uses the Supabase project URL and publishable key; the publishable key is intended for client use when RLS is correctly configured.
