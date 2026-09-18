# WorldForge market discovery

Prepared 17 September 2026. This is an interview guide and a record of proposed
product direction, not evidence of market demand or a new implementation contract.
Do discovery before expanding the product. Preserve the existing recorded-demo
track and distinguish working features from concepts in every interview.

## Product direction supplied by the founder

- Two audiences to investigate separately: creators building attractive 3D
  environments, and robotics engineers importing their own robot to evaluate it.
- Hosted browser editor with a central viewport, objects/assets on the left,
  inspector on the right, and collapsible chat/results below. Panels resize and
  remember their sizes. Full docking/floating windows are not yet decided.
- AI builds environments from assets the user provides. Users can add more assets
  later and edit both manually and through chat. Assets remain user-selected;
  the precise browser upload/folder workflow and storage policy need design.
- Simplified, inspectable collision shapes initially.
- AI priorities: generate environments and propose better layouts after failures.
- Begin with warehouses and ground mobile robots. Shipyards and outdoor ground
  environments such as farms/forests are possible later markets. Aerial and
  underwater domains are excluded for now; expansion depends on evidence.
- The founder wants users to fund their own AI access initially, then potentially
  sell AI credits and offer model/effort controls and connectors after validation.
  A ChatGPT-account login funding arbitrary API calls is NOT a verified capability.
  API-key funding versus another supported integration still needs a decision.
- No new spending, account integration, asset importer, custom-robot support,
  editor redesign or public simulator deployment was performed for this guide.

## Technical facts to keep separate from the pitch

The current prototype has prepared warehouse worlds, two supported mobile robots,
numeric edits, categories, planning and planar MuJoCo simulation. General live AI,
model import, custom robot/controller import and BREAK are not implemented.
The manual barrier demonstration is not automated adversarial testing.

Ordinary simulation runs need no language-model call. A hosted simulator still
has compute/storage costs even when a visitor funds their own AI requests.

