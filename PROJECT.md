# WorldForge project state

Updated: 2026-09-18. Phase: **Submission first: robotics-focused editor and visitor-funded AI connection. Live model and public simulator verification pending.**

## Published recording and analytics, 18 September

- Embedded the user-supplied Vercel Blob recording (SampleRec.mp4), 2558 x 1496,
  156.57 seconds. The full-width player uses its intrinsic ratio without added
  letterboxing; the short local-prototype caption sits outside the player.
- Added the official static-site Vercel Web Analytics script through analytics.js.
  HTTPS deployments collect page views; local HTTP previews do not. Dashboard
  confirmed Analytics enabled, then received 1 visitor and 1 page view.
- Profile navigation on landing, Build and Simulation, plus the landing footer,
  points to https://rithish.vercel.app/ as supplied by the user.
- Published https://worldforge-nine.vercel.app/ via READY deployment
  https://worldforge-e0mbr6jyj-rithishrs007projects.vercel.app. Public browser
  verified recording playback advancing beyond 20 seconds, no captured console
  errors, and the portfolio footer URL. Analytics script returned HTTP 200.
- Checks: node --check site/analytics.js and site/demo.js; web TypeScript check
  passed with --incremental false (existing build-cache file is not writable).
  Previous UI production-build evidence remains in the checkpoint below.
- Raw root SampleRec.mp4 stays outside Git; the site streams the supplied Blob URL.
  Actual challenge submission and live-model validation remain pending.

## Submission design checkpoint, 17 September

### Final presentation refinements

- Removed the landing Overview label and What works today section. The icon-only
  notch expands horizontally on fine-pointer hover, focus or tap; Escape/outside
  interaction closes it. Shared magnetic pointer and gentle control attraction
  preserve native pointers for inputs, dialogs, resizing, video and 3D interaction;
  reduced-motion/coarse-pointer settings disable magnetic effects.
- Enlarged body text and small headings across the landing/editor. Video area
  spans the available page width with a 16:9 presentation area and no video-height
  cap. Removed embedded illustration text/callout labels; caption is below it.
- Hero Explore prototype now scrolls to the demo. View source and Run locally
  are together beside its heading, with no duplicate button inside the player.
  Footer links to the existing @rithish007 GitHub profile. Connect AI is visibly
  styled as a button; redundant object count removed from world details.
- Shared interactions are in `site/interaction.js`, copied to `web/public/` by
  sync-design.ps1 alongside shared CSS. JS syntax and Next production build pass;
  git diff check passes. Actual browser verified expanded one-row menu, Escape,
  demo anchor/full-width area, Connect AI dialog, removed details and public page.
  No captured public-page console errors. Physics/API code unchanged.
- Published and browser-verified https://worldforge-nine.vercel.app/ via READY
  deployment https://worldforge-gyhtt356q-rithishrs007projects.vercel.app.
  Local simulator restarted with the final build. Recording is still pending.

- User reports 11 hours to submission and explicitly requests conserving the
  current usage window. Feature expansion stopped after the presentation pass.
  Cloud backend, accounts, storage and model import remain deferred.
- Rebuilt the static landing page as a centred, bold composition with substantially
  less copy and a top-edge notch menu, inspired by the two supplied references.
  The same shared foundation and navigation now cover Build and Simulation.
  `site/design.css` is the shared source; `scripts/sync-design.ps1` copies it to
  `web/app/design.css`. Added matching light/dark illustration variants and
  retained the honest recording/local-only status and working video integration.
- Published the static redesign to the existing Vercel project:
  https://worldforge-nine.vercel.app/ (READY deployment
  https://worldforge-88zyy2d1d-rithishrs007projects.vercel.app).
  Browser verified the public title, layout and local-setup dialog. Public links
  do not point to localhost. Local landing preview links to the local app.
- Checks: Next.js production build passed; `node --check` for site.js, demo.js
  and theme.js passed; git diff whitespace check passed. Actual browser verified
  the notch menu, Build navigation, landing dark theme, 390px responsive layout
  without horizontal overflow, successful MuJoCo run and barrier PLAN_FAILED.
  Successful run: 28.32s, 21.95m, zero contacts, 0.15m minimum clearance.
  No captured app console errors. No physics/API logic changed in this pass.
