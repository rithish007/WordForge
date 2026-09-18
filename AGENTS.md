# WorldForge coding instructions

## Start here

**Current scope override, 15 September:** the user now wants a recorded local
demo before public hosting/API access. Read `docs/VIDEO_DEMO.md` first and apply
its local gates and reduced scope wherever they differ from the original plan
or production rules below. Read `docs/ROBOT_SOURCES.md` for optional visual assets.
Missing hosting/API keys must not block the local build.

**Hosting update:** the user confirmed the entry requires a web link and authorized
Vercel hosting. `site/` is the independent static submission page for the recorded
demo. Keep it separate from the future `web/` simulator frontend. Do not replace
the submission page with unfinished app code or claim the simulator/video is ready.

Read `Plan.md`, then `PROJECT.md`, then `docs/ASTRA_BUILD.md` before implementation.
`Plan.md` is the product contract; keep its filename and contents intact. This repo
is already the root shown as `astra/` in its layout: create `web/` and `server/`
here, not inside another `astra/` directory. The product name is **WorldForge**;
the existing directory and GitHub repository are named **WordForge**.

Build the browser product described in the plan for the GPT-6 Astra Challenge on
18 September 2026. Keep the fixed deadline, ordered gates, and section 4 cut list.
Do implementation work when asked to build; do not end with another proposed plan.
Continue through the current gate, fixing failures before adding downstream scope.
If an external dependency blocks a gate, finish that gate's independent local
work, record the missing dependency, and do not claim the gate passed.

## Architecture and scope

- Next.js, TypeScript, React Three Fiber and Three.js in `web/`.
- FastAPI and Pydantic in `server/astra/`; headless CPU MuJoCo in isolated workers.
- Vercel frontend, one Docker backend VM, persistent project volume. Preserve this
  topology; do not replace it with static-only hosting or a database service.
- Specs are the source of truth. The agent uses typed tools; deterministic code
  validates state and compiles the scene, occupancy grid, and MJCF.
- Primitives only: eight registered object types and two AMRs, RB-THERON and Boxer.
- No accounts, databases, asset pipeline, screenshot editing, BREAK, multi-stop
  missions, extra robot domains, or torque-driven wheels in this MVP.

## Correctness contracts

- Metres, kilograms, seconds, radians internally. Specs store `yaw_deg`; convert
  at the compiler boundary once, without mutating the serialized spec.
- World XY is the floor; +Z is up; origin is the floor centre. Use one Three.js
  root group with `rotation.x = -Math.PI / 2`, in exactly one conversion file.
  Pointer picking must use that group's inverse transform, not ad hoc axis swaps.
- Objects use floor-centred footprints, height, Z yaw, stable unique snake_case
  IDs, and no nested transforms. Walls and floor derive from bounds.
- Validate schema, structure, and navigability after mutations. Apply typed edit
  batches atomically; failed batches preserve the prior world and IDs.
- Use both robots' verified dimensions for clearance. The conservative default
  envelope is the largest `collision_radius + safety_margin`, not width alone.
  Never treat the zero-valued
  example RobotSpec as data. Link manufacturer sources and label estimates.
- Revalidate all shortened and smoothed path segments against the inflated grid.
  Keep a valid earlier path when smoothing would introduce a collision.
- Fixed simulation/control/telemetry rates are 500/50/20 Hz. Simulation results
  must not depend on network timing or wall-clock pacing.
- MuJoCo geom groups identify roles; implement collision filtering and collision
  event classification explicitly. Group numbers alone are not collision masks.
- Report named failure states. Kinematic fallback must display the exact honest
  label from Plan section 17; never claim physics for geometric playback.

## Astra and the product's OpenAI integration

Use `gpt-6-astra` as the coding model, with `high` reasoning by default. Project
defaults are in `.codex/config.toml`; the launcher also passes them explicitly.
Do not confuse the coding model with the product's API configuration.

During the agent milestone, use the OpenAI Responses API and typed function
tools. Default initial world generation and result interpretation to
`gpt-6-astra`. Select a cheaper edit classifier only after checking current model
support and running the committed edit evals. Keep model IDs configurable.

Use current official OpenAI documentation for API details. API keys stay on the
server. Never print credentials or put them in browser code or committed files.
If a key, model access, pricing, or daily spend budget is missing, build and test
the deterministic/template path and explicitly mark live AI validation pending.
Do not invent successful API calls or silently substitute a different model.

Implement durable, concurrency-safe spend reservations before paid calls, output
limits, and graceful template mode when the daily cap is exhausted. Preserve
Plan section 13's queue, session, prompt, run, and concurrency limits.

## Working practice and evidence

Record routine reversible implementation choices in `PROJECT.md` and proceed.
Review the implementation questions in `PROJECT.md` before their affected layer.
For unresolved physical conventions or product behaviour that the plan leaves
open, write a specific proposal and obtain the user's answer before depending on
it. Keep independent work moving. Do not silently rewrite the product contract.

Use repo-local dependencies and commit lockfiles when dependencies are added.
Avoid global environment changes. Do not discard unrelated local changes.
The user-provided `Plan.md` was untracked at setup; preserve it.

Use targeted tests for geometric boundaries, compiler parity, atomic edits,
planning safety, determinism, persistence and resource limits. Run all required
gate checks, but do not repeatedly run unchanged passing suites without reason.
Inspect the actual browser for scene orientation, picking, loading and failures.
Use real source-derived scene bounds in parity tests, not a second hand-written
implementation that merely agrees with the backend by construction.

Update `PROJECT.md` after each milestone with commands run, results, verified
URLs, decisions, blockers, and the next concrete action. Distinguish local tests,
live-model evals, container tests, and production verification. A scaffold is not
a complete MVP, and a local pass is not a production gate.

Prepare deploy artifacts during Day 1. Use connected, authorized hosting when
available; ask only for the missing target/access or a concrete new paid resource
when needed. Prepare launch copy and evidence locally; publication or messages
to other people require the user's authorization. Never claim a launch was
scheduled or submitted without confirmation from Product Hunt.
