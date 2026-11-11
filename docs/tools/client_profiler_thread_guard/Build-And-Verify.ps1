param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
)
$ErrorActionPreference = 'Stop'
$taskOutput = Join-Path $MinecraftRoot 'docs/archive/client-profiler-crash-2026-11-06'
$taskBuilder = Join-Path $taskOutput 'builder'
New-Item -ItemType Directory -Force -Path $taskBuilder | Out-Null
$taskLibraries = Join-Path $env:APPDATA 'PrismLauncher/libraries'
$taskMinecraftJar = Join-Path $taskLibraries 'net/minecraft/client/1.20.1-20230612.114412/client-1.20.1-20230612.114412-srg.jar'
$taskDependencies = @('asm', 'asm-tree', 'asm-commons', 'asm-analysis') | ForEach-Object {
    Join-Path $taskLibraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar"
}
$taskDependencies += @(
    'org/slf4j/slf4j-api/2.0.1/slf4j-api-2.0.1.jar',
    'com/mojang/logging/1.1.1/logging-1.1.1.jar',
    'com/google/guava/guava/31.1-jre/guava-31.1-jre.jar',
    'it/unimi/dsi/fastutil/8.5.9/fastutil-8.5.9.jar',
    'org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.jar',
    'cpw/mods/modlauncher/10.0.9/modlauncher-10.0.9.jar'
) | ForEach-Object { Join-Path $taskLibraries $_ }
$taskDependencies += Join-Path $MinecraftRoot 'mods/hotai-1.0.jar'
$taskClasspath = ($taskDependencies + $taskBuilder) -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $taskClasspath -d $taskBuilder (Join-Path $PSScriptRoot 'ProfilerGuardTemplate.java') (Join-Path $PSScriptRoot 'PatchProfiler.java') (Join-Path $PSScriptRoot 'VerifyProfiler.java')
if ($LASTEXITCODE -ne 0) { throw 'Profiler patch compilation failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $taskClasspath PatchProfiler $taskMinecraftJar $taskBuilder $taskOutput
if ($LASTEXITCODE -ne 0) { throw 'Profiler patch build failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $taskClasspath VerifyProfiler $taskMinecraftJar $taskOutput
if ($LASTEXITCODE -ne 0) { throw 'Profiler patch verification failed' }
