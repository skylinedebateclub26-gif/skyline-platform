# Skyline Platform

Career guidance for Cameroonian students, built by Skyline Academy. Skylar, the platform's AI mentor, runs three tools:

- **Career Match** (`/`): a 25 question assessment that returns 7 ranked careers, each linked to the concours that leads to it.
- **Concours Guide** (`/concours`): a guide to each of 18 entrance examinations, plus a global perspective for each field.
- **Admin** (`/admin`): analytics, the "Update Skylar" knowledge panel, and a button that prepares every guide in advance.

## Stack

Next.js 14 (pages router) on Vercel, the Anthropic SDK (`claude-sonnet-4-6` for Career Match, `claude-haiku-4-5-20251001` for guides), and Upstash Redis for analytics, knowledge updates and cached guides.

## Environment variables

Set these in Vercel under Settings, Environment Variables. See `.env.example`. Never commit real values or send them over chat.

| Name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Skylar's API key |
| `ADMIN_PASSWORD` | Admin login, at least 12 characters, server only |
| `ADMIN_SESSION_SECRET` | Signs admin sessions, at least 32 random characters |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) | Added automatically when the Upstash store is connected |

Do not create any `NEXT_PUBLIC_` variable for secrets: Next.js sends those to every browser.

## Vercel settings

- **Fluid compute** is switched on in `vercel.json`, so it does not depend on the dashboard toggle. `pages/api/match.js` asks for 300 seconds, which Hobby allows only with Fluid compute. Do not remove `vercel.json`.
- Share only the production address with students; preview addresses are protected.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

Use your own Anthropic key for local work, never the production one.

## Reading the logs

Every AI call writes one line, for example:

```
[CONCOURS] stop_reason=end_turn ttft=2140ms total=21877ms in=4012 out=2764
[CONCOURS] ENSPY cache=miss
```

- `ttft` is the time to the first token. When it is high, grammar compilation or API queueing is slow.
- `total` minus `ttft` is the writing time. When that is high, the output is too long.
- `cache=hit` means the guide was served from Redis without an AI call.

When a call runs out of time, a `DIAGNOSIS` line says which of the two it was.

## Structured output rules

The API rejects `maxItems`, `minLength`, `maxLength`, `minimum`, `maximum` and `pattern` in schemas. Write them in the schema if they help you read it, but always pass schemas through `apiSchema()` in `match.js`, which moves those limits into the field descriptions.
