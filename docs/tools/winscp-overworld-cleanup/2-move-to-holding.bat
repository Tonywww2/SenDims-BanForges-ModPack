@echo off
call "%~dp0settings.bat"
echo 将把保留范围以外的区域文件移到服务端的 %HOLD% 文件夹（region、entities、poi 三个子文件夹）。
echo 请先关闭服务端。
set "ANSWER="
set /p "ANSWER=输入 YES 继续："
if /i not "%ANSWER%"=="YES" (echo 已取消。& pause & goto :eof)
"%WINSCP%" /script="%~dp0move.txt" /log="%~dp0move.log" /parameter // "%SITE%" "%WORLD%" "%HOLD%"
if errorlevel 1 (echo 出错，详见 move.log。) else (echo 完成。开服确认没问题后，在 WinSCP 里删除 %HOLD% 文件夹即可。)
pause
