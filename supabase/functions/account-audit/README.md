# Account Audit — Supabase Edge Function

This function turns manually supplied public-profile metrics into an AI-assisted audit. It does **not** scrape Instagram or TikTok and does not request account passwords.

## Required server secrets

- `NVIDIA_API_KEY`: NVIDIA API key. Keep it in Supabase Edge Function secrets only.
- `APP_ORIGIN`: allowed frontend origin, e.g. `https://vyral-frontend.pages.dev`.
- `NVIDIA_MODEL` (optional): defaults to `meta/llama-3.3-70b-instruct`.

## Security and deployment

- Keep JWT verification enabled when deploying. Do not expose this endpoint as an unrestricted public AI proxy.
- The current Vyral preview has no user sign-in. Add Supabase Auth and invoke this function with a user session before enabling it in the public frontend.
- Deploy only after Supabase project access is restored, secrets are configured, and the frontend is ready to send authenticated requests.
- The NVIDIA key must never use a `VITE_` prefix or appear in frontend code.

## Request

POST JSON:
```json
{
  "platform": "Instagram",
  "profileUrl": "https://www.instagram.com/example/",
  "followers": 12000,
  "avgLikes": 430,
  "avgComments": 25,
  "postsPerWeek": 4,
  "clearNiche": true,
  "bioHasCta": true
}
```

The response includes calculated metrics and an AI-generated structured analysis. All metrics are labeled as user-provided; no platform data is fetched.
