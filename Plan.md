# PLAN.md — WorldForge v0.1 Build Plan

**Launch: Friday 18 September 2026, public hosted prototype.**
**Build window: Monday 14 → Friday 18 September. Five days.**

---

## 0. What this document is

This is the build contract for WorldForge v0.1. It defines exactly what ships Friday, the
conventions every component must obey, and the daily gates that decide whether the next
piece gets built.

Three constraints are fixed and drive every decision below:

1. **The Friday date is fixed.** Scope is the variable. Section 4 is the cut list.
2. **No robot or environment assets exist.** v0.1 is primitives-only. There is no asset
   pipeline on the critical path.
3. **The launch points at a public URL anyone can run.** Session limits, resource caps and
   cost controls are launch requirements, not post-launch work. Deployment happens on Day 1,
   not Day 5.

Where this document and an older plan disagree, this document wins. Where this document is
silent, ask before inventing a convention.

---

## 1. Launch definition

A stranger opens a public URL, types what they want to test, answers one or two questions,
watches a warehouse appear, edits it in plain language, picks an AMR, sets a start and goal,
and watches the robot drive the planned route in physics while collisions, distance and time
are recorded. They can share the result by URL.

**Launch acceptance (all must hold on the production URL):**

- [ ] Ten unseen build prompts produce valid, navigable worlds.
- [ ] Ten canonical edit requests apply correctly to the correct objects.
- [ ] Both robots plan and execute a mission in five different generated layouts.
- [ ] Every failure mode renders as an explained state, never a spinner or a stack trace.
- [ ] Three concurrent visitors can each run a simulation without degrading each other.
- [ ] A shared project URL reopens the same world for a different person.
- [ ] Daily LLM spend is capped and the cap degrades gracefully instead of erroring.

If an item is not met by Friday 14:00, the feature it belongs to is cut, not shipped broken.

---

## 2. Conventions

Non-negotiable. Every compiler, planner and renderer obeys these. Most integration bugs in a
system like this are unit and frame bugs, so they are settled here once.

**Units.** Metres, kilograms, seconds, radians internally. The only exception is that
`WorldSpec` and `RobotSpec` express rotation as `yaw_deg` in degrees, because a language model
writes degrees more reliably than radians. Conversion happens at parse time, exactly once.

**Frame.** Ground plane is XY. +Z is up. +X is east, +Y is north. This is MuJoCo-native.
`WorldSpec` is authored Z-up and is never stored in any other frame.

**Rendering conversion.** The Three.js scene wraps all world content in a single root group
with `rotation.x = -π/2`. World XY then maps to the ground plane on screen and no per-object
conversion exists anywhere. The conversion appears in exactly one file.

**Origin.** World origin is the centre of the floor, at Z = 0. A world of width W and length L
spans X ∈ [−W/2, W/2], Y ∈ [−L/2, L/2].

**Object placement.** Every object is an axis-aligned box rotated only about Z. `center` is the
2D centre of its footprint. Objects sit on the floor; their vertical extent is `[0, height]`.
There is no 3D position, no roll, no pitch, and no nested transform hierarchy in v0.1. This
single restriction removes an entire class of divergence between the three compilers.

**Identifiers.** `snake_case`, unique within a world, stable for the lifetime of the object.
Edits never renumber existing IDs, because the user and the model both refer to objects by ID
and label across turns. Deleting `rack_a1` does not promote `rack_a2`.

**Determinism.** Given identical `WorldSpec`, `RobotSpec`, `MissionSpec` and seed, a run
produces identical telemetry. Physics timestep is fixed. The simulation clock is fully
decoupled from wall clock and from network timing.

---

## 3. Architecture

The model reasons about intent. Deterministic code owns correctness. The model never writes
Three.js state, never writes MJCF, and never writes application state directly. It calls typed
tools that mutate specs, and the specs compile.

```text
User intent
    ↓
Agent (tool calls only)
    ↓
WorldSpec / RobotSpec / MissionSpec        ← single source of truth
    ↓
Deterministic compilers
    ├── React Three Fiber scene   (client, from WorldSpec)
    ├── Occupancy grid            (server, from WorldSpec + RobotSpec)
    └── MJCF physics model        (server, from WorldSpec + RobotSpec)
```

The three compilers are the correctness spine. They are tested against each other (§15), not
just individually.

