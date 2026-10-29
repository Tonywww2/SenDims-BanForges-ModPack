param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path,
    [string]$JavaBin = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin',
    [string]$PrismLibraries = (Join-Path $env:APPDATA 'PrismLauncher\libraries')
)
$ErrorActionPreference = 'Stop'
$build = Join-Path $MinecraftRoot 'docs\archive\server-fixes-2026-10-28'
$dependencies = @('asm','asm-tree','asm-analysis','asm-commons') | ForEach-Object {
    Join-Path $PrismLibraries "org\ow2\asm\$_\9.9.1\$_-9.9.1.jar"
}
$dependencies += @(
    (Join-Path $PrismLibraries 'cpw\mods\modlauncher\10.0.9\modlauncher-10.0.9.jar'),
    (Join-Path $PrismLibraries 'org\slf4j\slf4j-api\2.0.1\slf4j-api-2.0.1.jar'),
    (Join-Path $PrismLibraries 'com\mojang\logging\1.1.1\logging-1.1.1.jar'),
    (Join-Path $PrismLibraries 'com\google\code\gson\gson\2.10.1\gson-2.10.1.jar'),
    (Join-Path $PrismLibraries 'org\spongepowered\mixin\0.8.5\mixin-0.8.5.jar'),
    (Join-Path $env:USERPROFILE '.gradle\caches\forge_gradle\minecraft_user_repo\net\minecraftforge\forge\1.20.1-47.4.10_mapped_official_1.20.1\forge-1.20.1-47.4.10_mapped_official_1.20.1.jar'),
    (Join-Path $PrismLibraries 'net\minecraftforge\fmlloader\1.20.1-47.4.20\fmlloader-1.20.1-47.4.20.jar'),
    (Join-Path $PrismLibraries 'net\minecraftforge\mergetool\1.1.5\mergetool-1.1.5-api.jar'),
    (Join-Path $PrismLibraries 'com\google\guava\guava\31.1-jre\guava-31.1-jre.jar'),
    (Join-Path $PrismLibraries 'com\google\guava\failureaccess\1.0.1\failureaccess-1.0.1.jar'),
    (Join-Path $MinecraftRoot 'mods\hotai-1.0.jar')
)
foreach ($dependency in $dependencies) {
    if (-not (Test-Path -LiteralPath $dependency -PathType Leaf)) { throw "Missing dependency: $dependency" }
}
$classes = Join-Path $build 'builder'
New-Item -ItemType Directory -Path $classes -Force | Out-Null
$classpath = $dependencies -join ';'
$forgeSource = 'C:\Users\Tony\Documents\EX\ForgeDev\SlashBlade-SenDims\src\main\java\com\tonywww\slashblade_sendims'
& (Join-Path $JavaBin 'javac.exe') --release 17 -proc:none -encoding UTF-8 -cp $classpath -d $classes (Join-Path $PSScriptRoot 'PatchServerFixes.java') (Join-Path $PSScriptRoot 'TestServerFixes.java') (Join-Path $forgeSource 'compat\InteractionStackBounds.java') (Join-Path $forgeSource 'mixin\startup\ServerInteractionStackBoundsMixin.java')
if ($LASTEXITCODE -ne 0) { throw "Compilation failed: $LASTEXITCODE" }
& (Join-Path $JavaBin 'java.exe') -Xverify:all -cp ($classpath + ';' + $classes) PatchServerFixes $MinecraftRoot $build
if ($LASTEXITCODE -ne 0) { throw "Verification failed: $LASTEXITCODE" }