OpenAI distinguishes ChatGPT subscription authentication in its supported products
from Platform API-key usage billed at API rates. Its documentation says to use
Platform API keys for general API calls. Do not advertise subscription-funded
WorldForge login without verifying a supported integration for this exact use.
Source: [OpenAI authentication](https://learn.chatgpt.com/docs/auth).

For eventual visual import, GLB/glTF is a sensible first candidate: Three.js
recommends it for runtime asset delivery. A visual mesh alone does not specify
robot dynamics or control. Engineering discovery must establish which robot
description, controller and simulator interfaces users actually need before
promising custom-robot behaviour evaluation.
Sources: [Three.js model-loading guidance](https://threejs.org/manual/en/loading-3d-models.html),
[ROS URDF model structure](https://docs.ros.org/kinetic/api/urdf/html/index.html).

## How to run the research

Start with 5-8 conversations in each audience as a practical first batch, not a
statistically representative sample. Recruit people who recently built or tried
to build a scene or robot test environment, including people satisfied with their
current tools. Friends who only like the idea are not enough.

Use 20-30 minutes per conversation. Ask about their most recent real project
before describing WorldForge. Ask permission before recording. Do not request
confidential files; a description or sanitized example is enough. Collect only
the details needed for research, and ask separately about follow-up contact.

Opening: "I'm researching how people build 3D environments and robot test scenes.
I'd like to understand a recent project and the tools you used. There is no need
to like my idea; learning what already works is equally useful."

## Core interview: ask everyone before showing the idea

1. Tell me about the last 3D environment or robot-testing project you worked on.
   When was it, what was it for, and who needed the output?
2. Walk me through how you went from the initial idea or assets to the result.
   Which tools and file formats did you use at each step?
3. Which part, if any, was difficult enough that you changed your approach,
   asked for help or abandoned something? Tell me about one specific incident.
4. Roughly how much time did that part take? What happened because of the delay
   or limitation? Separate setup time from repeated work and compute time.
5. How many similar projects or revisions have you done in the last three months?
6. What have you already tried to improve that step? What worked, and what did
   you spend on tools, assets, services or other people's time?
7. What does your current workflow do well enough that you would not replace it?
8. What output did you actually deliver or use to make a decision? What made it
   acceptable, and what would have made it unusable?

If there is no recent example, record that. Continue as exploratory feedback,
but do not count speculative enthusiasm as evidence of an existing paid problem.

## Creator branch: choose the relevant probes

9. Where did the models come from? Which import, scale, material or licensing
   problems did you actually encounter?
10. How did you decide where objects went and revise the scene? What needed
    exact control, and what could have been approximate?
11. What did you need at the end: a still image, video, editable scene, game-engine
    export, interactive web scene or something else? Which destination mattered?
12. In that project, did simulated behaviour matter? If so, what did it change?
    If a scene looked right but had no robot simulation, would it still meet the
    original requirement? Why?

## Robotics branch: choose the relevant probes

9. What robot, simulator, navigation/controller stack and robot-description
   files did you use on your last test? What parts did you bring yourself?
10. What did the environment need to represent for the test to be meaningful?
    Probe geometry, collision shapes, sensors, dynamics and terrain only after
    their initial answer. What approximations were acceptable?
11. What exactly were you evaluating: physical clearance, a supplied navigation
    algorithm, your own controller, perception, throughput or something else?
    How did you decide pass/fail?
12. Describe the last failure you found. How did you discover its cause, reproduce
    it and decide what to change? Could you change the layout, or was it fixed?
13. How do you currently choose difficult test cases? What makes a test realistic
    and useful rather than an impossible or irrelevant scenario?
14. What would a new tool need to connect to or export for its results to enter
    your workflow? What evidence would you need before relying on those results?

## Show the concept only after discussing their workflow

Read this as a proposal, not a feature claim:

"WorldForge is exploring a browser editor where you provide 3D assets and describe
an environment. AI arranges an editable scene, and you can revise it using normal
3D controls or chat. A proposed robotics workflow would bring in a supported robot
setup, test missions, explain failures and suggest layout changes. Another possible
feature would search for difficult scenarios automatically. The present prototype
only implements a smaller warehouse/mobile-robot simulation workflow."

For creators, show the scene-building concept first. For engineers, show the
mission/evidence workflow first. Do not suggest that the current demo supports
their custom controller or models.

## Concept, access and buying questions

15. Where, if anywhere, would this fit in the project you described? Which
    existing step would it replace, and which parts would you ignore?
16. What would stop you from trying it? What would you need to inspect or undo
    before accepting an AI-generated arrangement or change?
17. Which matters most for that project: generating the first scene, arranging
    your assets, making revisions, evaluating robot behaviour, finding difficult
    cases, or suggesting fixes? Which matters least? Explain the tradeoff.
18. Could your models and project data be processed by a hosted service and an
    external AI provider? What permissions or restrictions apply? Is a browser
    tool acceptable, or would those restrictions rule it out?
19. How do you currently pay for AI tools? Do you have separately billed API
    access? Would creating API access or providing a key stop you from trying a
    hosted editor? What would make that acceptable or unacceptable?
20. What did the current workflow cost on the last project? Who could approve
    a replacement or pilot, from which budget, and what would they need to see?
21. If it demonstrated the improvement you described, what price and billing
    arrangement could you justify? What would make it too expensive? First ask
    openly, then probe subscription, usage credits or project-based pricing.
22. Is there a real upcoming project suitable for a small pilot? What would we
    test, by when, and what measurable result would make you keep using it?

End by asking whether they want to schedule a follow-up or share a non-sensitive
example. An actual appointment and agreed task are stronger evidence than a
general statement that they would try it. A paid pilot should only be offered
with an honest, concrete scope that can be delivered.

## Short questionnaire to send before interviews

Use these eight questions if someone only has five minutes. Do not lead with an
AI pitch. Include "none/not applicable" so respondents are not forced into demand.

1. What is your role, and when did you last build or modify a 3D scene or robot
   simulation? What was it used for?
2. Which tools and model/robot file formats did you use?
3. What was the hardest step, if any? Describe the last time it happened.
4. How much time did it take, and how often do you do this kind of work?
5. What have you tried or paid for to make that step easier? What still falls short?
6. What output or evidence do you need from the completed scene/test?
7. What would prevent you using a hosted browser tool with your own assets?
8. Would you take part in a 20-minute discussion about that recent project?
   If yes, optionally provide a contact method.

After the interview or after this short form, show the concept and ask the
concept/buying questions. Keep concept reactions separate from earlier answers.

## Evidence sheet and decision rule

For each interview, record:

| Field | Notes |
| --- | --- |
| Anonymous participant ID and segment | Creator or robotics; specific role |
| Recent project and date | Real task versus hypothetical interest |
| Current tools / formats / interfaces | Actual workflow and output destination |
| Concrete difficulty | Quote in their own words, with permission |
| Frequency, time and consequence | Record estimates as estimates |
| Existing workaround and spend | What they already do to address it |
| Trust / cloud / credential barriers | What could prevent adoption |
| Most valuable proposed capability | Include explicit rejection or low interest |
| Buyer and budget path | User and purchaser may differ |
| Pilot task, success metric and date | Commitment made versus suggested |
| Follow-up permission | Yes/no; separate from research notes |

Compare the two audiences separately. Look for several independent people naming
the same recurring problem, describing a costly workaround and agreeing to test
the same small solution with a real project. For an initial decision heuristic,
seek at least three concrete pilot commitments in one coherent segment before
building its larger workflow. This is a working threshold, not proof of demand.

If feedback is mostly "cool idea," with no recent problem, deadline, switching
reason or pilot commitment, keep investigating or narrow the concept. If creators
want scene exports but no simulation, and engineers require controllers/sensors
beyond our scope, do not merge those answers into a claim that one MVP satisfies
both. Choose an initial audience based on repeatable evidence and delivery cost.

Record negative responses and recruitment source. Avoid pricing conclusions from
small convenience samples. Validate stated willingness to pay with a specific
pilot offer later; no users have been interviewed or market demand established
by producing this document.
