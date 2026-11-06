<#
.SYNOPSIS
    Gayatri Electrical Services (GES) - PowerShell Build, Preview, Validation and Branch Deployment Wrapper
    Location: deploy/deploy.ps1

.DESCRIPTION
    Provides a zero-friction CLI and interactive menu for the GES dev -> main release workflow,
    with full execution logging to deploy/logs/:
      - .\deploy\deploy.ps1 -Preview             : Build, run 6-stage validator, start local + Wi-Fi QR server on port 8080, and close port gracefully on exit.
      - .\deploy\deploy.ps1 -Check               : Build and run the 6-stage validator only.
      - .\deploy\deploy.ps1 -Save ["msg"]        : Build, bump CalVer, validate, auto-format commit message, and push to dev branch only.
      - .\deploy\deploy.ps1 -Promote ["msg"]     : Build, bump CalVer, validate, commit on dev, merge dev -> main, deploy to GitHub Pages, and return to dev.
      - .\deploy\deploy.ps1 "Custom message"     : Direct shortcut for -Promote "Custom message".
      - .\deploy\deploy.ps1                      : Launches an interactive 1-key menu when invoked with no parameters.
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$MessageParts,

    [switch]$Preview,
    [switch]$Check,
    [switch]$Save,
    [switch]$Promote,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location -Path $RepoRoot

$CustomMessage = ""
if ($MessageParts) {
    $CustomMessage = ($MessageParts -join " ").Trim()
}

# Show interactive menu if no switches and no commit message were passed
if (-not $Preview -and -not $Check -and -not $Save -and -not $Promote -and -not $DryRun -and [string]::IsNullOrWhiteSpace($CustomMessage)) {
    $Branch = (git rev-parse --abbrev-ref HEAD 2>$null)
    $Version = (node -p "require('./data/version.json').version" 2>$null)

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  Gayatri Electrical Services (GES) - Release Control Center" -ForegroundColor Yellow
    Write-Host "  Active Branch: $Branch  |  Current Build: v$Version" -ForegroundColor Gray
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  [1] Preview Live Site (Laptop + Mobile Wi-Fi QR Code on :8080)" -ForegroundColor Green
    Write-Host "  [2] Run 6-Stage Build and Validation Check Only (-Check)" -ForegroundColor White
    Write-Host "  [3] Save and Backup Changes to 'dev' Branch Only (-Save)" -ForegroundColor Cyan
    Write-Host "  [4] Promote and Deploy 'dev' -> 'main' Live Production (-Promote)" -ForegroundColor Yellow
    Write-Host "  [Q] Quit" -ForegroundColor DarkGray
    Write-Host "================================================================" -ForegroundColor Cyan

    $Choice = Read-Host "Select an action (1/2/3/4/Q)"
    switch ($Choice.Trim().ToUpper()) {
        "1" { $Preview = $true }
        "2" { $Check = $true }
        "3" {
            $Save = $true
            $InputMsg = Read-Host "Optional commit description (press Enter to auto-generate in GES v... format)"
            if (-not [string]::IsNullOrWhiteSpace($InputMsg)) { $CustomMessage = $InputMsg.Trim() }
        }
        "4" {
            $Promote = $true
            $InputMsg = Read-Host "Optional commit description (press Enter to auto-generate in GES v... format)"
            if (-not [string]::IsNullOrWhiteSpace($InputMsg)) { $CustomMessage = $InputMsg.Trim() }
        }
        default {
            Write-Host "Cancelled." -ForegroundColor DarkGray
            exit 0
        }
    }
}

if ($Preview) {
    node "$PSScriptRoot\preview.js"
    exit $LASTEXITCODE
}

if ($Check) {
    node "$PSScriptRoot\deploy.js" --check
    exit $LASTEXITCODE
}

$NodeArgs = @("$PSScriptRoot\deploy.js")
if ($Save) {
    $NodeArgs += "--save"
} else {
    $NodeArgs += "--promote"
}

if ($DryRun) {
    $NodeArgs += "--dry-run"
}

if (-not [string]::IsNullOrWhiteSpace($CustomMessage)) {
    $NodeArgs += $CustomMessage
}

& node @NodeArgs
exit $LASTEXITCODE