- Local servers remain available at http://127.0.0.1:3000 and landing preview
  http://127.0.0.1:4173. No paid model call or new cloud resource provisioned.
- `docs/SUBMIT_NOW.md` contains the remaining ordered actions, 80-second recording
  script, copy-ready listing, live chat test and answers about analytics/hosting/
  accounts/BREAK/models/storage. README now describes the implemented connection
  accurately. Recording, live AI verification and actual submission remain pending.
- Next: user checks authenticated challenge requirements/cutoff and records the
  verified local sequence. Attach the real recording, redeploy and verify playback,
  then finish the submission. The public countdown scrape showed zero and the
  linked Notion guide returned 404, so video-only eligibility is not established.

## Submission editor and visitor funding, 17 September

- Latest user direction supersedes discovery-first sequencing: robotics engineers
  are the priority, creators are excluded, market research postponed until after
  submission. The research guide is retained as historical work; no interviews
  are required before continuing the submission. Plan.md remains intact.
- Simulation now has scene hierarchy left, viewport centre, inspector right and
  collapsible Chat/Results below. Desktop splitters support dragging, keyboard
  arrows, reset and persisted sizes. Narrow layouts stack sections. Results open
  after a run. Existing editing, categories, selection, undo and simulation remain.
- Reference-inspired rounded composer has Attach, Build and Open sample below;
  no voice controls or scenario menus. Open sample directly enters the lab.
  Attach supports validated WorldForge JSON only; custom model import and BREAK
  remain unimplemented. Chat editing uses the same validated atomic apply path.
- Visitor-funded API connection implemented with explicit consent, a temporary
  server-memory key, HttpOnly cookie, daily allowance, durable concurrent spend
  reservations and graceful no-key samples. No owner API-key fallback. Uses one
  Responses typed proposal with configurable Astra model. No paid calls made.
  See `docs/AI_CONNECTION.md` for exact limits, credentials and deployment scope.
- Verification: production Next.js build passed; backend pytest 26 passed,
  2 existing warnings. New AI tests are mocked, not live model evals. Browser:
  direct sample, disconnected Build/settings, JSON attach-to-editor, resizing by
  mouse and keyboard, persistence after reload, collapse/reset, dark theme,
  object toggle selection and a real sample run passed. Run: SUCCESS, 28.32s,
  21.95m, zero contacts, 0.15m minimum clearance. No captured console errors.
- Local preview: http://127.0.0.1:3000 via `scripts/start-demo.ps1`.
  Hosted static submission page unchanged. Simulator deployment, funded Astra
  access/evals, recording and actual submission remain pending; none claimed done.
- Next: validate a funded visitor key with Astra access and the build/edit evals,
  then capture the submission recording using the verified local physics loop.

## Product discovery direction, 17 September

- User wants market validation questions before building the broader product.
  `docs/MARKET_DISCOVERY.md` contains a reusable interview guide, short outreach
  questionnaire, separate creator/robotics branches and an evidence sheet.
  No interviews or market viability claims have been made.
- Intended audiences: creators building attractive environments, and engineers
  bringing their own robots to evaluate behaviour. Research them separately.
- Desired future experience: hosted website; AI builds from user-provided assets;
  manual and chat editing; later asset import; simplified collision shapes;
  familiar minimal editor with resizable panels (assets/objects left, viewport
  centre, inspector right, collapsible chat/results below).
- AI priorities: environment generation and layout improvements after failure
  analysis. BREAK is still unimplemented; the manual barrier case is not BREAK.
- Warehouse/ground mobile robots first. Shipyards, forests/agricultural ground
  environments are possible later domains subject to validation; aerial and
  underwater remain excluded for now.
- Funding preference: users fund their own AI initially; later possibly credits,
  model/effort controls and connectors. The requested ChatGPT-account sign-in
  does not establish funded general API access. Official docs distinguish
  subscription authentication from billed Platform API-key access; supported
  funding/authentication integration is unresolved. No paid calls authorized.
- GLB/glTF is a candidate for visual assets, not a complete robot behaviour
  description. Determine actual robot/controller requirements through interviews.
