@echo off
call "%~dp0settings.bat"
echo 正在列出将被处理的区域文件（只读，不改动服务端）……
"%WINSCP%" /script="%~dp0preview.txt" /log="%~dp0preview.log" /parameter // "%SITE%" "%WORLD%" > "%~dp0preview-result.txt"
if errorlevel 1 echo 连接或列目录出错，详见 preview.log。
echo.
echo region、entities、poi 三个文件夹合计将处理的文件数：
findstr /r /c:"r\.-*[0-9][0-9]*\.-*[0-9][0-9]*\.mca" "%~dp0preview-result.txt" | find /c /v ""
echo 完整列表见 preview-result.txt（已用记事本打开）。
start "" notepad "%~dp0preview-result.txt"
pause
