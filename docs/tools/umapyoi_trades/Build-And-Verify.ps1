param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher/libraries')
)
$ErrorActionPreference = 'Stop'
$output = Join-Path $MinecraftRoot 'docs/archive/umapyoi-trades-2026-11-17'
$classes = Join-Path $output 'hotai'
$builder = Join-Path $output 'builder'
$umapyoi = Join-Path $MinecraftRoot 'mods/umapyoi-1.12.73-1.20.1.jar'
$expectedJar = 'bb85ab88709e592f371aa00bbe296e50fb1b6ffd9345c6f3c219c0de22319756'
$asm = @('asm', 'asm-tree', 'asm-analysis', 'asm-util') | ForEach-Object {
    Join-Path $PrismLibraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar"
}
$game = @(
    $umapyoi,
    (Join-Path $PrismLibraries 'net/minecraft/client/1.20.1-20230612.114412/client-1.20.1-20230612.114412-srg.jar'),
    (Join-Path $PrismLibraries 'net/minecraftforge/forge/1.20.1-47.4.10/forge-1.20.1-47.4.10-universal.jar'),
    (Join-Path $PrismLibraries 'net/minecraftforge/eventbus/6.0.5/eventbus-6.0.5.jar'),
    (Join-Path $PrismLibraries 'net/minecraftforge/javafmllanguage/1.20.1-47.4.10/javafmllanguage-1.20.1-47.4.10.jar'),
    (Join-Path $PrismLibraries 'net/minecraftforge/fmlcore/1.20.1-47.4.10/fmlcore-1.20.1-47.4.10.jar'),
    (Join-Path $PrismLibraries 'it/unimi/dsi/fastutil/8.5.9/fastutil-8.5.9.jar'),
    (Join-Path $PrismLibraries 'com/mojang/datafixerupper/6.0.8/datafixerupper-6.0.8.jar'),
    (Join-Path $PrismLibraries 'com/google/code/gson/gson/2.10.1/gson-2.10.1.jar')
)
foreach ($dependency in ($asm + $game)) {
    if (-not (Test-Path -LiteralPath $dependency -PathType Leaf)) { throw "Missing dependency: $dependency" }
}
if ((Get-FileHash -LiteralPath $umapyoi -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedJar) {
    throw 'Unexpected umapyoi jar; re-check the decompiled sources before rebuilding.'
}
if (Test-Path -LiteralPath $classes) { Remove-Item -LiteralPath $classes -Recurse -Force }
New-Item -ItemType Directory -Force -Path $classes, $builder | Out-Null
$sources = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'src') -Recurse -Filter *.java | ForEach-Object { $_.FullName }
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp ($game -join ';') -d $classes @sources
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed' }
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp ($asm -join ';') -d $builder (Join-Path $PSScriptRoot 'VerifyClasses.java')
if ($LASTEXITCODE -ne 0) { throw 'Verifier compilation failed' }
& (Join-Path $JavaBin 'java.exe') -cp (($asm + $builder) -join ';') VerifyClasses $classes ($game -join ';')
if ($LASTEXITCODE -ne 0) { throw 'Bytecode verification failed' }