**Deployment topology, from Day 1:**

```text
Browser (Vercel, Next.js)
    ↓  HTTPS + WSS
FastAPI instance (single VM, Docker)
    ├── agent orchestration → LLM API
    ├── spec store → filesystem /data/projects
    └── simulation pool → N MuJoCo subprocesses
```

MuJoCo runs headless and CPU-only. The server never renders, because the browser renders.
No GPU, no EGL, no display server. This is the reason a public deploy is affordable on a
small VM and it should not be given up casually.

---

## 4. Cut list

Removed from v0.1 because the date is fixed. Each has a one-line reason, so nothing gets
quietly re-added.

| Cut | Reason |
| --- | --- |
| GLB / glTF assets, vendor CAD, Sloyd/Meshy/Tripo | No assets exist; conversion is a full day on the critical path for two downstream layers. |
| Screenshot-based editing | Depends on stable BUILD+RUN, which lands Thursday at the earliest. |
| Project file panel / file tree UI | Zero demo value relative to cost. |
| BREAK-lite autonomous testing | Requires a stable RUN loop plus a failure taxonomy the agent can reason over. Post-launch. |
| Multi-stop missions | One start, one goal is enough to prove the loop. |
| Named robot dynamics (wheel torque, slip) | Planar velocity-controlled base is stable and contactful. §10. |
| User accounts, auth | Capability URLs are sufficient and cheaper. §14. |
| Databases | Filesystem on a single instance. |

**Kept despite the cut, because it is nearly free:** both robots. With primitive geometry a
second AMR is a row in a table, not a modelling task, and "choose your robot" is load-bearing
for the product story.

**Visual direction given no assets.** Flat-shaded primitives with a deliberate, consistent
palette, crisp edge lines, readable floor-plane labels and a single strong accent for the
robot and path. Uniform intent reads as a technical aesthetic. Mixed-fidelity reads as
unfinished. Do not chase realism you cannot reach.

---

## 5. Data model

### 5.1 WorldSpec

```json
{
  "schema_version": 1,
  "id": "wld_7f3a2c",
  "name": "Compact fulfilment warehouse",
  "type": "warehouse",
  "bounds": { "width": 24.0, "length": 18.0, "height": 5.0 },
  "grid": { "resolution": 0.10 },
  "zones": [
    {
      "id": "zone_receiving",
      "label": "Receiving",
      "type": "receiving",
      "center": [-9.0, 6.0],
      "extent": [6.0, 4.0],
      "yaw_deg": 0.0
    }
  ],
  "objects": [
    {
      "id": "rack_a1",
      "label": "Rack A1",
      "type": "rack",
      "center": [-4.2, 3.8],
      "footprint": [2.70, 1.10],
      "height": 2.20,
      "yaw_deg": 90.0,
      "blocking": true
    }
  ],
  "assumptions": [
    "Aisle width set to 1.6 m to represent narrow-aisle operation."
  ]
}
```

Notes that matter:

- **Zones carry `extent`, not just a point.** Without it, "start at Receiving" and "move
  Packing to the east wall" cannot be implemented. Zones are non-blocking floor markers.
- **Objects carry `footprint` and `height` explicitly.** Obstacle inflation and MJCF geom
  sizing both read them. There is no scale multiplier and no implicit asset dimension.
- **`blocking`** decides whether the object enters the occupancy grid and gets a collidable
  MuJoCo geom. Floor decals and zone markers are non-blocking.
- **Walls and floor are derived from `bounds`.** They are not objects and cannot be deleted.
- **`assumptions`** is written by the agent and surfaced in chat. Every defaulted parameter
  the user did not specify appears here. This is how the product stays honest about what it
  guessed.

**Object type registry** (server-side, with canonical default footprint and height per type;
the agent may override within validated ranges):

`rack`, `pallet`, `crate`, `barrier`, `pillar`, `charger`, `packing_station`, `door_frame`

Eight types. Adding a ninth is a post-launch decision.

### 5.2 RobotSpec

```json
{
  "schema_version": 1,
  "id": "rb_theron",
  "name": "RB-THERON",
  "manufacturer": "Robotnik",
  "drive": "differential",
  "footprint": [0.00, 0.00],
  "height": 0.00,
  "mass": 0.00,
  "max_linear_velocity": 0.00,
  "max_angular_velocity": 0.00,
  "collision_radius": 0.00,
  "safety_margin": 0.05,
  "source": "vendor_datasheet",
  "datasheet_url": ""
}
```

