# Run the local WorldForge demo

The local prototype uses Next.js/R3F and a FastAPI server with isolated, headless
MuJoCo workers. No OpenAI API key is needed for fixture/import mode. The Vercel
submission page remains separate; it does not serve this backend.

## Start on this computer

From C:\dev\WordForge in PowerShell:

```powershell
./scripts/start-demo.ps1 -Check
./scripts/start-demo.ps1
```

Open http://127.0.0.1:3000 for the prompt-first entry and choose a sample world,
or go directly to http://127.0.0.1:3000/lab. Live AI generation remains disabled.
Keep the launcher terminal open. Ctrl+C stops only
processes that this invocation started. Use `-Build` after editing frontend code.
Logs are in `artifacts/logs/`. Ports 3000 and 8000 bind only to loopback.

For a fresh checkout, install Node 22+ and Python 3.12, then:

```powershell
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r server/requirements.txt
Push-Location web
npm ci
Pop-Location
./scripts/start-demo.ps1 -Build
```

On this computer the bundled Python runtime was used to create .venv; no global
Python installation or environment settings were changed.

## Rehearse the current recording

1. Choose **The cross-dock** and **Robotnik RB-THERON**. Receiving A and Packing B
   are set by default. Drag to orbit and scroll to zoom.
2. Click **Plan route**. Enable **Clearance map** to show the robot-inflated grid.
3. Click **Run simulation**. Computation runs faster than real time in an isolated
   process; the browser then replays the actual recorded frames at 1x.
4. Observe SUCCESS, 28.32 simulated seconds, 21.95 m travelled, zero obstacle
   contacts and approximately 0.15 m minimum conservative clearance.
5. Pause/replay or scrub the timeline. Export the run to retain snapshots,
   measured telemetry, MJCF, engine versions and deterministic hash.
6. Click **Block the cross-aisle**, then **Plan route**. This gives PLAN FAILED.
   It is a planning failure, not a collision. **Undo** restores the previous world.
7. Load **Angled depot** or switch to **Boxer**. Click objects to edit position,
   footprint, height or yaw. Invalid geometry preserves the previous scene.
8. Import an actual Astra-authored WorldSpec from `examples/`. Save locally and
   load saved to retain a world in this browser. Export JSON to move it elsewhere.

Click Start or Goal and then click an empty floor point to change the mission.
Selecting a scenario restores that scenario's mission zones. World edits and
robot changes clear stale paths/results.

## Verified capabilities and limitations

- Three fixtures, both source-dimensioned robots, WorldSpec validation, edit/undo,
  browser save/load, JSON import/export, conservative occupancy, safe A*,
  pure-pursuit control, measured MuJoCo motion, results and replay.
- The planar body has X/Y/Z-yaw velocity servos; no torque-driven wheel dynamics.
  Angular limit is an explicitly labelled 1 rad/s simulation estimate.
- Collision bodies are primitives; original procedural shelves, pallets, tables
  and robot details provide recognizable visuals. No third-party robot meshes
  have been bundled. Manufacturer dimensions and links are in the robot selector.
- Physics/control/telemetry rates are 500/50/20 Hz. A run has a 120 simulated
  second cap and 25 wall-clock second worker timeout, with one worker at a time.
- Run artifacts are stored under `artifacts/runs/<run_id>/`; they are gitignored.
  Local browser saves contain world geometry; mission and robot snapshots are
  included in exported run files.
- Live in-app AI, public backend, accounts and a finished video are pending.
  Fixtures/import must not be presented as live AI responses.

## Validation

```powershell
Push-Location server
../.venv/Scripts/python.exe -m pytest
Pop-Location
Push-Location web
npm run build
Pop-Location
```

The checked pytest configuration disables optional cache writes and the warnings
summary in this managed Windows workspace. The default session teardown stalled;
the configured command exits successfully in seconds without skipping tests.
