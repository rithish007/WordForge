[CmdletBinding()]
param([switch]$Check,[switch]$Build)
$ErrorActionPreference = 'Stop'
$repoPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pythonPath = Join-Path $repoPath '.venv\Scripts\python.exe'
$webPath = Join-Path $repoPath 'web'
if (!(Test-Path -LiteralPath $pythonPath)) { throw 'Install backend dependencies first; see docs/LOCAL_DEMO.md.' }
if (!(Test-Path -LiteralPath (Join-Path $webPath 'node_modules\next'))) { throw 'Run npm ci in web first.' }
$npmPath = (Get-Command npm.cmd -ErrorAction Stop).Source
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
if ($Check) {
    Write-Output "Ready: $repoPath"
    Write-Output "Python: $pythonPath"
    Write-Output "Node: $nodePath"
    Write-Output 'Frontend: http://127.0.0.1:3000 | Backend: http://127.0.0.1:8000'
    exit 0
}
if ($Build -or !(Test-Path -LiteralPath (Join-Path $webPath '.next\BUILD_ID'))) {
    Push-Location $webPath
    try { & $npmPath run build; if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' } }
    finally { Pop-Location }
}
$startedProcesses = @()
$logPath = Join-Path $repoPath 'artifacts\logs'
New-Item -ItemType Directory -Path $logPath -Force | Out-Null
function Is-Ready([string]$Url) {
    try { $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing; return $response.StatusCode -eq 200 }
    catch { return $false }
}
try {
    if (!(Is-Ready 'http://127.0.0.1:8000/api/health')) {
        $startedProcesses += Start-Process -FilePath $pythonPath -ArgumentList @('-m','uvicorn','astra.main:app','--host','127.0.0.1','--port','8000') -WorkingDirectory (Join-Path $repoPath 'server') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logPath 'backend.log') -RedirectStandardError (Join-Path $logPath 'backend-error.log')
    }
    if (!(Is-Ready 'http://127.0.0.1:3000')) {
        $nextPath = Join-Path $webPath 'node_modules\next\dist\bin\next'
        $startedProcesses += Start-Process -FilePath $nodePath -ArgumentList @('"' + $nextPath + '"','start','--hostname','127.0.0.1','--port','3000') -WorkingDirectory $webPath -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logPath 'frontend.log') -RedirectStandardError (Join-Path $logPath 'frontend-error.log')
    }
    $deadline = (Get-Date).AddSeconds(30)
    while (!(Is-Ready 'http://127.0.0.1:8000/api/health') -or !(Is-Ready 'http://127.0.0.1:3000')) {
        if ((Get-Date) -gt $deadline) { throw "Servers did not start. Check $logPath" }
        Start-Sleep -Milliseconds 300
    }
    Write-Output 'WorldForge is ready: http://127.0.0.1:3000'
    Write-Output 'Keep this terminal open. Press Ctrl+C to stop servers started by this launcher.'
    while ($true) { Start-Sleep -Seconds 1 }
}
finally {
    foreach ($demoProcess in $startedProcesses) {
        if (!$demoProcess.HasExited) { Stop-Process -Id $demoProcess.Id -ErrorAction SilentlyContinue }
    }
}