**Do not fabricate these numbers.** Fill both robots from the manufacturer datasheet before
Day 3 begins; it is a fifteen-minute task and it blocks planning. `footprint` is
`[length, width]`. `collision_radius` is derived as half the footprint diagonal and is what
inflation uses. If a value genuinely cannot be sourced, set `"source": "estimated"` and
surface that in the robot picker. An honest estimate labelled as an estimate is fine. An
unlabelled guess is not.

### 5.3 MissionSpec

```json
{
  "schema_version": 1,
  "id": "msn_0a91",
  "world_id": "wld_7f3a2c",
  "robot_id": "rb_theron",
  "start": { "position": [-9.0, 6.0], "yaw_deg": 0.0, "zone_id": "zone_receiving" },
  "goal":  { "position": [8.5, -5.2], "yaw_deg": null, "zone_id": null },
  "goal_tolerance": 0.25,
  "time_limit_s": 120.0,
  "seed": 0
}
```

`zone_id` records provenance when a point came from a named zone, so a later zone move can
offer to follow it. `yaw_deg: null` on the goal means heading is unconstrained, which is the
default for v0.1.

### 5.4 RunResult

```json
{
  "schema_version": 1,
  "id": "run_0004",
  "mission_id": "msn_0a91",
  "world_hash": "sha256:...",
  "robot_id": "rb_theron",
  "seed": 0,
  "status": "SUCCESS",
  "sim_time_s": 28.4,
  "wall_time_s": 3.1,
  "planned_path_length_m": 21.7,
  "travelled_distance_m": 22.3,
  "collisions": [],
  "final_pose": [8.44, -5.09, 1.62],
  "min_clearance_m": 0.31,
  "telemetry_path": "runs/run_0004.jsonl"
}
```

`world_hash` plus `seed` make a run reproducible. `min_clearance_m` is nearly free to compute
and is the most interesting number in the payload, because it is the one that tells a robotics
engineer how close the run came to failing.

---

## 6. Validation and failure taxonomy

Everything that can go wrong gets a name, a status code and a UI state. A silent failure or a
spinner that never resolves is a launch blocker.

### 6.1 Validation tiers

Run all three after every world mutation, before the user can start a run.

**V1 — Schema.** Pydantic models. Types, ranges, enum membership, ID uniqueness.

**V2 — Structural.** All objects inside bounds. No object–object overlap beyond 1 cm. World
dimensions within sane limits (4 m to 60 m per side). Object count under 400.

**V3 — Navigability.** Build the inflated occupancy grid for the selected robot (or the
widest supported robot if none selected). Compute connected components of free space. Report
free-area fraction, the largest reachable component, and whether every zone centre is inside
it.

V1–V3 produce a `WorldReport` returned to the agent on every `update_world` call. The agent
sees the consequences of its own edit before the user does.

### 6.2 Statuses

| Status | Meaning |
| --- | --- |
| `SUCCESS` | Goal reached within tolerance with no forbidden contact. |
| `COLLISION` | Robot geom contacted a blocking geom above the force threshold. |
| `TIMEOUT` | `time_limit_s` of simulated time elapsed before the goal was reached. |
| `STUCK` | Travelled under 0.05 m over 5 s of sim time while a valid path remained. |
| `PLAN_FAILED` | No collision-free path exists between start and goal. |
| `INVALID_MISSION` | Start or goal is inside an inflated obstacle or outside bounds. |
| `INVALID_WORLD` | V1–V3 failed. |
| `ABORTED` | User stopped the run. |
| `RUNTIME_ERROR` | Anything else. Logged with a run ID shown to the user. |

### 6.3 The edit-to-unreachable path

`PLAN_FAILED` is not an edge case, it is the expected consequence of the product's own edit
vocabulary. "Make this harder to navigate" and "increase obstacle density" are first-class
features that can seal off the goal, and the demo deliberately asks for one.

Handling is therefore a feature, not an error path:

1. `update_world` runs V3 and sees the goal component became unreachable.
2. The agent is told which edit caused it and what the free-area fraction was before and after.
3. The agent tells the user plainly and offers a specific relaxation: widen the blocking aisle,
   remove the offending object, or move the goal to the reachable component.
