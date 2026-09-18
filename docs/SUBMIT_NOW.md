# WorldForge submission handoff

17 September 2026. User reports 11 hours remaining. Stop feature expansion;
finish the existing prototype's presentation and submission evidence.

## Do these next, in order

1. Open the [challenge submission form](https://www.producthunt.com/posts/new?contest=gpt-6-astra-challenge&ref=contest_preview),
   sign in and check the actual cutoff/time zone, launch date, required media and
   whether a locally running prototype with a public demo page is eligible.
   The public page names 18 September but its fetched countdown showed zero;
   its Notion guide returned 404. Neither establishes eligibility or remaining time.
2. The supplied 2:37 recording is embedded from Vercel Blob. Review its content
   against the submission requirements; trim only if the form requires it.
3. Open the public page and play the recording. The simulator itself still runs
   locally; do not describe the video player as a hosted interactive simulator.
4. The static site has Vercel Web Analytics and portfolio links. Future recording
   replacements use site/demo-config.js; redeploy the same existing project.
5. Use the copy below, the real recording, logo and actual app screenshots in
   the submission form. Follow its actual requirements. Review before posting.
   Save the confirmation URL/screenshot; a draft or scheduled page is not proof
   of a completed challenge submission.

If the form requires a live public simulator, a video page alone is insufficient.
Do not describe localhost as a public demo. Resolve that requirement first.

## Recording script (approximately 80 seconds)

| Time | Action | Suggested narration |
|---|---|---|
| 0–8s | Landing page, then local Build page | “WorldForge is a warehouse robotics prototype built with GPT-6 Astra.” |
| 8–18s | Open sample; orbit the world | “Start with a warehouse layout, choose an AMR and set a mission.” |
| 18–28s | Select Rack 1; show inspector/category; deselect | “The environment is editable, with shared geometry for planning and simulation.” |
| 28–40s | Plan route; Run | “The planner checks robot clearance, then runs an isolated planar MuJoCo simulation.” |
| 40–58s | Let replay progress; show measurements | “We can inspect time, distance, contact count and minimum clearance.” Read actual displayed values only. |
| 58–70s | Add cross-aisle barrier; Plan route | “Blocking the passage gives an explained planning failure.” This is not a physics collision or autonomous BREAK. |
| 70–80s | Undo; show restored world | “The prototype runs locally. Public hosting, custom models and autonomous stress testing are next.” |

Keep the physics label visible. Do not expose an API key while recording.
Do not simulate a successful AI chat. A sample/imported world is a sample/imported
world, even though Astra helped build the software.

## Optional live chat check (timebox 30 minutes)

The connection implementation has mocked tests; live generation has not yet
been verified. Use your own funded Platform project with Astra access:

1. Click Connect AI; enter the key privately; set a small daily allowance (for
   example $5); read and accept the funding consent. Connection success only
   means the server accepted the key format, not that API access works.
2. Enter: “Create a 20 by 16 metre warehouse with four racks, a wide central
   aisle, receiving at (-8,-6) and packing at (8,6). Keep the zones connected.”
3. Build. Expect a validated layout in the simulator or a specific error. Verify
   its objects and zones, then Plan route and Run. Export the world/run JSON.
4. In Chat: “Rename Rack 1 to Inspection rack and set its category to Test area.
   Keep all geometry and IDs unchanged.” Verify the actual change and Undo.
5. Disconnect the key. Confirm the sample/manual workflow still works.

If generation fails, preserve the error and stop retrying blindly. Key/model
access errors need the matching API project; timeout reservations are retained.
Up to $1.2288 is reserved per request under current conservative accounting.
Never share the key in chat, screenshots, issue reports or exported evidence.
If no live call succeeds, omit live AI generation from the recorded claims.

## Copy ready for the form

**Name:** WorldForge

**Tagline:** Build warehouse worlds. Test robot missions.

**Website:** https://worldforge-nine.vercel.app/

**Repository:** https://github.com/rithish007/WordForge

**Description:**

WorldForge is a warehouse robotics prototype built with GPT-6 Astra. Edit a
layout, choose an AMR, plan a route and inspect measured MuJoCo results. The
simulator currently runs locally; the website presents the prototype.

**Maker comment draft:**

I built WorldForge to explore a shorter path from a warehouse idea to a robot
test. The working prototype includes editable layouts, two AMRs, clearance-aware
planning, planar MuJoCo runs and replay. Astra helped build the application.

The visitor-funded AI connection is implemented but still awaiting live model
validation. Custom 3D model import, autonomous BREAK testing and the public
simulator backend are not yet available. I would value feedback from robotics
engineers on the test scenarios they need most.

Update this copy only as new behaviour is actually verified. After attaching the
recording, explicitly mention the recorded demo. Do not claim a video exists yet.

## Decisions for after submission

- **Analytics:** Start with Vercel Web Analytics for traffic/referrers. Clarity is
  for later usability/session-replay research; GA4 for later acquisition funnels.
  None added in this pass. Never collect keys, prompts or imported file contents.
- **Cloud physics:** Keep Next.js on Vercel; run FastAPI + headless CPU MuJoCo in
  one Docker backend with persistent disk, TLS and bounded isolated workers.
  Browser renders telemetry. A Render Docker service/disk is a possible managed
  host, or the planned VM. No GPU is needed for this current CPU simulation.
  Owner still pays backend compute even when visitors pay for their own AI.
  Current loopback restrictions, rewrites, session/run/queue/abuse controls and
  production checks must be completed before public exposure. A temporary tunnel
  still needs the local machine online and is not the proposed submission fix.
- **Accounts:** No signup needed for an anonymous sample demo. Add identity and
  project ownership before private cloud assets, cross-device saves or credits.
  An API connection cookie is not a user account.
- **BREAK:** Budgeted automated search over permitted scenario variations to
  expose reproducible failures. Change aisle widths/obstacle positions/mission
  conditions, run trials, classify failures and save the smallest useful failing
  case. Automatic layout repair is the later FIX step. A manually placed barrier
  demonstrates a failure, not BREAK.
- **Import:** Currently only WorldForge JSON is accepted. Test `crossdock.json`,
  `angled_depot.json` and `sealed_crossdock.json` in `examples/` now. Next importer:
  small self-contained GLB warehouse props (crate, pallet, rack, barrier), explicit
  scale/orientation and editable primitive collision proxies. An attractive mesh
  alone does not supply robot joints, inertia, sensors or a controller. Use the
  verified RB-THERON/Boxer descriptions in `ROBOT_SOURCES.md` before broad robot
  formats; MuJoCo Menagerie is a later physics-model reference, not a supported
  upload format today.
- **Storage:** Current JSON is parsed in the browser and sent to the local
  validator; Build handoff uses sessionStorage, Save locally uses localStorage,
  and Export downloads to the user's device. Run artifacts are on the backend's
  local disk. No cloud upload library or cloud project store exists. Future
  visual-only assets can start in IndexedDB; for shared durable projects use
  private object storage, signed access, owner-scoped metadata, quotas and expiry.
  Storage is separate from simulation compute and from the AI API key.

Official references: [challenge](https://www.producthunt.com/contests/gpt-6-astra-challenge),
[Vercel Analytics privacy](https://vercel.com/docs/analytics/privacy-policy),
[Clarity recordings](https://learn.microsoft.com/en-us/clarity/session-recordings/recordings-overview),
[Render Docker](https://render.com/docs/deploying-an-image),
[persistent disks](https://render.com/docs/disks),
[Astra API model](https://developers.openai.com/api/docs/models/gpt-6-astra),
[MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie).
