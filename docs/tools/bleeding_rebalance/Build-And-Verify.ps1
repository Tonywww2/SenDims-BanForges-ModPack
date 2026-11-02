param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$SourceProject = 'C:\Users\Tony\Documents\EX\ForgeDev\SlashBlade-SenDims',
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
)
$ErrorActionPreference = 'Stop'
$build = Join-Path $MinecraftRoot 'docs/archive/bleeding-rebalance-2026-10-30'
$named = Join-Path $build 'named'
$builder = Join-Path $build 'builder'
New-Item -ItemType Directory -Force -Path $named,$builder | Out-Null
$libraries = Join-Path $env:APPDATA 'PrismLauncher/libraries'
$mappedForge = Join-Path $env:USERPROFILE '.gradle/caches/forge_gradle/minecraft_user_repo/net/minecraftforge/forge/1.20.1-47.4.10_mapped_official_1.20.1/forge-1.20.1-47.4.10_mapped_official_1.20.1.jar'
$mapping = Join-Path $SourceProject 'build/createMcpToSrg/output.tsrg'
$modJar = Join-Path $MinecraftRoot 'mods/slashblade_sendims-1.1.1.jar'
$deps = @($mappedForge,
    (Join-Path $MinecraftRoot 'mods/lethal_slash_project-1.1.0.jar'),
    (Join-Path $MinecraftRoot 'mods/SlashBladeResharped-1.20.1-1.9.65.jar'))
$deps += @(Get-ChildItem -LiteralPath $libraries -Recurse -Filter '*.jar' -File | ForEach-Object FullName)
foreach ($path in @($mapping,$modJar) + $deps) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing input: $path" }
}
$source = @(Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'forge-source') -Filter '*.java' -Recurse -File | ForEach-Object FullName)
$arguments = @('--release','17','-proc:none','-encoding','UTF-8','-cp',($deps -join ';'),'-d',$named) + $source
$argfile = Join-Path $build 'javac.args'
[IO.File]::WriteAllLines($argfile, @($arguments | ForEach-Object { '"' + $_.Replace('\','/') + '"' }), [Text.UTF8Encoding]::new($false))
& (Join-Path $JavaBin 'javac.exe') "@$argfile"
if ($LASTEXITCODE -ne 0) { throw 'Mixin compilation failed' }

$toolDeps = @('asm','asm-tree','asm-analysis','asm-commons') | ForEach-Object { Join-Path $libraries "org/ow2/asm/$_/9.9.1/$_-9.9.1.jar" }
$toolDeps += Join-Path $libraries 'com/google/code/gson/gson/2.10.1/gson-2.10.1.jar'
$toolClasspath = $toolDeps -join ';'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $toolClasspath -d $builder (Join-Path $PSScriptRoot 'BuildBleeding.java') (Join-Path $PSScriptRoot 'TestBleeding.java')
if ($LASTEXITCODE -ne 0) { throw 'Builder compilation failed' }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp ($toolClasspath + ';' + $builder) BuildBleeding $named $mappedForge $mapping $modJar (Join-Path $build 'slashblade_sendims-1.1.1.jar')
if ($LASTEXITCODE -ne 0) { throw 'Build or verification failed' }