4. When a run does return `PLAN_FAILED`, the UI overlays the inflated occupancy grid with the
   goal's component highlighted, so the blockage is visible rather than described.

Done well this is the moment that makes the product look like it understands robotics. Done
badly it is the moment the demo dies.

---

## 7. Compilers

### 7.1 Scene (client)

A pure function of `WorldSpec`. Boxes for objects, an instanced mesh per object type, a
procedural floor and four walls from `bounds`, floor-plane text for zone labels. No AI writes
here, ever. Re-render on spec change with object identity keyed by ID so unchanged objects are
not rebuilt.

### 7.2 Occupancy grid (server)

`compile_occupancy(world, robot) -> Grid`

Resolution from `world.grid.resolution`, default 0.10 m. Rasterise every `blocking` object as
its rotated footprint rectangle, plus the four walls. Dilate by
`ceil((robot.collision_radius + robot.safety_margin) / resolution)` cells using a circular
structuring element. Cache keyed by `(world_hash, robot_id)`.

### 7.3 MJCF (server)

`compile_mjcf(world, robot) -> str`

- Floor plane, geom group 0, collides with everything.
- One static box geom per blocking object, group 1, at the same centre, footprint and yaw.
- Robot body, group 2, box geom sized to `robot.footprint × robot.height`, mass from
  `RobotSpec`, inertia from the box approximation.
- Contact between group 2 and group 1 is a collision event. Contact between group 2 and
  group 0 is expected and ignored.
- Timestep 0.002 s, `integrator="implicitfast"`.

The generated MJCF is written to the run directory so any failure is reproducible offline.

---

## 8. Robots

Two AMRs, primitive geometry, real dimensions.

| | RB-THERON (Robotnik) | Boxer (Clearpath) |
| --- | --- | --- |
| footprint `[l, w]` | from datasheet | from datasheet |
| height | from datasheet | from datasheet |
| mass | from datasheet | from datasheet |
| max linear velocity | from datasheet | from datasheet |
| max angular velocity | from datasheet, else estimated | from datasheet, else estimated |

Geometry is a coloured box with a direction indicator and a visible footprint ring on the
floor. The ring is not decoration; it is the inflation radius made visible, and it explains why
the planner refuses a gap that looks passable.

---

## 9. Planning

```text
WorldSpec + RobotSpec
    ↓  compile_occupancy
inflated grid
    ↓  A*  (8-connected, Euclidean heuristic, deterministic tie-break on (g, id))
raw grid path
    ↓  line-of-sight shortcut  (Bresenham over inflated grid, greedy furthest visible)
    ↓  Chaikin corner cutting, 2 iterations
    ↓  resample to 0.25 m spacing
waypoint list → visualisation + controller
```

The shortcut and smoothing steps are not polish. Raw 8-connected A* produces 45°-quantised
staircases, and a differential-drive robot tracking a staircase oscillates visibly. The
smoothing step is the difference between a demo that looks engineered and one that looks
broken.

Reject before planning: start or goal in an occupied cell, or outside bounds →
`INVALID_MISSION`. Empty open set → `PLAN_FAILED`.

---

## 10. Control and physics

**Base model.** A planar base: slide-X, slide-Y and hinge-Z joints with velocity actuators.
The controller converts body-frame `(v, ω)` to world-frame `(ẋ, ẏ, θ̇) = (v·cosθ, v·sinθ, ω)`.
The nonholonomic constraint lives in the controller, not the physics. The base is fully
contactful, so collisions are real, while being far more stable than torque-driven wheels
built from unverified inertia numbers. Wheeled dynamics is a post-launch upgrade behind the
same interface.

**Tracking law.** Pure pursuit.

- Lookahead `L = 0.8 m`, clamped to the remaining path length.
- `ω = 2·v·sin(α) / L`, where `α` is the bearing to the lookahead point, clamped to `ω_max`.
- `v = v_max`, scaled down on high curvature by `v = min(v_max, 0.6 / |κ|)`, and ramped
  linearly to 0.15 m/s inside 1.0 m of the goal.
- Waypoints behind the robot are dropped each tick.

**Termination.** `SUCCESS` when within `goal_tolerance` of the goal and `|v| < 0.05 m/s`.
`COLLISION` on any group-2/group-1 contact with normal force above 1 N. `TIMEOUT` at
`time_limit_s` of sim time. `STUCK` per §6.2.

