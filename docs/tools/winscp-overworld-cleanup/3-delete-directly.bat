@echo off
call "%~dp0settings.bat"
echo 将直接删除保留范围以外的区域文件（region、entities、poi），无法撤销。
echo 请先关闭服务端。
set "ANSWER="
set /p "ANSWER=确认直接删除请输入 YES："
if /i not "%ANSWER%"=="YES" (echo 已取消。& pause & goto :eof)
"%WINSCP%" /script="%~dp0delete.txt" /log="%~dp0delete.log" /parameter // "%SITE%" "%WORLD%"
if errorlevel 1 (echo 出错，详见 delete.log。) else (echo 完成。)
pause