- This turn only added research documentation and recorded direction. No app
  expansion, hosting changes, model importer or authentication was implemented.
  Plan.md preserved. Next: conduct first interviews and compare concrete needs,
  switching barriers and pilot commitments before selecting the broader MVP.

## Direct sample, categories and selection, 17 September

- Open sample now links directly to `/lab?scenario=crossdock`; the three-choice
  menu is removed from the composer. The lab still has its scenario selector.
- User-defined object categories are optional WorldObject metadata, trimmed to
  40 characters; blank values use the object's default type grouping. The editor
  accepts new categories or existing suggestions. Grouping can use category,
  physical object type, or no groups. Categories travel with validated JSON and
  existing save/load/undo operations; they do not change registered object types,
  collision geometry or the physical model. Old layouts without category load.
  This is the implementation of the user's explicit recategorization request;
  Plan.md remains intact.
- Selection toggles on repeated object/list clicks; empty floor/background,
  Escape and the editor close button deselect. Orbit drags do not clear selection.
  Floor clicks retain mission placement through the existing inverse transform.
  The selected-object editor now precedes the object list for easier access.
- Checks: `npm.cmd run build --prefix web` passed; backend
  `../.venv/Scripts/python.exe -m pytest -q`: 15 passed, 2 existing warnings.
  New regression covers category JSON round-trip, old layouts, normalization,
  length rejection and unchanged IDs, MJCF, occupancy and routes.
- Actual browser: direct sample navigation, custom category reassignment, undo,
  repeated scene click, empty floor/background deselection, Escape, editor close
  and orbit drag selection retention passed. No captured console errors.
  Restarted `./scripts/start-demo.ps1`; app at http://127.0.0.1:3000.
- Next product ideas (proposals, not implemented scope): reliable project resume,
  camera home/top/focus controls, clearer visual blocked-route diagnosis, direct
  manipulation with redo, run comparison/export, and the real chat build/edit
  loop once API access and budget are supplied. Recording remains the local gate.

## Minimal workspace review, 17 September

- Replaced the entry headline, explanatory copy, workflow steps, sample cards and
  footer with a focused composer and compact sample menu. One short connection
  note remains; Build world stays disabled until live AI is implemented/verified.
- Replaced the application theme dropdown with a sliding sun/system/moon icon
  control, accessible names, pressed states and persisted preferences.
- Simplified the lab header and labels. File actions, robot specifications,
  object lists and measurement notes expand on demand. Undo stays visible.
  Results appear only after a measured run; the viewport makes room for them.
  Reset clears the route/replay/results. Failure explanations remain visible.
- Verification: `npm.cmd run build --prefix web` passed (including TypeScript).
  Actual browser checks passed at desktop and 390 x 844: entry/sample navigation,
  light/dark/system controls, dark preference after reload, expanded file actions,
  object editor, barrier edit, PLAN_FAILED explanation, undo, run and reset.
  The final browser run remained SUCCESS: 28.32 s, 21.95 m, zero contacts,
  0.15 m displayed conservative clearance. No captured browser console errors.
  `git diff --check` passed; original Plan.md SHA-256 is unchanged.
- Local app started with `./scripts/start-demo.ps1` at http://127.0.0.1:3000.
  Changes are local to the simulator app; the independent public submission page
  was not changed or redeployed. No physics, planning or API changes were made.
- Next: user review of the simplified screens, then the existing demo recording
  and live-AI scope discussion. Live AI, video and contest submission remain pending.

## User review changes, 16 September

- Added Light / Dark / Auto selectors across the public page, app home and lab;
  preferences persist per origin. Dark surfaces and scene palette are now neutral
  charcoal/slate. Auto still follows the system. Shared theme runtime copies match.
- Applied the public cube logo and favicon to the app. Replaced the large prompt
  card with a slim rounded input and internal Build world button (still disabled).
- Sample objects have simple numbered labels without changing stable IDs. Names
  are editable; the list offers flat or collapsible category views. Undo is an
  accessible icon. File controls now explicitly describe WorldForge JSON layouts.