**Rates.** Physics 500 Hz (`dt = 0.002`). Control 50 Hz, so 10 physics steps per control tick.
Telemetry 20 Hz on the simulation clock.

**Determinism and pacing.** The simulation runs as fast as the CPU allows and stamps every
telemetry frame with sim time. The client buffers roughly 200 ms and plays back at 1×,
interpolating pose between frames. Nothing in the loop reads a wall clock and nothing waits on
the network. A 30-second mission completes server-side in a few seconds, which is what makes
per-visitor cost acceptable and BREAK feasible later.

---

## 11. Simulation runtime

**Lifecycle.**

```text
IDLE → VALIDATING → PLANNING → COMPILING → RUNNING → DONE
                         ↓          ↓          ↓
                   PLAN_FAILED  INVALID_*   COLLISION / TIMEOUT / STUCK / ABORTED
```

Every transition is broadcast. The client never infers state from the absence of messages.

**Abort.** The client sends `run.abort`. The worker checks a flag each control tick and
returns `ABORTED` with partial telemetry. Nothing is left orphaned.

**Isolation.** Each run executes in a subprocess with a wall-clock hard kill at 20 s and a
memory cap. A crashed run cannot take down the API.

**Reconnect.** `run_id` is durable. On reconnect the client resubscribes and the server replays
the last 100 frames plus current state. A dropped WebSocket must not lose a run.

**Protocol.** Versioned JSON over one WebSocket. Stable across local and cloud so the backend
can move without a frontend rewrite.

```json
{"t":"world.updated","world":{}, "report":{}}
{"t":"run.state","run_id":"run_0004","state":"RUNNING"}
{"t":"run.frame","run_id":"run_0004","seq":42,"sim_t":1.234,"pose":[1.2,3.4,0.78],"v":0.61,"w":-0.08}
{"t":"run.result","run_id":"run_0004","result":{}}
{"t":"chat.delta","text":"..."}
{"t":"error","code":"RATE_LIMITED","message":"..."}
```

---

## 12. Agent layer

**Questioning.** One to three questions before the first build, never more. Ask only where the
answer changes geometry or difficulty. Everything else is defaulted and written into
`WorldSpec.assumptions`, which is shown in chat. Stating a good assumption beats asking a
mediocre question.

**Tools.** The agent has no other way to change state.

```text
create_world(description, constraints)     -> WorldSpec, WorldReport
update_world(ops[])                        -> WorldSpec, WorldReport
get_world()                                -> WorldSpec
list_robots()                              -> RobotSpec[]
set_robot(robot_id)                        -> MissionSpec
set_mission(start, goal)                   -> MissionSpec
plan_path()                                -> path | PLAN_FAILED
start_run() / abort_run() / get_run(id)    -> RunResult
```

**Edit operations.** `update_world` accepts a typed op list, not free-form JSON. Ten ops cover
the launch vocabulary:

`add_object`, `remove_object`, `move_object`, `rotate_object`, `resize_object`,
`set_aisle_width`, `move_zone`, `resize_zone`, `set_object_density`, `set_world_dimensions`

Each op is validated independently, then the whole list is applied atomically. A failed op
rolls back the batch and returns a reason the agent can act on. Partial application is the
fastest way to corrupt a world the user thought they understood.

**Budget.** Use a small fast model for edit-op classification and a stronger model for initial
world generation and result interpretation. Cap `max_tokens`. Cache the system prompt.

**Prohibited.** The agent does not author MJCF, does not write scene state, does not invent
robot specifications, does not carry the whole project history into every call, and does not
spend reasoning effort on a one-object move.

---

## 13. Public deployment

Deployed Day 1 and redeployed at the end of every day. The first deploy must not be Friday.

**Topology.** Next.js on Vercel. FastAPI in Docker on a single 4 vCPU / 8 GB VM. Filesystem
persistence on an attached volume. One instance; horizontal scaling is post-launch.

**Limits.**

| Scope | Limit |
| --- | --- |
| Instance | 3 concurrent simulations, queue depth 10, reject beyond with a clear message |
| Session | 1 concurrent run, 10 runs/hour, 25 agent messages |
| Run | 120 s sim time, 20 s wall clock hard kill |
| Request | 2,000 character prompt cap |
| Global | daily LLM spend cap |

