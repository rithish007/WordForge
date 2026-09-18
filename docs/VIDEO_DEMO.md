# WorldForge: recorded local demo

Updated 15 September 2026 from the user's new direction. This supersedes the
public-launch prerequisites and five-day sequencing in `Plan.md` for the current
submission. Preserve the original plan as the later hosted-product target.

## Deliverable and deadline

A working local browser application and a 60-90 second recording showing a
warehouse, a supported AMR, a planned route, an actual run, measurements, and an
explained blocked-route case. Show implemented behaviour and label AI and
simulation modes honestly.

The user reported **64 hours 42 minutes remaining** on 15 September. This is a
user-reported countdown, not a verified absolute cutoff. Recheck the submission
form's cutoff/time zone. Target a finished submission package within 52 hours,
retaining at least 12 hours of margin against that reported countdown. These are
work budgets, not a scheduled automation or promise of background execution.

## Current scope

- Local Next.js/R3F and FastAPI, existing WorldSpec and deterministic compilers.
  Vercel, a VM, TLS and public WebSockets are not prerequisites.
- Prove one robot end to end first; add the second if the tested loop stays stable.
- Two or three fixtures, validated JSON import/export, numeric controls, and the
  edits needed for the recording before broader natural-language vocabulary.
- Real A*, safe smoothing, collision validation, results, reset and local save/load.
- Attempt the planned planar MuJoCo model early. If it cannot pass the local
  smoke within its budget, use the plan's labelled kinematic preview fallback.
- Defer public sharing, hosted concurrency, abuse controls and API spend
  accounting until there is a hosted service or paid API integration.
- Use primitive collision bodies. Optional visual meshes get at most two hours
  after the complete run works; see `docs/ROBOT_SOURCES.md`.

## AI without an application API key

Astra can author software and scenario JSON interactively in Codex using the
user's existing eligible Codex access. The app's own general OpenAI API calls
need appropriate API credentials; Codex login is not an application API endpoint.

Implement explicit **Import WorldSpec** and fixture modes. Ask Astra in Codex
to author a scenario and edits matching the exported schema; import and validate
those real outputs. Save prompt, output and validation evidence. The video may
show the Codex authoring step followed by the local app loading the artifact,
labelled **Astra-authored scenario imported into the local prototype**.

Do not animate fake model replies or present template commands as live AI. Omit
or disable live chat until actual API calls can be exercised. Later API access
can attach behind the typed tool boundary without rewriting the compilers.

## Sequence and budgets

| Time from start | Work | Gate |
| --- | --- | --- |
| 0-8 hours | Local scaffold, schema, fixtures, scene, one robot's verified dimensions | Validated world in browser; correct axes and yaw |
| 8-24 hours | Start/goal, occupancy, A*, run, metrics and reset | Repeatable success and explained blocked route; labelled fallback if needed |
| 24-40 hours | Import/export, demo edits, Astra scenarios, camera and overlays; optional mesh | Full sequence rehearses reliably; invalid inputs explained |
| 40-48 hours | Record, trim 60-90 seconds, captions and screenshots | Video plays cleanly; metrics match saved results |
| 48-52 hours | Listing, accessible video, repository/readme, optional video page | Links work from a clean browser; submission fields ready |
| Remaining | Fixes, upload delays and final submission | Actual submission confirmed before the real cutoff |

## First coding assignment

Build the local fixture-to-browser slice: Next.js/R3F in `web/`, FastAPI in
`server/astra/`, WorldSpec/WorldReport, two asymmetric fixtures, an HTTP endpoint,
and file import through validation. Show local-prototype mode. Add WebSocket
telemetry when needed; it must not delay the first visible world.

Keep the existing frame/units. Check boundary validation and scene/occupancy
parity, then add robot, planner and simulator. Local gates suffice for this demo;
public gates belong to the later hosted product. Record real commands and checks
in `PROJECT.md`. Do not self-queue another kickoff instead of implementing.

## Recording sequence

1. Explain testing a warehouse robot before deployment.
2. Briefly show Astra creating a WorldSpec in Codex, then import its actual output.
3. Orbit the warehouse; show the robot and its clearance envelope.
4. Set Receiving to Packing and display the planned route.
5. Run; show actual time, distance, collisions and clearance.
6. Apply a blocking edit and show the explained failure.
7. State implemented scope and the next step: live in-app AI/public hosting.

PLAN_FAILED means no route; do not call it a physics collision. If using kinematic
preview, keep its label visible throughout the recording.

## Submission and optional hosting

**Confirmed by the user, 15 September:** the submission needs a web link. Host
the static submission page from `site/` on Vercel now and attach the real recording
when ready. This does not require deploying the simulator backend. See
`docs/HOSTING.md` for deployment details.

The public announcement calls for a Product Hunt launch on 18 September. Its
detailed launch guide was inaccessible to the research tool. **A video-only entry,
exact submission fields, cutoff and time zone remain unverified.** Check these
in the authenticated submission flow; choosing video-first does not establish
eligibility. No listing has been submitted or scheduled.

The submission page is now live at https://worldforge-nine.vercel.app/ and awaits
the recording. It does not host a running robot backend. The initial deploy used
Vercel Drop because the GitHub installation cannot yet access WordForge. See
`docs/HOSTING.md` before updates; Git auto-deployment is not connected.

Sources checked 15 September:

- [Challenge](https://www.producthunt.com/contests/gpt-6-astra-challenge)
- [Announcement](https://www.producthunt.com/p/producthunt/product-hunt-teams-up-with-openaidevs-for-the-gpt-6-astra-challenge)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Vercel GitHub integration](https://vercel.com/docs/git/vercel-for-github)