- User corrected the corner report: only the body/ring crossed the shading.
  Explained inflated planning exclusions and added planned/recorded trajectory
  distinction. No physics/controller change retained. Expanded tests verify
  physical clearance on corner routes; do not claim exact grid-constrained tracking.
  See `docs/INTERFACE_REVIEW.md` for investigation limits, export explanations,
  the full three-page copy audit and remaining scope.
- Verification: backend `python -m pytest -q`: **14 passed** (2 existing warnings);
  frontend `npm run build`: passed; theme JS syntax/SVG parsing/diff checks passed.
  Browser checked light/dark/auto, persistence, grouping, rename + undo, prompt
  layout, scene colours, actual replay and no captured lab console errors.
  Default RB-THERON run remains SUCCESS, 28.32 s, 21.95 m and zero contacts.
- Public revision deployed to the existing alias https://worldforge-nine.vercel.app/
  via CLI; deployment `dpl_262PGCJkJhEjvpLYrWt6NS5wFYDh` is READY. Browser confirmed
  the new selector and updated working-prototype/recording status.
- Local simulator is running via `scripts/start-demo.ps1`. Next: user review and
  discussion of live AI, demo recording and hosting scope. No paid model calls,
  X posts, asset importer, Claude handoff or challenge submission were initiated.

## Earlier continuation checkpoint: system theme

- Both the submission page and simulator follow the system light/dark preference.
  CSS uses `prefers-color-scheme`; the 3D scene observes preference changes and
  updates its background, floor, grid, walls and lighting without a reload.
- Local browser previews checked both themes on the entry, lab and static page.
  Production frontend build passed; targeted geometry checks passed (2 tests).
- Theme deployed on 16 September using Vercel CLI 59.18.0, after signing in and
  linking `site/` to the existing `rithishrs007projects/worldforge` project.
  `vercel deploy --prod --yes --scope rithishrs007projects` returned READY and
  aliased https://worldforge-nine.vercel.app/ to deployment
  `dpl_EPn1N3B3MBqA148LjULC9KR8c6XB`. Anonymous HTML, theme.css and warehouse.svg
  checks returned HTTP 200 with the expected theme declarations.
- CLI linking generated local environment metadata; `.gitignore` and
  `site/.vercelignore` exclude it from source control and deployment.
- Local app restarted using `scripts/start-demo.ps1`; health reports MuJoCo.
- User requested review of both websites before any further product work.
  Next action: discuss review feedback and remaining scope. Do not start live AI,
  recording or public simulator hosting until that discussion.
- Draft daily X posts are in `docs/X_POST_PLAN.md`; no posts sent or scheduled.

## Product direction clarified on 16 September

- User confirmed the intended flow: a chatbox asks for the environment/simulation,
  builds the world, then leads to robot mission planning and testing. The previous
  simulator-first page was the deterministic foundation, not the completed product.
- `/` now contains the prompt-first entry. `/lab` contains the tested simulator;
  sample cards select a fixture explicitly through the scenario query parameter.
  The Build world control is disabled and explains that live AI is disconnected.
  Prompt text can be copied for Codex; sample selection never pretends to generate
  a world from that text. The live agent layer still requires implementation and
  API validation, not merely adding a key.
- User wants recognizable 3D assets. Original procedural rack uprights, shelves,
  cartons, wooden pallets, packing tables, barriers, charger and robot body/wheel/
  sensor details now replace solid visual cuboids. Conservative collision boxes
  still own planning/physics and selection. These are original geometric models,
  not imported vendor CAD. Humans and pedestrian behaviour are not implemented.
- This visual direction supersedes the original plan's plain-block presentation;
  warehouses and the two robots remain the implemented simulation scope.
- The user is unfamiliar with API keys/budgets. Explained them in plain language.
  No API budget, paid call or key setup has been authorized; retain local demo mode.
- Claude Code handoff was discussed only as an option. **Ask the user before any
  handoff or Claude launch.** Do not create automatic credit-triggered switching.
- Production frontend build passed for `/` and `/lab`; browser checked the entry,
  explicit sample navigation and detailed models. Fixed repeated Three.js shadow
  warnings by selecting the supported PCF shadow mode.

## Local build completed this session

