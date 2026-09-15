# Robot description candidates

Checked 15 September 2026. Assets have not yet been downloaded, converted or
validated in WorldForge.

## First candidate: Boxer

- [Repository](https://github.com/boxer-cpr/boxer), branch `noetic-devel`.
- [Description package](https://github.com/boxer-cpr/boxer/tree/noetic-devel/boxer_description)
  contains URDF and STL files, including `meshes/` and `urdf/` directories.
- GitHub identifies the repository as BSD-3-Clause. Preserve its license and
  copyright notices and check asset-specific notices before copying files.
- [Clearpath documentation](https://docs.clearpathrobotics.com/docs_robots/legacy/ros1_robots/indoor_robots/boxer/tutorials_boxer/)
  links its description and simulation packages.

This is **Boxer 2.4**, based on an OTTO 100 base. The README distinguishes it
from older Boxer robots. Match its physical specifications and visuals to this
exact variant; do not pair an older datasheet with the newer mesh.

Recommended first candidate because the description contents and repository
license are visible. It is a geometry source, not a drop-in MuJoCo model.

## Second candidate: RB-THERON

- [Robotnik common repository](https://github.com/RobotnikAutomation/rb_theron_common),
  branch `noetic-devel`, includes `rb_theron_description`.
- [Simulation repository](https://github.com/RobotnikAutomation/rb_theron_sim)
  and its [manifest](https://raw.githubusercontent.com/RobotnikAutomation/rb_theron_sim/noetic-devel/repos/rb_theron_sim.repos)
  identify the matching common repository.
- [Manufacturer datasheet candidate](https://robotnik.eu/wp-content/uploads/2024/09/Robotnik_Datasheet_RB-THERON_EN_2024.pdf).

The description's exact files/license could not be fetched in this research
pass; verify before vendoring meshes. Public availability alone does not establish
reuse rights. Verify the datasheet and mesh revision match. The ROS/Gazebo stack
is not required to run WorldForge's planned FastAPI/MuJoCo prototype.

## Integration procedure

1. Choose a robot variant; record source commit, units, dimensions and license.
2. Source footprint, height, mass and speed. Label unsourced estimates explicitly.
3. Build a primitive collision body first. Use the same footprint for planning and
   MJCF, with the planned circular inflation envelope.
4. Only after the run works, copy the needed visuals and license notices. Resolve
   URDF/Xacro link transforms; convert the assembled visual to GLB if helpful.
5. Check scale, orientation and origin. Render the visual under the robot pose;
   retain documented primitive collision physics and verify variant alignment.
6. Stop visual integration after two hours if unreliable; retain the deliberate
   primitive appearance. Do not install full ROS/Gazebo solely to obtain a mesh.

## Dimensions used in the implemented local prototype

Verified 15 September 2026 against manufacturer sources:

| Variant | Footprint m | Height m | Mass kg | Max linear speed m/s |
| --- | --- | --- | --- | --- |
| RB-THERON 2024 base, no lifting unit | 0.717 × 0.550 | 0.320 | 70 | 1.25 |
| Boxer 2.4 / OTTO 100 V2.4 | 0.740 × 0.550 | 0.320 | 114 | 2.0 |

Sources: [Robotnik datasheet, page 2](https://robotnik.eu/wp-content/uploads/2024/09/Robotnik_Datasheet_RB-THERON_EN_2024.pdf)
and [Clearpath system specifications](https://docs.clearpathrobotics.com/docs_robots/legacy/ros1_robots/indoor_robots/boxer/user_manual_boxer/#system-specifications).
The Clearpath manual applies to 2.4 and 2.5 except where noted. The Robotnik lifting
unit changes its height to 0.418 m; the older 2021 base has different dimensions
and mass and is not used here.

Both angular limits are **simulation estimates: 1 rad/s**, not manufacturer
claims. Half-diagonal collision radii are 0.45182657 m and 0.46100434 m; a 0.05 m
safety margin is added before ceil-based grid inflation. Boxer supplies the
larger default envelope. Per-field provenance is included in exported robot specs.
The current visuals and collision bodies are primitives; no third-party meshes
or code have been copied into the application.
