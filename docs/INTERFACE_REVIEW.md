# Interface review — 16 September 2026

## Implemented from user feedback

- Light, Dark and Auto theme selection on the public page, app home and lab.
  Auto follows system changes. Dark uses charcoal/slate surfaces. Selection is
  saved in the browser; public and localhost origins keep separate preferences.
- The public cube logo and wordmark now appear on both app routes, with the
  matching favicon. The app home has a slim rounded prompt with its button inside.
- Sample labels are Rack 1–4, Pallet 1, Packing station 1 and Charger 1.
  Stable internal IDs are unchanged. Existing imported labels are preserved.
  Names can be edited. The object list offers no grouping or collapsible categories.
- Undo is an accessible icon button. Import/export buttons identify world files.
- Scene legend distinguishes the planned centre route from recorded trajectory.
  The user clarified that the body/ring, not the centre, overlapped the shading.
  The shading includes the radius, safety margin and grid rounding; visual overlap
  of the body/ring is not a contact event. No controller changes were retained.

## Import/export explained

| Control | Contents and purpose |
| --- | --- |
| Export world | A WorldForge WorldSpec JSON: floor dimensions, objects, IDs/names, positions, sizes, rotations, zones and assumptions. Saves or transfers a layout. Does not include the selected mission, robot, replay or mesh geometry. |
| Import world | Validates a WorldSpec JSON under 1 MB and replaces the current layout. Failed validation preserves the previous layout; undo restores a successful replacement. |
| Export run JSON | An experiment record: world/mission/robot snapshots, planned route, recorded poses, metrics, contacts, physics model, versions and deterministic hash. Useful for debugging and reproducibility; the world importer does not accept it as a scene. |
| Save locally / Load saved | One layout stored in this browser on this origin. Not a cloud backup or shared project link. |

The current app does not import arbitrary 3D meshes. GLB/glTF, OBJ, STL, FBX and
URDF are unsupported. Visuals are generated from eight registered object types.
A later asset importer would need units/scale, placement, collision geometry,
licensing and validation. A mesh by itself is not a simulation-ready robot.

## Copy and symbol audit

Editorial judgements below distinguish stale facts from optional copy improvements.

| Page | Text/symbol | Finding / disposition |
| --- | --- | --- |
| Public | “when the local prototype is ready” / “From concept to first run” | Stale: local simulator already works. Updated to say recording is pending. |
| Public | “A world to test. Before the real one.” | Brand tagline; reasonable to keep, but not a concrete feature description. |
| Public | “What if testing…” | Vague question. Suggested: “Build a warehouse scene and test a robot mission.” Keep future chat generation separate from current functionality. |
| Public | “Give the robot something worth testing” | Vague heading. Suggested: “Test routes through warehouse layouts.” |
| Public | “Space to explore. A mission to try.” | Decorative filler. Suggested: “Warehouse concept illustration.” |
| Public SVG | “A WAREHOUSE. A ROBOT. A QUESTION.” | Decorative filler; remove when replacing the concept art with real product imagery. |
| Public | “THE DIRECTION”, “More time asking what happens in it” | Generic closing copy; replace with a concrete demo/repository link when ready. |
| Public | “See the first mission” | Premature playback invitation while no video exists. Suggested: “Demo recording coming soon.” |
| Public | “Follow the build on GitHub” | The working simulator branch is still local; public main is older. Suggested: “Project repository” until source publication is agreed. |
| Public | WORLD / 001, 01 / 02 and repeated ↗ | Decorative numbering and repeated arrows add noise. Internal anchor links need no external-link arrow. |
| App home | “A WORKSPACE FOR ROBOTIC WHAT-IFS” | Replaced with “WAREHOUSE ROBOT SIMULATION”. |
| App home | “Describe the space. Shape the conditions…” | Replaced with a direct description of the requested warehouse/mission. |
| App home | “Sample scenarios · no model call” | Implementation language; replaced with “Ready to explore”. The honest AI-offline notice remains. |
| App home | “Build with Astra ↗” | Removed external-link cue; action is now “Build world”, disabled with an explanation until integrated. |
| App home | “Open warehouse lab ↗”, card ↗ | Internal navigation: use a normal chevron or no icon in a later cleanup. |
| Lab | Rack West South and similar | Replaced in samples with simple numbered names; IDs remain stable. |
| Lab | ↗ beside every object | Misleading external-navigation cue; removed. |
| Lab | Underlined Undo / ↥ Import / ↧ Export | Undo now has an icon; file actions now say “Import world” and “Export world”. |
| Lab | “PERSPECTIVE · Z UP” | Unnecessary coordinate-system jargon; replaced with “3D VIEW”. |
| Lab | “Scenario files + explicit edits” | Replaced with “Load a sample or import a saved world.” |
| Lab | “The route is only the beginning” / “Measured in motion” | Replaced with “No run yet” / “Simulation results”. |
| Lab | “Navigable world” | Means zones are connected under the conservative planner, not that every mission will succeed. Could become “Zones connected”. |
| Lab | 01 / WORLD, 02 / ROBOT, 03 / SCENE OBJECTS, METRES, AMR | Numbering and specialist abbreviations can be reduced; keep units at editable values. |
| All | “Local prototype”, AI unavailable, no public simulator/video | Necessary current limitations. Do not remove until the corresponding feature works. |
| Lab | Planar MuJoCo and wheel-dynamics note | Keep: these distinguish the physics model from real hardware dynamics. |

## Remaining product work

1. Discuss the minimum chat-to-world interaction, clarification questions and edit scope.
2. Implement the live agent/tool layer, secure API configuration, spending controls
   and build/edit evaluations. A key alone does not activate generation.
3. Rehearse and record a real demo; replace public placeholder content with evidence.
4. Decide whether to host the interactive simulator/backend now or retain a video-led
   submission page; complete the relevant deployment and public reliability checks.
5. Verify challenge requirements, deadline and submission fields; submit only with
   authorization and actual confirmation. Nothing is submitted yet.

Human/pedestrian behaviour, additional environments and mesh import remain
separate scope decisions. Daily X posts remain drafts, not scheduled or published.

## Clearance investigation limits

The default cross-dock and angled-depot runs with both robots completed without
contacts and with at least the 0.05 m configured physical safety margin. Additional
cross-dock corner tests also passed this metric. The pure-pursuit trajectory is
not identical to the planned polyline: some alternative missions and reverse-yaw
starts touch conservative, rounded grid exclusions while retaining physical
clearance. Do not claim every simulated centre stays in every planner-free cell.
Future tight-layout testing should assess controller tracking separately from
route validity. The UI now exposes the actual trajectory to make that observable.