- Local app: http://127.0.0.1:3000. Start/restart with `scripts/start-demo.ps1`.
  Frontend and backend were restarted successfully through this launcher.
- Next.js/React Three Fiber workspace, three asymmetric fixtures, RB-THERON and
  Boxer, selectable mission points, occupancy overlay, object editing and undo,
  validated/canonical JSON import/export and browser save/load are implemented.
- A* rejects corner cutting; shortcut/smoothing segments are revalidated.
  An isolated MuJoCo process executes planar velocity-servo physics, with
  500/50/20 Hz physics/control/telemetry and 1x playback of recorded frames.
- Results include distance, simulation time, forbidden contacts, conservative
  clearance, final goal error/speed, mission/robot snapshots and deterministic
  hash. Full local records and MJCF are in gitignored `artifacts/runs/`.
- Cross-dock RB-THERON default mission: SUCCESS, 28.32 s, 21.9500 m,
  zero forbidden contacts, 0.15418 m minimum conservative clearance,
  0.24335 m goal error and 0.03118 m/s stopped speed.
- `server: ../.venv/Scripts/python.exe -m pytest -q`: **12 passed**.
  Includes both robots in two worlds, reverse starting yaw, determinism, blocked
  route, invalid schema/geometry, worker timeout, contact classification and
  real Three.js vertex-to-MuJoCo geometry parity (rotations and derived walls).
- `web: npm run build`: **passed**, including TypeScript and production output.
- Actual browser checks: rendered warehouse/orientation, robot switch, clearance
  overlay, successful run and metrics, blocked-route explanation, edit rejection,
  undo, JSON import, save/reload/load and floor-based goal picking all passed.
- Dependencies are local and pinned in `web/package-lock.json` and
  `server/requirements.txt`; Python .venv uses bundled Python 3.12.14.
- No paid model calls, public simulator backend, video recording or Product Hunt
  submission was completed. The simulator source is checkpointed locally on
  `codex/local-demo`; this branch has not been pushed to GitHub.
  Next concrete step: rehearse and record `docs/LOCAL_DEMO.md`, then attach the
  real video to the Vercel submission page and verify challenge submission fields.

### Local implementation conventions

Bounds are clear interior dimensions; 0.10 m walls extend outward. One-metre
walls are visible and compiled into physics. The grid is floor-indexed and
conservative, including partial edge cells; overlaps up to 0.01 m count as touching.
No arbitrary free-area rejection threshold is added. Schema/structural failures
are rejected atomically; unreachable but structurally valid edits remain visible
with warnings, and the mission returns PLAN_FAILED. This implements the local
blocked-edit recording requirement. Stopping commands zero velocity inside the
0.25 m goal tolerance and waits for measured speed below 0.05 m/s.

Both robots use manufacturer dimensions and an explicitly estimated 1 rad/s
angular limit; no-selection validation uses Boxer's larger full-turn envelope.
Runs are capped at 120 simulated seconds and 25 wall-clock seconds with one
worker at a time. Seeds are persisted; the current physics/controller has no
stochastic inputs. Browser save/load retains geometry; exported runs also retain
mission and robot. This local demo uses HTTP batch telemetry and full replay,
so public WebSocket reconnection/session machinery remains deferred.

## Live submission page

- Public URL: https://worldforge-nine.vercel.app/
- Vercel project: https://vercel.com/rithishrs007projects/worldforge
- Source: `site/`, commit `83c8146`, pushed to GitHub `main`.
- Deployed through Vercel Drop to the user's existing Hobby account after sign-in.
  Git auto-deployment is not connected: Vercel's current GitHub installation cannot
  access WordForge. Do not assume a push updates the live page.
- Browser checked; anonymous HTTP 200 for HTML, CSS, JavaScript and SVG assets.
- Page clearly says the local prototype and demo video are in development. It
  contains an original concept illustration, not a claimed simulator screenshot.
- Add the real recording through `site/demo-config.js` and redeploy to the same
  project. See `docs/HOSTING.md`. No app API key is needed for this static page.
- Submission-page hosting is complete. The local robot demo is implemented;
  recording and Product Hunt submission remain. No contest submission was made.

