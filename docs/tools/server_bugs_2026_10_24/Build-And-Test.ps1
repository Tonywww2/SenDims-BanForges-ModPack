param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher\libraries'),
    [string]$BuildRoot = ''
)
$ErrorActionPreference = 'Stop'
if (-not $BuildRoot) { $BuildRoot = Join-Path $MinecraftRoot 'docs\archive\server-bugs-2026-10-24' }
$patchDependencies = @('asm','asm-tree','asm-analysis','asm-commons') | ForEach-Object {
    Join-Path $PrismLibraries "org\ow2\asm\$_\9.9.1\$_-9.9.1.jar"
}
$patchDependencies += @(
    (Join-Path $PrismLibraries 'com\google\guava\guava\31.1-jre\guava-31.1-jre.jar'),
    (Join-Path $PrismLibraries 'com\google\guava\failureaccess\1.0.1\failureaccess-1.0.1.jar'),
    (Join-Path $PrismLibraries 'cpw\mods\modlauncher\10.0.9\modlauncher-10.0.9.jar'),
    (Join-Path $PrismLibraries 'org\slf4j\slf4j-api\2.0.1\slf4j-api-2.0.1.jar'),
    (Join-Path $MinecraftRoot 'mods\riichi_mahjong_forge-0.2.0.jar'),
    (Join-Path $MinecraftRoot 'mods\hotai-1.0.jar')
)
foreach ($patchDependency in $patchDependencies) {
    if (-not (Test-Path -LiteralPath $patchDependency -PathType Leaf)) { throw "Missing dependency: $patchDependency" }
}
$patchClasses = Join-Path $BuildRoot 'builder'
$patchOutput = Join-Path $BuildRoot 'release\hotai'
$patchScratch = Join-Path $BuildRoot 'hotai-roundtrip'
New-Item -ItemType Directory -Path $patchClasses -Force | Out-Null
$patchCp = $patchDependencies -join ';'
& (Join-Path $JavaBin 'javac.exe') -encoding UTF-8 -cp $patchCp -d $patchClasses `
    (Join-Path $PSScriptRoot 'PatchServerBugs.java') (Join-Path $PSScriptRoot 'TestServerBugs.java')
if ($LASTEXITCODE -ne 0) { throw "Compilation failed: $LASTEXITCODE" }
$patchCp += ';' + $patchClasses
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $patchCp PatchServerBugs $MinecraftRoot $patchOutput
if ($LASTEXITCODE -ne 0) { throw "Patch generation failed: $LASTEXITCODE" }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $patchCp TestServerBugs $MinecraftRoot $patchOutput $patchScratch
if ($LASTEXITCODE -ne 0) { throw "Regression tests failed: $LASTEXITCODE" }
Write-Output "Validated patches: $patchOutput"
