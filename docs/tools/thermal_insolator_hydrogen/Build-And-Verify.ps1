param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
)
$ErrorActionPreference = 'Stop'
$build = Join-Path $MinecraftRoot 'docs/archive/thermal-insolator-hydrogen-2026-11-02'
$classes = Join-Path $build 'builder'
New-Item -ItemType Directory -Force -Path $classes | Out-Null
$libraries = Join-Path $env:APPDATA 'PrismLauncher/libraries'
$core = Join-Path $build 'thermal_core.jar'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$foundation = [IO.Compression.ZipFile]::OpenRead((Join-Path $MinecraftRoot 'mods/thermal_foundation-1.20.1-11.0.6.70.jar'))
try {
    $entry = $foundation.Entries | Where-Object { $_.Name -eq 'thermal_core-1.20.1-11.0.6.24.jar' } | Select-Object -First 1
    if (-not $entry) { throw 'Bundled Thermal Core version changed' }
    [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$core,$true)
} finally { $foundation.Dispose() }
$mapped = Join-Path $env:USERPROFILE '.gradle/caches/forge_gradle/minecraft_user_repo/net/minecraftforge/forge/1.20.1-47.4.10_mapped_official_1.20.1/forge-1.20.1-47.4.10_mapped_official_1.20.1.jar'
$dependencies = @($mapped,$core,(Join-Path $MinecraftRoot 'mods/cofh_core-1.20.1-11.0.2.56.jar'),(Join-Path $MinecraftRoot 'mods/hotai-1.0.jar'))
$dependencies += @(Get-ChildItem -LiteralPath $libraries -Recurse -File -Filter '*.jar' | ForEach-Object FullName)
$argsFile = Join-Path $build 'javac.args'
$arguments = @('--release','17','-proc:none','-encoding','UTF-8','-cp',($dependencies -join ';'),'-d',$classes)
$arguments += @(Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.java' -File | ForEach-Object FullName)
[IO.File]::WriteAllLines($argsFile,@($arguments | ForEach-Object { '"' + $_.Replace('\','/') + '"' }),[Text.UTF8Encoding]::new($false))
& (Join-Path $JavaBin 'javac.exe') "@$argsFile"
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed' }
$runtime = @('asm','asm-tree','asm-analysis','asm-commons') | ForEach-Object { Join-Path $libraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar" }
$runtime += @((Join-Path $libraries 'cpw/mods/modlauncher/10.0.9/modlauncher-10.0.9.jar'),(Join-Path $libraries 'org/slf4j/slf4j-api/2.0.1/slf4j-api-2.0.1.jar'),(Join-Path $MinecraftRoot 'mods/hotai-1.0.jar'),$classes)
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp ($runtime -join ';') PatchInsolator $MinecraftRoot $build
if ($LASTEXITCODE -ne 0) { throw 'Patch verification failed' }
