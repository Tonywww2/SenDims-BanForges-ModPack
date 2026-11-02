param(
    [string]$MinecraftRoot = '',
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher\libraries'),
    [string]$BuildRoot = ''
)
$ErrorActionPreference = 'Stop'
if (-not $MinecraftRoot) { $MinecraftRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..')) }
if (-not $BuildRoot) { $BuildRoot = Join-Path $MinecraftRoot 'docs\archive\chloride-jei-overlay-2026-10-30' }
$chloride = Join-Path $MinecraftRoot 'mods\chloride-FORGE-mc1.20.1-v1.8.1.jar'
$jei = Join-Path $MinecraftRoot 'mods\jei-1.20.1-forge-15.74.0.228.jar'
$mixin = Join-Path $PrismLibraries 'org\spongepowered\mixin\0.8.5\mixin-0.8.5.jar'
$tools = @('asm', 'asm-tree', 'asm-analysis', 'asm-commons') | ForEach-Object { Join-Path $PrismLibraries "org\ow2\asm\$_\9.9.1\$_-9.9.1.jar" }
$tools += @(
    (Join-Path $PrismLibraries 'cpw\mods\modlauncher\10.0.9\modlauncher-10.0.9.jar'),
    (Join-Path $PrismLibraries 'org\slf4j\slf4j-api\2.0.1\slf4j-api-2.0.1.jar'),
    (Join-Path $MinecraftRoot 'mods\hotai-1.0.jar'), $chloride, $jei, $mixin
)
foreach ($dependency in $tools) {
    if (-not (Test-Path -LiteralPath $dependency -PathType Leaf)) { throw "Missing dependency: $dependency" }
}
$patched = Join-Path $BuildRoot 'patched'
$builder = Join-Path $BuildRoot 'builder'
New-Item -ItemType Directory -Path $patched, $builder -Force | Out-Null
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp (@($chloride, $jei, $mixin) -join ';') -d $patched `
    (Join-Path $PSScriptRoot 'patch-src\me\srrapero720\chloride\mixins\impl\jei_rei_emi\JeiOverlayMixin.java')
if ($LASTEXITCODE -ne 0) { throw "Patch compilation failed: $LASTEXITCODE" }
$classpath = ($tools + $builder) -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $classpath -d $builder (Join-Path $PSScriptRoot 'PatchChlorideJeiOverlay.java')
if ($LASTEXITCODE -ne 0) { throw "Verifier compilation failed: $LASTEXITCODE" }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $classpath PatchChlorideJeiOverlay $chloride $jei `
    (Join-Path $patched 'me\srrapero720\chloride\mixins\impl\jei_rei_emi\JeiOverlayMixin.class') $BuildRoot
if ($LASTEXITCODE -ne 0) { throw "Verification failed: $LASTEXITCODE" }
