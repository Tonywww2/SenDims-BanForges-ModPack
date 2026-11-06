param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
)
$ErrorActionPreference = 'Stop'
$out = Join-Path $MinecraftRoot 'docs/archive/skyblockbuilder-client-lightning-2026-11-02'
$classes = Join-Path $out 'builder'
New-Item -ItemType Directory -Force -Path $classes | Out-Null
$libraries = Join-Path $env:APPDATA 'PrismLauncher/libraries'
$dependencies = @('asm','asm-tree','asm-analysis','asm-commons') | ForEach-Object { Join-Path $libraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar" }
$dependencies += @((Join-Path $libraries 'cpw/mods/modlauncher/10.0.9/modlauncher-10.0.9.jar'),(Join-Path $libraries 'org/slf4j/slf4j-api/2.0.1/slf4j-api-2.0.1.jar'),(Join-Path $MinecraftRoot 'mods/hotai-1.0.jar'))
$classpath = ($dependencies + $classes) -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $classpath -d $classes (Join-Path $PSScriptRoot 'PatchSkyblockLightning.java') (Join-Path $PSScriptRoot 'TestSkyblockLightning.java')
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $classpath PatchSkyblockLightning $MinecraftRoot $out
if ($LASTEXITCODE -ne 0) { throw 'Patch verification failed' }
