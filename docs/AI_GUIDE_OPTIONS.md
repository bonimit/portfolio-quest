# Real guide AI — approval-ready options, not activated

Researched 2026-11-10. No provider, account, credentials, API route, SDK or paid
service was added. The entrance currently accepts typed questions but answers
only with a clearly labeled local scripted fallback. General free-form AI
answers are **not implemented**. The conversation UI is not proof of a model.

## Asset provenance and feasibility

The supplied `design-playground.html` embeds a 712 × 1500 PNG sprite sheet.
Its CSS divides this into 89 × 150 frames, eight columns and ten rows. It has
idle, walking, turning, thinking, talking, greeting and climbing poses. Walking
uses 1.25s sprite cycles and talking uses 1.1s cycles; JS moves the character on
page surfaces using a perpetual animation-frame loop.

No artist attribution, license or permission record accompanied the HTML. Local
possession does not establish reuse rights. The sprite was not extracted or
copied. `walking-guide.tsx` instead draws an original cloaked lantern traveler
in SVG. It has idle/walk/talk states and bounded movement without the reference’s
continuous geometry loop or climbing on controls. This is temporary original art
for owner review, not a licensed reproduction of the reference character.
Existing bundled OFL fonts and their license files remain unchanged.

## Options and indicative costs

| Option | Free-first path | Indicative paid inference | Tradeoffs |
| --- | --- | --- | --- |
| Cloudflare Workers AI, small instruction model | 10,000 Neurons/day on Workers Free; stop and use fallback when exhausted | Llama 3.2 3B: $0.051/M input tokens, $0.335/M output tokens; paid overage $0.011/1,000 Neurons | Small model quality needs evaluation. Check model license, provider data policy, account/region availability and rate limits before selecting. Separate server deployment would need approval. |
| Gemini API, 2.5 Flash-Lite | Free tier subject to account/model quotas | $0.10/M input, $0.40/M output tokens | Free-tier content may be used to improve products; explicit owner acceptance and visitor disclosure required. Recheck model lifecycle and account quotas before activation. |
| Browser-local WebLLM | No hosted inference API charge | Visitor device performs inference | Requires WebGPU and model downloads; memory, battery, download size and mobile support need device testing. Each model’s license must be checked. Not recommended as the default title-screen experience. |

Sources: [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/),
[Workers platform pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[Gemini pricing and data-use distinctions](https://ai.google.dev/gemini-api/docs/pricing),
[WebLLM requirements](https://webllm.mlc.ai/docs/user/get_started.html).

Illustrative arithmetic, **not a quote or usage forecast**: 1,000 replies at
1,500 input + 250 output tokens each would cost about $0.16 for the Cloudflare
model or $0.25 for Flash-Lite at the listed paid token rates, before free
allowances, platform charges, tax or retries. Growing conversation context costs
more. Cloudflare’s paid Worker subscription starts at $5/month; do not confuse
inference arithmetic with the total bill. Free quotas are limited and do not
provide an unlimited public assistant.

## Recommended next approval step

Evaluate a **hard-capped Workers Free pilot** against approved portfolio questions,
with no paid upgrade or automatic provider failover. A small model may be too weak;
if evaluation fails, retain the transparent local fallback while choosing another
provider. Gemini Free is a candidate only after data-use terms are accepted.
Provider choice and deployment are not authorized by this proposal.

Prepare a server-backed `GuideProvider` adapter behind the existing contract after
approval. Keep navigation actions as approved IDs resolved locally; never execute
model-generated code, tools, arbitrary URLs or instructions. Supply only approved
public site content. Unknown project or biography questions must acknowledge the
missing content rather than fabricate it.

Before any public activation:

- Owner approves provider/model, applicable terms/license, public content scope,
  retention/privacy disclosure, hosting destination and a hard spending ceiling.
- Keep credentials server-only; validate content type, 500-character input and
  bounded message history, context/output tokens and a 10-second timeout.
- Enforce atomic per-IP/session limits and a global daily quota before inference;
  use shared server storage rather than per-process counters. Add a concurrency
  cap and bot challenge when abuse warrants it. Origin checks alone are not auth.
- Stop requests at the quota, disable paid overage, and provide an owner kill
  switch. Client-side limits and billing alerts alone do not prevent abuse.
- Return plain text plus a schema-validated action-ID allowlist. No HTML rendering,
  browsing, private data, general-purpose tools or automatic external actions.
- Avoid storing prompt bodies by default. Document any short-lived rate-limit
  identifiers, retention and deletion. Show the provider disclosure before sending.
- Test success, unknown content, prompt injection, forged actions, 429/quota,
  timeout, offline/5xx and cancellation. Keep usable direct paths in every error.

Current implementation has no public inference endpoint to abuse. These are
acceptance requirements for the future service, not controls claimed to exist now.
