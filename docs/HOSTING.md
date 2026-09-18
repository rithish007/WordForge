# WorldForge submission page

The user authorized Vercel hosting on 15 September 2026 because the challenge
requires a web link. The static page is in `site/`; the simulator remains a
separate local-prototype milestone. It currently states that development and
the demo recording are pending. No OpenAI API key is used by this page.

## Source and deployment

Latest presentation polish, 17 September: icon-only expanding horizontal notch,
magnetic pointer, larger typography, wide video area, cleaned illustration and
profile link deployed as https://worldforge-gyhtt356q-rithishrs007projects.vercel.app
and verified at the existing production alias. `site/interaction.js` is a new
static runtime asset. Recording remains pending.

Latest update, 17 September: redesigned landing page with centred typography,
notch menu, shared app theme and explicit local-access dialog deployed successfully
as https://worldforge-88zyy2d1d-rithishrs007projects.vercel.app and aliased to
https://worldforge-nine.vercel.app/. Production browser verification passed,
including the access dialog and mobile layout. Command from `site/`:
`npx.cmd --offline --yes vercel@59.18.0 deploy --prod --yes --scope rithishrs007projects`.
The existing cached CLI was used after the online npx registry lookup stalled.
No recording or hosted simulator was added. Submission next steps are in
`docs/SUBMIT_NOW.md`.

- GitHub: https://github.com/rithish007/WordForge
- Site commit: `83c8146`, pushed to `main`.
- Vercel account/team: `rithishrs007projects` (Hobby).
- Project name: `worldforge`.
- Initial deployment method: Vercel Drop, uploading only the seven files under
  `site/`. The existing GitHub app does not currently have access to this repo.
- Git auto-deploy is **not connected**. A Git push alone does not update the site.
- Production URL: https://worldforge-nine.vercel.app/
- Dashboard: https://vercel.com/rithishrs007projects/worldforge
- Initial deployment: https://worldforge-9bwobsae7-rithishrs007projects.vercel.app
- Result: Vercel reported successful deployment; production page verified on
  15 September 2026 in the browser and with anonymous HTTPS requests.

The upload does not include Plan.md, agent configuration, local data or secrets.
The local simulator and theme source are checkpointed on `codex/local-demo`.

## Theme update deployed 16 September

- Existing project linked through Vercel CLI 59.18.0 from `site/`.
- Command: `npx.cmd --yes vercel@59.18.0 deploy --prod --yes --scope rithishrs007projects`.
- Deployment: https://worldforge-qb7nt4pq4-rithishrs007projects.vercel.app
- Vercel returned READY and the existing production alias remains
  https://worldforge-nine.vercel.app/.
- Anonymous checks returned HTTP 200 for HTML, theme.css and warehouse.svg;
  theme declarations are present. The system theme update is now public.
- Local `.vercel/` and `.env*` are ignored; `.vercelignore` explicitly excludes
  CLI environment files. Never include their contents in an upload or commit.
- Git auto-deployment remains disconnected. Repeat the CLI deploy from `site/`
  for later authorized static page updates.

## Add the actual video

Latest UI revision (16 September): Light / Dark / Auto selector, neutral dark
palette and current local-prototype status deployed as
https://worldforge-otjwm5e1z-rithishrs007projects.vercel.app and aliased to the same
production URL. Browser verified the selector persists across reloads. The static
page still contains no live simulator or recording.

1. Place the recording at `site/demo.mp4`, or host it at an HTTPS MP4/WebM URL.
2. Set `videoUrl` in `site/demo-config.js` to `/demo.mp4` or that HTTPS URL.
3. Update the page's recording status and description to match demonstrated
   behaviour. Keep the local-prototype label and identify the actual AI and
   simulation modes. Add captions with a `<track>` when the video has narration.
4. Preview locally and confirm playback. The current player keeps the honest
   placeholder if configuration is empty, and shows an explanation if video fails.
5. Redeploy to this same Vercel project. To enable Git deployment, add only this
   repo to the existing Vercel GitHub installation, connect it in project settings,
   set Root Directory to `site`, Framework Preset to Other, no build command, and
   static output at the root. Verify the project/domain before publishing.

Do not create another Vercel project for every update. Do not upload API keys or
turn the Codex login into a public application endpoint.

## Local preview

Serve `site/` as the document root, for example:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory site
```

If system Python is unavailable, use the bundled interpreter in PROJECT.md.
Open http://127.0.0.1:4173 in the browser.

## Verification

- Both JavaScript files pass `node --check`.
- Deployment JSON parses and both SVG assets parse as XML.
- Desktop browser inspection: hero, illustration, links and demo status render.
- Demo anchor navigation works. No external fonts, runtime API calls, trackers,
  package install or application build are required.
- Actual video playback cannot be verified until a recording is supplied.
- Production HTML and all five referenced assets return HTTP 200 without cookies
  or authentication. The expected title and development status match the source.

## Recording and Analytics update, 18 September

Published the supplied Blob recording at the existing production URL. The player
uses its intrinsic aspect ratio. Vercel Web Analytics is enabled and the static
script returned HTTP 200; the dashboard received the verification page view.
Public browser playback advanced beyond 20 seconds without console errors.
Deployment: https://worldforge-e0mbr6jyj-rithishrs007projects.vercel.app
Portfolio: https://rithish.vercel.app/
The root SampleRec.mp4 is not deployed or committed; demo-config.js holds the
public Blob URL. This supersedes earlier recording-pending verification notes.
