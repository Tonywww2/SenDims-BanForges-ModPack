param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher/libraries')
)
$ErrorActionPreference = 'Stop'
$output = Join-Path $MinecraftRoot 'docs/archive/ftb-sidebar-config-2026-11-17'
$builder = Join-Path $output 'builder'
New-Item -ItemType Directory -Force -Path $builder | Out-Null
$ftbJar = Join-Path $MinecraftRoot 'mods/ftb-library-forge-2001.2.13.jar'
$asm = @('asm', 'asm-tree', 'asm-commons', 'asm-analysis', 'asm-util') | ForEach-Object {
    Join-Path $PrismLibraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar"
}
$game = @(
    $ftbJar,
    (Join-Path $MinecraftRoot 'mods/architectury-9.2.14-forge.jar'),
    (Join-Path $PrismLibraries 'net/minecraft/client/1.20.1-20230612.114412/client-1.20.1-20230612.114412-srg.jar'),
    (Join-Path $PrismLibraries 'com/google/code/gson/gson/2.10.1/gson-2.10.1.jar'),
    (Join-Path $PrismLibraries 'org/apache/logging/log4j/log4j-api/2.19.0/log4j-api-2.19.0.jar'),
    (Join-Path $PrismLibraries 'net/minecraftforge/eventbus/6.0.5/eventbus-6.0.5.jar')
)
foreach ($dependency in ($asm + $game)) {
    if (-not (Test-Path -LiteralPath $dependency -PathType Leaf)) { throw "Missing dependency: $dependency" }
}
$gameClasspath = $game -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -XDstringConcat=inline -encoding UTF-8 -cp (($asm + $game) -join ';') -d $builder (Join-Path $PSScriptRoot 'SidebarSaveTemplate.java') (Join-Path $PSScriptRoot 'PatchSidebarButtons.java')
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp (($asm + $builder) -join ';') PatchSidebarButtons $ftbJar $builder $output $gameClasspath
if ($LASTEXITCODE -ne 0) { throw 'Patch build failed' }