**Degradation, not failure.** When the daily spend cap is hit, the app switches to template
mode: three preset warehouses, full editing of numeric parameters, full RUN, no agent. The
product still demonstrates its core loop with the AI layer switched off. A 500 page on launch
day is worse than a reduced product.

**Abuse surface.** IP-based rate limiting, unguessable project IDs, no user-supplied file
paths, no arbitrary code path from prompt to filesystem, structured logs per run with a
request ID surfaced in error UI.

---

## 14. Persistence and sharing

```text
/data/projects/<project_id>/
├── project.json        # name, created_at, assumptions, chat summary
├── world.json
├── mission.json
└── runs/
    ├── run_0001.json
    └── run_0001.jsonl  # telemetry
```

`project_id` is a 128-bit random token. The URL is the capability: possession of the link
grants access. No accounts, no login, no password reset, no email. Every project is
shareable by default, which is the cheapest growth mechanism available on launch day.

World history: keep the last 20 `world.json` versions in `world_history/` so "undo that" works
as a tool call. This is a few lines of code and covers a request that will be made within the
first minute of any demo.

---

## 15. Testing

**Compiler parity test.** The highest-value test in the codebase, and it belongs in Day 1's
acceptance criteria while it is trivial to write. For each fixture world: rasterise the
uninflated occupancy grid, rasterise the MJCF geom footprints, rasterise the client-side
bounding boxes exported from the scene compiler. Assert the three agree within one cell.
This is what stops "the browser shows a clear aisle and MuJoCo reports a collision."

**Build evals.** `evals/build/*.json` — ten prompts with structural assertions: schema-valid,
bounds in range, minimum object count, narrowest aisle ≥ widest robot width + 2 × safety
margin, every zone reachable.

**Edit evals.** `evals/edit/*.json` — ten edits over fixture worlds with assertions on which
IDs changed and which did not. Asserting that unrelated objects were left alone matters as
much as asserting the intended change happened.

Both eval sets are committed and run on every prompt change. Prompt edits silently regress
cases nobody is currently looking at, which is precisely what a committed fixture set catches.

**Smoke test.** Headless end-to-end: load fixture world → plan → run → assert `SUCCESS` and a
deterministic result hash. Runs pre-deploy. A failing smoke test blocks the deploy.

---

## 16. Repository layout

```text
astra/
├── AGENTS.md            # instructions for coding agents
├── PLAN.md              # this file
├── PROJECT.md           # live state: decisions, assumptions, open issues
├── web/
│   ├── app/
│   ├── components/scene/    # WorldSpec → R3F, one conversion point
│   └── lib/protocol.ts      # shared message types
├── server/astra/
│   ├── specs/               # pydantic models, validation tiers
│   ├── compile/             # occupancy.py, mjcf.py
│   ├── plan/                # astar.py, smooth.py
│   ├── sim/                 # runner.py, control.py, pool.py
│   ├── agent/               # tools.py, ops.py, prompts/
│   └── api/                 # ws.py, http.py, limits.py
├── evals/
└── tests/
```

---

## 17. Day plan

Each day ends with a deploy to the production URL and a gate. **A gate that fails cuts scope;
it does not extend the day.**

### Monday 14 — Foundation and first deploy

- Conventions (§2) written into code as constants, in one module, before anything else.
- `WorldSpec` pydantic model, V1–V3 validators, `WorldReport`.
- Procedural scene compiler: floor, walls, eight object types, zone labels, instancing.
- FastAPI, WebSocket, protocol types shared with the client.
- Two fixture worlds committed.
- Compiler parity test for occupancy vs client bounding boxes.
- **Deploy to the production URL.**

**Gate:** a stranger on the public URL sees a fixture world rendered from a server-sent
`WorldSpec`, and editing the fixture JSON changes what they see. No AI involved.

### Tuesday 15 — Agent BUILD and EDIT

- Chat UI and streaming.
- Agent orchestration, tool layer, the ten typed edit ops, atomic apply with rollback.
- Questioning policy and `assumptions` surfacing.
- World history and undo.
- Build evals (10) and edit evals (10) committed and green.
- **Deploy.**

**Gate:** 10/10 build evals and 8/10 edit evals pass. If below that, cut the weakest ops and
fix the rest rather than shipping ten unreliable ones.

### Wednesday 16 — Robots, planning, mission definition

