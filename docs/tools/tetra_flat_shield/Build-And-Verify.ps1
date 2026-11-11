param(
    [string]$MinecraftRoot = '',
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher\libraries'),
    [string]$BuildRoot = ''
)
$ErrorActionPreference = 'Stop'
if (-not $MinecraftRoot) { $MinecraftRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..')) }
if (-not $BuildRoot) { $BuildRoot = Join-Path $MinecraftRoot 'docs\archive\tetra-flat-shield-2026-11-06' }
$tetra = Join-Path $MinecraftRoot 'mods\tetra-1.20.1-6.9.0.jar'
$hotai = Join-Path $MinecraftRoot 'mods\hotai-1.0.jar'
$asm = @('asm', 'asm-tree', 'asm-analysis', 'asm-commons') | ForEach-Object { Join-Path $PrismLibraries "org\ow2\asm\$_\9.9.1\$_-9.9.1.jar" }
$tools = $asm + @(
    (Join-Path $PrismLibraries 'cpw\mods\modlauncher\10.0.9\modlauncher-10.0.9.jar'),
    (Join-Path $PrismLibraries 'org\slf4j\slf4j-api\2.0.1\slf4j-api-2.0.1.jar'),
    $hotai, $tetra
)
foreach ($dependency in $tools) {
    if (-not (Test-Path -LiteralPath $dependency -PathType Leaf)) { throw "Missing dependency: $dependency" }
}
$builder = Join-Path $BuildRoot 'builder'
New-Item -ItemType Directory -Path $builder -Force | Out-Null
$classpath = ($tools + $builder) -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $classpath -d $builder `
    (Join-Path $PSScriptRoot 'PatchTetraFlatShield.java')
if ($LASTEXITCODE -ne 0) { throw "Patch tool compilation failed: $LASTEXITCODE" }
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$output = & (Join-Path $JavaBin 'java.exe') -Xverify:all -cp $classpath PatchTetraFlatShield $tetra $BuildRoot 2>&1
$exitCode = $LASTEXITCODE
$ErrorActionPreference = $previousPreference
$output | ForEach-Object { Write-Host $_ }
if ($exitCode -ne 0) { throw "Verification failed: $exitCode" }
