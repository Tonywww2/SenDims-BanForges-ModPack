param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher\libraries'),
    [string]$BuildRoot = ''
)
$ErrorActionPreference = 'Stop'
if (-not $BuildRoot) { $BuildRoot = Join-Path $MinecraftRoot 'docs\archive\backpack-double-click-2026-10-26' }
$dependencies = @('asm','asm-tree','asm-analysis','asm-commons') | ForEach-Object {
    Join-Path $PrismLibraries "org\ow2\asm\$_\9.9.1\$_-9.9.1.jar"
}
$dependencies += @(
    (Join-Path $PrismLibraries 'cpw\mods\modlauncher\10.0.9\modlauncher-10.0.9.jar'),
    (Join-Path $PrismLibraries 'org\slf4j\slf4j-api\2.0.1\slf4j-api-2.0.1.jar'),
    (Join-Path $MinecraftRoot 'mods\hotai-1.0.jar')
)
foreach ($dependency in $dependencies) {
    if (-not (Test-Path -LiteralPath $dependency -PathType Leaf)) { throw "Missing dependency: $dependency" }
}
$classes = Join-Path $BuildRoot 'builder'
New-Item -ItemType Directory -Path $classes -Force | Out-Null
$classpath = $dependencies -join ';'
& (Join-Path $JavaBin 'javac.exe') -encoding UTF-8 -cp $classpath -d $classes (Join-Path $PSScriptRoot 'PatchBackpackDoubleClick.java') (Join-Path $PSScriptRoot 'TestBackpackDoubleClick.java')
if ($LASTEXITCODE -ne 0) { throw "Compilation failed: $LASTEXITCODE" }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp ($classpath + ';' + $classes) PatchBackpackDoubleClick $MinecraftRoot $BuildRoot
if ($LASTEXITCODE -ne 0) { throw "Patch/verification failed: $LASTEXITCODE" }
