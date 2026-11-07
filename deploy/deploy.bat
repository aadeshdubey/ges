@echo off
(
    setlocal
    set "SCRIPT_DIR=%~dp0"
    cd /d "%~dp0.."
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
    if "%~1"=="" (
        echo.
        pause
    )
    exit /b %ERRORLEVEL%
)
