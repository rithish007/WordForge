[CmdletBinding()]
param(
    [switch]$Check
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$promptPath = Join-Path $repositoryRoot 'docs\ASTRA_BUILD.md'
$codexCommand = Get-Command codex -CommandType Application -ErrorAction Stop

foreach ($requiredFile in @('Plan.md', 'AGENTS.md', 'PROJECT.md', 'docs\ASTRA_BUILD.md', '.codex\config.toml')) {
    if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot $requiredFile) -PathType Leaf)) {
        throw "Missing build setup file: $requiredFile"
    }
}

if ($Check) {
    [pscustomobject]@{
        Model = 'gpt-6-astra'
        Reasoning = 'high'
        Repository = $repositoryRoot
        Prompt = $promptPath
        Codex = $codexCommand.Source
        BuildStarted = $false
    }
    return
}

$buildPrompt = Get-Content -LiteralPath $promptPath -Raw -Encoding UTF8
& $codexCommand.Source --cd $repositoryRoot --model gpt-6-astra --config 'model_reasoning_effort="high"' $buildPrompt
if ($LASTEXITCODE -ne 0) {
    throw "Codex exited with status $LASTEXITCODE."
}
