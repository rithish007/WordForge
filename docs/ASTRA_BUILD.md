# Astra build kickoff: local recorded demo

Implement WorldForge's local demo now. Read `docs/VIDEO_DEMO.md`, `AGENTS.md`,
`Plan.md`, `PROJECT.md`, and `docs/ROBOT_SOURCES.md`. The user's 15 September
video-first direction supersedes the original public-deployment gates. They
reported 64 hours 42 minutes remaining at that update; confirm the real deadline
before submission, and preserve a recording/upload buffer.

Work directly in this repository with GPT-6 Astra / high. Do not stop after
proposing another plan, queue another self-addressed kickoff, launch a recursive
Codex session, or wait for hosting/API keys. Preserve the original `Plan.md`.

Start with Next.js/TypeScript/React Three Fiber in `web/` and FastAPI/Pydantic in
`server/astra/`. Implement WorldSpec, validation, two asymmetric fixtures, an
HTTP fixture endpoint, JSON import through validation, and a real browser scene
obeying the existing Z-up convention. Use repository-local dependencies and
record exact startup commands. Prove the fixture renders and invalid imports
produce explained errors before moving on.

Then integrate one supported robot with verified dimensions, occupancy inflation,
safe A*, start/goal controls, a visible path, a planar MuJoCo run and measured
results. Include reset and a reproducible blocked-route case. Check collision
filtering, walls, safe smoothing and the controller's stopping phase from the
review in PROJECT.md. Record routine implementation decisions and ask focused
questions only when a material product/physical choice truly remains unresolved;
keep independent implementation work moving.

A complete local run is the priority. Use an explicitly labelled kinematic
preview if MuJoCo cannot meet the local reliability gate within the time budget.
Integrate a second robot and optional visual meshes only after that loop works;
mesh import has a two-hour budget and requires matching variants and licenses.

No separate application OpenAI key is required for the fixture/import demo.
Astra can author actual world JSON interactively in Codex for import. Save its
prompt and output as evidence; show the workflow honestly. Omit or disable live
in-app AI chat until actual API access exists. Do not emulate live model responses
with canned text, and do not use Codex authentication as a public API proxy.

Follow the scope, budget and recording sequence in `docs/VIDEO_DEMO.md`. Keep
PROJECT.md and README.md accurate after each working slice, including commands,
tests, browser evidence, remaining work and limitations. Prepare a real demo
recording and Product Hunt materials from demonstrated behaviour. Do not claim
the product is hosted or the entry submitted without verifying those actions.
