param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
)
$ErrorActionPreference = 'Stop'
$taskOutput = Join-Path $MinecraftRoot 'docs/archive/wither-edge-log-2026-11-06'
$taskBuilder = Join-Path $taskOutput 'builder'
New-Item -ItemType Directory -Force -Path $taskBuilder | Out-Null
$taskLibraries = Join-Path $env:APPDATA 'PrismLauncher/libraries'
$taskDependencies = @('asm', 'asm-tree', 'asm-analysis') | ForEach-Object {
    Join-Path $taskLibraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar"
}
$taskDependencies += @(
    (Join-Path $taskLibraries 'org/slf4j/slf4j-api/2.0.1/slf4j-api-2.0.1.jar'),
    (Join-Path $taskLibraries 'cpw/mods/modlauncher/10.0.9/modlauncher-10.0.9.jar'),
    (Join-Path $MinecraftRoot 'mods/hotai-1.0.jar')
)
$taskClasspath = ($taskDependencies + $taskBuilder) -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $taskClasspath -d $taskBuilder (Join-Path $PSScriptRoot 'PatchWitherEdgeLog.java')
if ($LASTEXITCODE -ne 0) { throw 'Wither Edge patch compilation failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $taskClasspath PatchWitherEdgeLog $MinecraftRoot $taskOutput
if ($LASTEXITCODE -ne 0) { throw 'Wither Edge patch verification failed' }
