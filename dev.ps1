param(
  [string]$ProjectId = "gestortorneo",
  [string]$Only = "auth,functions,firestore,hosting,storage,database",
  [switch]$WithFrontend,
  [switch]$Watch
)

$rootPath = $PSScriptRoot
$frontendPath = Join-Path $rootPath "frontend"
$functionsPath = Join-Path $rootPath "functions"
$frontendProcess = $null
$functionsProcess = $null

Write-Host "Starting dev environment..." -ForegroundColor Cyan
Write-Host "Firebase project: $ProjectId" -ForegroundColor Gray
Write-Host "Emulators: $Only" -ForegroundColor Gray

try {
  if ($Watch) {
    Write-Host "Starting functions watch..." -ForegroundColor Yellow
    $functionsProcess = Start-Process -FilePath "powershell" `
      -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$functionsPath'; npm run build:watch"
      ) `
      -WorkingDirectory $functionsPath `
      -PassThru
  }

  if ($WithFrontend) {
    Write-Host "Starting frontend dev server..." -ForegroundColor Green
    $frontendProcess = Start-Process -FilePath "powershell" `
      -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$frontendPath'; npm run dev"
      ) `
      -WorkingDirectory $frontendPath `
      -PassThru
  }

  firebase emulators:start --project $ProjectId --only $Only
}
finally {
  Write-Host "Cleaning up child processes..." -ForegroundColor DarkGray

  if ($frontendProcess -and -not $frontendProcess.HasExited) {
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
  }

  if ($functionsProcess -and -not $functionsProcess.HasExited) {
    Stop-Process -Id $functionsProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
