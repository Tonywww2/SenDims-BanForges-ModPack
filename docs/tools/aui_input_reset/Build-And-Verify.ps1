param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
)
$ErrorActionPreference = 'Stop'
$out = Join-Path $MinecraftRoot 'docs/archive/aui-text-input-2026-11-02'
$classes = Join-Path $out 'classes'
New-Item -ItemType Directory -Force -Path $classes | Out-Null
$libraries = Join-Path $env:APPDATA 'PrismLauncher/libraries'
$dependencies = @('asm','asm-tree','asm-commons') | ForEach-Object { Join-Path $libraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar" }
$dependencies += Join-Path $MinecraftRoot 'mods/ApricityUI-forge-1.20.1-1.2.7.jar'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp ($dependencies -join ';') -d $classes (Join-Path $PSScriptRoot 'TestAuiInputReset.java')
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp (($dependencies + $classes) -join ';') TestAuiInputReset $MinecraftRoot $out
if ($LASTEXITCODE -ne 0) { throw 'Native AUI bytecode verification failed' }