## Current direction (overrides the earlier production-first handoff)

The user wants a video rather than a live hosted app for now and reports 64 hours
42 minutes to submission close. `docs/VIDEO_DEMO.md` is the current scope;
`docs/ROBOT_SOURCES.md` lists candidates. Preserve `Plan.md` as the hosted-product
target. The user can use GitHub-connected Vercel if a video page is required.

The earlier setup-only handoff is superseded by the local implementation above.
Do not self-queue a kickoff as a substitute for implementing the next step.

Current gates: local fixture in browser -> one robot plans/runs with real results
-> repeatable edited/blocked scenario -> recording and submission package.
Simulator deployment, concurrency and live API chat are deferred. Use explicit
fixture/import mode and genuine Astra-authored JSON from Codex. Do not present
that as in-app live AI. The user has now confirmed a web link is required; the
Vercel page above provides one. Other challenge eligibility remains unverified.

## Contract and configuration

- Product contract: `Plan.md` (original user file, preserved).
- Product name: WorldForge. Existing checkout/repository name: WordForge.
- Coding model: `gpt-6-astra`, reasoning `high`.
- Project default: `.codex/config.toml`; explicit launcher: `scripts/start-astra.ps1`.
- Implementation kickoff: `docs/ASTRA_BUILD.md`.
- Repo root corresponds to the `astra/` root in Plan section 16. Do not nest it.
- Next.js/R3F frontend; FastAPI/Pydantic backend; CPU MuJoCo workers; Vercel plus
  a Docker VM with a persistent filesystem, exactly as specified in the plan.

## Current evidence

At setup, the repository contained only the initial README and untracked
`Plan.md`. No application, tests, environment file, deployment configuration,
or public product URL existed. No production gate has passed.

Local preflight on 2026-09-14:

| Item | Result |
| --- | --- |
| Git | Available; branch `main`, initial commit `5c9d6a7` |
| Node / npm | 24.12.0 / 11.6.2 |
| Codex CLI | Available; `--model`, `--cd`, and `--config` verified with local help |
| System Python | `python` absent on PATH; `py` reports no installed Pythons |
| Bundled Python | 3.12.14 available; path below |
| Docker / Vercel CLIs | Not found on PATH; installation/account state not otherwise verified |
| OpenAI / Vercel environment credentials | `OPENAI_API_KEY` and `VERCEL_TOKEN` not set in this process; other credential stores not inspected |

