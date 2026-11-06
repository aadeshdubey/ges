@echo off
REM ============================================================================
REM Gayatri Electrical Services (GES) — One-Click Windows Deployment Launcher
REM Automatically bypasses PowerShell ExecutionPolicy for local script invocation
REM ============================================================================
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
set EXIT_CODE=%ERRORLEVEL%
if "%~1"=="" (
    echo.
    pause
)
exit /b %EXIT_CODE%
