# Skyline Platform

Career guidance for Cameroonian students, built by Skyline Academy. Skylar, the platform's AI mentor, runs three tools:

- **Career Match** (`/`): a 25 question assessment that returns 7 ranked careers, each linked to the concours that leads to it. The matches appear after a few seconds, and each explanation fills in as soon as Skylar has written it.
- **Concours Guide** (`/concours`): a guide to each of 18 entrance examinations, plus a global perspective for each field.
- **Admin** (`/admin`): analytics, Skylar's response times, the "Update Skylar" knowledge panel, and a button that prepares every guide in advance.

## Stack

Next.js 14 (pages router) on Vercel, the Anthropic SDK (`claude-sonnet-4-6` for Career Match, `claude-haiku-4-5-20251001` for guides, both changeable in Vercel), and Upstash Redis for analytics, knowledge updates, cached guides and timing records.

## Environment variables

Set these in Vercel under Settings, Environment Variables. See `.env.example`. Never commit real values or send them over chat. After adding or changing a variable, redeploy, and tick every environment that needs it (Production and Preview).

| Name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Skylar's API key |
| `ADMIN_PASSWORD` | Admin login, at least 12 characters, server only |
| `ADMIN_SESSION_SECRET` | Signs admin sessions, at least 32 random characters |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) | Added automatically when the Upstash store is connected |
| `SKYLAR_MATCH_MODEL`, `SKYLAR_DETAIL_MODEL`, `SKYLAR_GUIDE_MODEL` | Optional. Model for the Career Match plan, for the seven explanations, and for the guides |
| `SKYLAR_MATCH_EFFORT`, `SKYLAR_DETAIL_EFFORT`, `SKYLAR_GUIDE_EFFORT` | Optional. `low`, `medium` or `high`. Ignored for models that do not support effort, such as Haiku 4.5 |

Do not create any `NEXT_PUBLIC_` variable for secrets: Next.js sends those to every browser.

## How Career Match works

1. **Plan.** One short call picks the 7 careers, their scores and the IDs of the exams that lead to them. The results page opens as soon as this arrives.
2. **Details.** Seven calls, one per career, run at the same time and write the explanation, the route, the training length, the score breakdown and the global note. The report takes about as long as the slowest of the seven.
3. **Exam facts** (format, places, centres, fee, age limit and so on) come from `lib/concoursFacts.js`, never from the AI, so figures cannot be invented. Update that file when an official communiqué changes a figure.

The page asks for a streamed answer (`stream: true`). The API then replies with NDJSON, one JSON object per line: `plan`, then one `career` line per explanation, then `done`. Without that flag it replies with a single JSON object, as before.

Skylar's persona and the knowledge base are sent as a cached system prompt. Calls made within five minutes of each other read it at a tenth of the normal input price and can start answering a little sooner. Thinking is switched off because the answers are short and structured.

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

## Measuring speed

Vercel keeps Hobby function logs for one hour only. Every Career Match and guide request therefore also saves a one-line timing record in Redis, and the **Skylar speed** card on the Admin dashboard shows the medians and the latest runs:

- **Career Match, first results**: time until the matches appear.
- **Career Match, full report**: time until the last explanation arrives.
- **Guide written on the spot** and **Guide already prepared**: the difference shows why "Prepare all guides" matters.

## Reading the logs

Every AI call writes one line, for example:

```
[MATCH] stop_reason=end_turn ttft=1840ms total=7210ms in=820 out=310 cache_read=2480 cache_write=0
[MATCH_DETAIL_3] stop_reason=end_turn ttft=950ms total=4120ms in=760 out=170 cache_read=2480 cache_write=0
[MATCH] done first=7390ms total=12050ms details_failed=0
[CONCOURS] ENSPY cache=miss
```

- `ttft` is the time to the first token. When it is high, grammar compilation or API queueing is slow.
- `total` minus `ttft` is the writing time. When that is high, the output is too long.
- `cache_read` above zero means the cached system prompt was used.
- `cache=hit` means the guide was served from Redis without an AI call.

When a call runs out of time, a `DIAGNOSIS` line says which of the two it was.

## Structured output rules

The API rejects `maxItems`, `minItems` above 1, `minLength`, `maxLength`, `minimum`, `maximum` and `pattern` in schemas. Write them in the schema if they help you read it, but always pass schemas through `apiSchema()` in `match.js`, which moves those limits into the field descriptions and keeps `enum` values, which the API does enforce. The SDK's own helper is not used because it also moves `enum` into the description, which would let the model write exam IDs that do not exist.

The API may change the capitalisation of enum values, so exam IDs are matched without regard to case.