Bundled Python on this machine:
`C:\Users\rithi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
Use it to create a project-local environment if compatible; do not modify the
shared runtime or assume this machine-specific path exists on a deployment host.

## Challenge verification

The user confirmed the [GPT-6 Astra Challenge page](https://www.producthunt.com/contests/gpt-6-astra-challenge).
It identifies OpenAI as organizer and 18 September 2026 as the event date.
The [Product Hunt announcement](https://www.producthunt.com/p/producthunt/product-hunt-teams-up-with-openaidevs-for-the-gpt-6-astra-challenge)
directs entrants to build with Astra and schedule a launch for that Friday.

The public submission link redirects to login. No submission has been created
or scheduled. The challenge launch-guide redirect could not be retrieved by the
research tool; detailed eligibility, deliverables, cutoff time and time zone are
not yet verified. The extracted countdown shows zero and is not reliable evidence
that submissions are closed. Confirm timing in the authenticated launch flow.

Use Astra for product world generation/result interpretation as well as coding,
with evidence of actual model/tool calls once implemented. This is the project's
implementation choice, not a claim that the public page requires both uses.

## Original hosted-product gates (deferred)

| Gate | State | Next action |
| --- | --- | --- |
| Foundation / local fixtures | Local pass | Public app/backend deferred; static submission page live |
| Agent BUILD/EDIT | Not started | Follow foundation; live evals require configured model access and budget |
| Robots / planning | Local pass | Both robots, collision-safe routes and blocked case tested |
| MuJoCo RUN | Local pass | Record the tested local workflow |
| Production hardening / launch | Not started | Follow RUN; seven production acceptance items and submission evidence |

## Inputs for the later hosted product

1. Existing Vercel target and backend VM/provider, access, and persistent volume.
   None supplied yet. Prepare deployment artifacts while local work proceeds.
2. A server-side OpenAI API key, Astra API access, and an explicit daily API budget.
   Keep template mode available until configured; never infer unlimited spend.
3. Manufacturer datasheets for RB-THERON and Boxer. Source these during the build;
   ask only about physical parameters that cannot be verified and need estimation.
4. Confirm the contest cutoff/time zone and reconcile with Plan's Friday 14:00
   freeze / 16:00 launch schedule. The plan does not specify a time zone.

## Decision log

- 2026-09-14: Preserve `Plan.md` casing/content and existing checkout name. Use
  WorldForge for user-facing product text, as the plan specifies.
- 2026-09-14: Project-only Astra model defaults; do not change global model or
  permission settings. Launcher passes model/effort explicitly to avoid ambiguity.
- 2026-09-14: Bring robot dimension sourcing forward to foundation because V3
  already depends on the widest supported robot. This changes task order only.
- 2026-09-14: Treat production evidence separately from local checks. Missing
  hosting cannot be recorded as a successful deployment.

## Implementation questions identified by Astra

A GPT-6 Astra / high subagent reviewed the original plan read-only during setup.
The following are review findings and proposals, not silent amendments to the
plan. Resolve material product/physical choices before their affected code; keep
independent scaffolding work moving.

| Affected layer | Finding and proposed treatment |
| --- | --- |
| V3, Plan sections 6 and 17 | Source footprints during Day 1. Use the greatest `collision_radius + safety_margin`, not greatest physical width, as the default planning envelope. |
| Mutation policy, sections 6 and 12 | The rule that V3 failures make a world invalid conflicts with the intended unreachable-edit demo. Proposed policy: reject invalid schema/geometry atomically, retain structurally valid but unreachable edits with diagnostics, and explain blocked runs as PLAN_FAILED. Confirm this distinction before implementing it. |
| Shared geometry, sections 2 and 7 | Define wall thickness/interior boundary semantics, grid indexing and edge cells, conservative rasterization and overlap tolerance once. No numerical free-area rejection threshold is specified. Record a concrete proposal before relying on new physical conventions. |
| Planner, sections 9 and 15 | Forbid diagonal corner cutting and validate continuous segments after shortening/smoothing. Aisle evals must accommodate the circular inflation envelope, not just robot width. |
| Physics, section 7 | Include derived walls in MJCF; use half-extents and explicit angle units. MuJoCo group labels do not set collision masks. Classify forbidden wall/obstacle contacts explicitly. |
| Controller, section 10 | The commanded 0.15 m/s goal speed cannot satisfy SUCCESS below 0.05 m/s. Add a stopping phase and check measured speed; handle arbitrary starting yaw and zero lookahead. |
| Edit targeting, sections 5 and 12 | The schema has no aisle entity for 'aisle B'. Define stable deterministic addressing for aisle width/density tools. Expose undo explicitly and define stale-revision conflict behaviour. |
| Reconnect, section 11 | A last-100-frame replay covers five simulated seconds. Preserve sequence-addressable telemetry so a disconnected client can recover 1x playback after a fast run has finished. |
| Reproducibility, sections 5 and 15 | Persist robot/mission snapshots and engine/controller versions; exclude wall time from deterministic hashes. |

The review was initially read-only. Its setup findings above are historical;
the local conventions and current test evidence at the top supersede them for
the current recorded-demo scope.

## Setup verification

- Launcher `-Check`: passes and resolves this checkout, GPT-6 Astra / high, the
  kickoff document and the installed Codex executable without starting a build.
- PowerShell parser: no launcher syntax errors.
- Python `tomllib`: project configuration parses and contains exactly the two
  intended model settings.
- `git diff --check`: passes. All setup changes are local and uncommitted.
- Original `Plan.md` SHA-256 remains
  `4A7ED9293823FD1553F023F8DFA650F192E2DD755C2D2603C6B5C3961A98CE74`.

## Session handoff

Next action: use `./scripts/start-demo.ps1` and rehearse `docs/LOCAL_DEMO.md`.
The Astra launcher remains available for further coding; it is separate from
the application launcher and does not schedule background work.
