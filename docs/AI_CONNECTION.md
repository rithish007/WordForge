# Visitor-funded AI for the local submission build

Implemented 17 September 2026. Live API validation is **pending**; automated
tests use mocked Responses output and never spend credits.

## User flow

Open `http://127.0.0.1:3000`. Open sample goes directly to a working warehouse.
Samples, manual edits, planning, MuJoCo runs and WorldForge JSON attachments need
no key. A prompt opens Connect AI when disconnected. The visitor enters their own
OpenAI Platform project API key, chooses a daily WorldForge allowance and accepts
the displayed funding consent. Connecting makes no paid verification request.
Build/Apply then sends one bounded Responses request using `gpt-6-astra`.
The visitor needs funded API access to that model. ChatGPT subscription login is
not used as general API funding. No owner/global API-key fallback exists.

AI proposes a typed complete WorldSpec. Pydantic, geometry and (for new worlds)
navigability validation must pass before the UI applies it. Existing-world
edits may intentionally block navigation. The previous world remains intact on
failure; successful edits participate in Undo. This is one generation/edit call,
not BREAK, result interpretation or an autonomous repair loop.

## Credentials and accounting

- Password input is transient and cleared after submission or closing settings.
  Keys are held as SecretStr in server RAM; cookies contain only a random session
  token and use HttpOnly, SameSite Strict and the `/api/ai` path. The connection
  expires after one hour. Expired key records are removed at the next session
  check; disconnect/server restart removes them as well. An in-flight request
  can finish after disconnect. No key is written to browser storage or the ledger.
- One request per connection at a time, 2,000 prompt characters, bounded serialized
  input and 8,192 output tokens. No automatic retries. No paid request during Connect.
- Before a provider call, an OS-file-locked and thread-locked ledger atomically
  reserves its conservative maximum allowance. It persists across reconnection
  and restart, keyed by UTC date plus SHA-256 key fingerprint. Up to 25 requests
  per key/day; chosen allowance is checked against spent and outstanding amounts.
  Different keys are different accounts; this is not authentication or billing.
- Accounting uses conservative input $12.50/M and output $50/M rates verified
  for Astra on 17 September, input bound 65,536 and output bound 8,192. Reservation
  is $1.2288. Reported tokens settle it downward; missing usage or uncertain
  failures retain the reservation. This is an application estimate, not a change
  to OpenAI billing, taxes, project-wide spend or requests outside WorldForge.
- `WORLDFORGE_AI_MODEL` defaults to `gpt-6-astra`. Unknown models fail closed until
  their rates/bounds are configured and tested. Recheck rates before deployment.
- `WORLDFORGE_SPEND_PATH` defaults to gitignored `data/ai-spend.json`. Preserve
  this on persistent storage. Do not delete the ledger to reset active budgets.
- Provider destination is fixed HTTPS, verified TLS, no redirects. Errors omit
  provider bodies and validation inputs to avoid credential disclosure.

## Submission and deployment boundary

The running build is loopback-only. The existing `site/` submission page and its
Vercel deployment are separate; they have not been replaced with the simulator.
The simulator's Next.js rewrite still targets localhost:8000. Do not expose this
build unchanged as a public multiuser service. Production backend/TLS routing,
trusted origin configuration, persistent storage, hosted queue/session/abuse
limits, deployment verification and live model evals remain pending. RAM sessions
currently require a single backend process; file locking protects accounting
across processes, not session lookup.

Attachments accept **WorldForge JSON**, not GLB, URDF, arbitrary folders or custom
robot controllers. Imported layouts remain local until an AI prompt sends them
to OpenAI. The settings disclosure covers prompts and scene data.

## Validation

`npm.cmd run build --prefix web`; from server,
`../.venv/Scripts/python.exe -m pytest -q` (26 passing tests).
Tests cover masked validation, cookie flags, visitor isolation/expiry, no owner
fallback, typed proposal handling, invalid geometry, malformed output, pricing
fail-closed, per-connection concurrency, concurrent atomic reservations, retained
timeout reservations and caps across reconnection.

Browser checks: disconnected Build opens settings; Open sample opens editor;
Attach angled_depot.json followed by Build opens that validated world without a
key; keyboard and pointer resizing, saved sizes, collapse/reset, theme controls,
object toggle selection and actual successful MuJoCo run. No captured browser
errors. Responsive DOM check at 390px found no horizontal overflow.

## Official references

- [OpenAI API authentication](https://developers.openai.com/api/reference/overview)
- [ChatGPT/Codex and API authentication](https://learn.chatgpt.com/docs/auth)
- [Responses function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Astra model and pricing](https://developers.openai.com/api/docs/models/gpt-6-astra)
