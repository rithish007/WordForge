# WorldForge

A browser-based warehouse builder and AMR simulation MVP for the
[Product Hunt GPT-6 Astra Challenge](https://www.producthunt.com/contests/gpt-6-astra-challenge),
targeting 18 September 2026. The GitHub repository is named WordForge.

**Submission page:** [worldforge-nine.vercel.app](https://worldforge-nine.vercel.app/)

The static page is live. The local simulator now runs two warehouse robots with
validated editing, safe route planning and measured MuJoCo results. The recording
and public simulator backend are pending. See [local demo instructions](docs/LOCAL_DEMO.md)
and [deployment details](docs/HOSTING.md).

## Run the local demo

From this checkout in PowerShell, run `./scripts/start-demo.ps1`, then open
http://127.0.0.1:3000. Dependencies are installed on this computer. For a fresh
checkout, follow [LOCAL_DEMO.md](docs/LOCAL_DEMO.md).

Choose **The cross-dock**, click **Plan route**, then **Run simulation**. Add the
cross-aisle barrier to demonstrate an explained planning failure; undo restores
the world. Importable scenario files and the JSON schema are in `examples/`.
No application API key is needed for this explicit fixture/import mode.

The user changed the submission target to a video on 15 September.
[VIDEO_DEMO.md](docs/VIDEO_DEMO.md) overrides the original plan's immediate
hosting requirements. [Robot sources](docs/ROBOT_SOURCES.md) lists candidates.

The build contract is [Plan.md](Plan.md). Start with the coding instructions in
[AGENTS.md](AGENTS.md), current state in [PROJECT.md](PROJECT.md), and
[Astra build kickoff](docs/ASTRA_BUILD.md).

## Start Astra

From this repository in PowerShell:

```powershell
./scripts/start-astra.ps1 -Check
./scripts/start-astra.ps1
```

The launcher opens an interactive Codex session using `gpt-6-astra`, high
reasoning, this checkout, and the complete build kickoff. It uses the existing
Codex installation and authentication; it does not launch on `-Check`.

For the Codex app, select **GPT-6 Astra / High** and send:

> Read AGENTS.md, Plan.md, PROJECT.md, and docs/ASTRA_BUILD.md. Execute the build
> kickoff, starting at the first unfinished gate, and update PROJECT.md with
> implementation and verification evidence.

Project defaults are stored in [.codex/config.toml](.codex/config.toml). Codex
loads them for trusted projects; an existing app task may retain an explicit
model selection. See [Codex configuration](https://learn.chatgpt.com/docs/config-file/config-basic).

The local foundation, planning and physics slice is implemented and tested.
Live in-app AI, a public simulator backend, recording and submission remain;
see [PROJECT.md](PROJECT.md) for verification evidence and current scope.
