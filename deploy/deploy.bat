@echo off
REM ============================================================================
REM Gayatri Electrical Services (GES) - One-Click Windows Release Launcher
REM Location: deploy\deploy.bat
REM Automatically bypasses PowerShell ExecutionPolicy for local script invocation
REM ============================================================================
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%deploy.ps1" %*
set EXIT_CODE=%ERRORLEVEL%
if "%~1"=="" (
    echo.
    pause
)
exit /b %EXIT_CODE%
