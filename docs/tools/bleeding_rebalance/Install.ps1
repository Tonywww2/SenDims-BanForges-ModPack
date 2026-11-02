param(
    [string]$MinecraftRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
    [string]$JarPath = (Join-Path $MinecraftRoot 'docs/archive/bleeding-rebalance-2026-10-30/slashblade_sendims-1.1.1.jar')
)
$ErrorActionPreference = 'Stop'
$installed = Join-Path $MinecraftRoot 'mods/slashblade_sendims-1.1.1.jar'
$expected = (Get-Content -LiteralPath ($JarPath + '.sha256') -Raw).Trim()
if ((Get-FileHash -LiteralPath $JarPath -Algorithm SHA256).Hash -ne $expected) { throw 'Built JAR checksum mismatch; rebuild first.' }
if ((Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash -eq $expected) { Write-Output 'Already installed.'; exit 0 }
try {
    $exclusive = [IO.File]::Open($installed, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $exclusive.Dispose()
} catch {
    throw 'SenDims JAR is in use. Fully exit this Minecraft instance/server, then run this script again.'
}
$backup = Join-Path $MinecraftRoot '.sdbf-backups/bleeding-rebalance-2026-10-30/mods/slashblade_sendims-1.1.1.jar'
if (-not (Test-Path -LiteralPath $backup)) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
    Copy-Item -LiteralPath $installed -Destination $backup
}
$pending = $installed + '.pending'
Copy-Item -LiteralPath $JarPath -Destination $pending -Force
if ((Get-FileHash -LiteralPath $pending -Algorithm SHA256).Hash -ne $expected) { throw 'Staged copy checksum mismatch.' }
# Both paths are in mods/, on the same volume; replace atomically after creating a backup.
[IO.File]::Replace($pending, $installed, [NullString]::Value)
if ((Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash -ne $expected) { throw 'Installed JAR checksum mismatch.' }
Write-Output ('Installed: ' + $installed)
Write-Output 'Restart Minecraft/server to load the bleeding changes.'