- Both `RobotSpec` files populated **from datasheets** before anything else.
- Robot picker, footprint ring, start/goal by click and by named zone.
- Occupancy compile, inflation, A*, shortcut, smoothing, resampling.
- Path visualisation, `INVALID_MISSION` and `PLAN_FAILED` UI including the occupancy overlay.
- **Deploy.**

**Gate:** both robots plan a collision-free path in five different generated layouts, and a
deliberately sealed-off goal produces the explained `PLAN_FAILED` state rather than a hang.

### Thursday 17 — MuJoCo RUN

The risk day. Everything upstream of it is now shippable on its own.

- `compile_mjcf`, planar base, pure pursuit, contact classification.
- Run lifecycle, telemetry streaming, client interpolation, abort, reconnect.
- `RunResult`, results panel, run history.
- Simulation pool, session limits, hard kills.
- **Deploy.**

**Gate at 18:00: an end-to-end run completes on the production URL.**

**Fallback if the gate fails.** Ship kinematic preview: the robot follows the smoothed path at
commanded velocity with geometric collision checks against the uninflated grid, no physics.
Label it in the UI as *Kinematic preview — physics backend in progress*, and keep MuJoCo behind
a flag. This preserves the full narrative loop and is honest. What is not acceptable is
shipping kinematic playback while claiming MuJoCo physics.

### Friday 18 — Harden and launch

- 09:00 Load test: three concurrent visitors, full loop each. Fix what breaks.
- 10:00 Every failure state exercised by hand: bad prompt, sealed goal, aborted run, rate
  limit hit, spend cap hit, dropped socket mid-run.
- 11:00 Empty states, loading states, mobile fallback message, share-link test from a clean
  browser profile.
- **14:00 code freeze. Fixes only.**
- 14:00–16:00 Demo video, Product Hunt copy, screenshots.
- 16:00 Launch.

---

## 18. Demo script (90 seconds)

1. Open the URL. A single prompt field.
2. "I want to test an AMR in a compact fulfilment warehouse with narrow aisles."
3. Agent asks one question: normal operating conditions, or deliberately constrained?
4. Warehouse appears. Assumptions listed in chat, including the chosen aisle width.
5. "Make aisle B narrower and add three pallets near Receiving." Scene updates.
6. Select RB-THERON. The footprint ring appears.
7. Click start in Receiving, click goal at Packing.
8. Planned path draws, hugging the inflation boundary.
9. Run. The robot drives it in physics.
10. Result: SUCCESS, 28.4 s, 21.7 m, 0 collisions, minimum clearance 0.31 m.
11. "Make it harder." Obstacle density rises.
12. Rerun. Either a tighter clearance number or an explained failure. **Both endings are
    good demos**, which is the point of §6.3.

No BREAK-lite ending. Do not demo what did not ship.

---

## 19. Post-launch order

Strictly after v0.1 is stable in production:

1. Wheeled differential dynamics behind the existing base interface.
2. Screenshot-referenced editing.
3. BREAK-lite: budgeted adversarial search over `TestSpec`, using the §6.2 taxonomy as its
   objective function and the faster-than-real-time runner as its engine.
4. Dynamic obstacles, then multi-robot.
5. Simulator adapters (Gazebo/ROS 2, Isaac Sim) behind the compiler interface.
6. Additional domains: manipulators, drones, quadrupeds, AUVs.
7. FIX: diagnosis and automated remediation.

The ordering is deliberate. BREAK is worth far more than a second robot domain, because it is
the part of the product nobody else is selling, and the architecture in §3 plus the
faster-than-real-time runner in §10 are exactly what it needs.

---

## 20. Engineering rules

Work layer by layer; do not start the next before the current gate passes.

Prefer the smallest implementation that survives a stranger using it.

Do not generalise for post-launch domains this week, even where it looks cheap.

Do not replace structured state with prompt-only state.

Do not fabricate a physical specification. Label estimates as estimates.

Do not hide a failure behind a spinner. Every failure has a name, a status and a UI state.

Deploy every day.

When forced to choose between visual polish and reliable behaviour, between generality and
robustness, or between more features and a complete end-to-end loop, choose **reliable
behaviour, robustness, and completion**.

v0.1 succeeds when a stranger goes from natural-language intent → generated environment →
selected robot → planned mission → executed simulation → interpretable result, in a browser,
on a public URL, without help.
