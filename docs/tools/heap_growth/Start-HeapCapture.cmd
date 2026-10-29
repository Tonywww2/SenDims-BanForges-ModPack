@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Capture-HeapGrowth.ps1" %*
if errorlevel 1 echo Capture failed. Read the message above before retrying.
pause
