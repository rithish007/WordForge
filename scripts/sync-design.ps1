$ErrorActionPreference = 'Stop'
$repoPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Copy-Item -LiteralPath (Join-Path $repoPath 'site/design.css') -Destination (Join-Path $repoPath 'web/app/design.css')
Copy-Item -LiteralPath (Join-Path $repoPath 'site/interaction.js') -Destination (Join-Path $repoPath 'web/public/interaction.js')
Write-Output 'Shared design tokens and notch navigation synced.'
