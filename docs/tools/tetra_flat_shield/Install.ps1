param(
    [string]$MinecraftRoot = '',
    [string]$BuildRoot = ''
)
$ErrorActionPreference = 'Stop'
if (-not $MinecraftRoot) { $MinecraftRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..')) }
if (-not $BuildRoot) { $BuildRoot = Join-Path $MinecraftRoot 'docs\archive\tetra-flat-shield-2026-11-06' }

$owner = 'se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem$1'
$releaseDiff = Join-Path $BuildRoot "release/hotai/$owner.badiff"
if (-not (Test-Path -LiteralPath $releaseDiff -PathType Leaf)) {
    throw "Missing release diff: $releaseDiff (run Build-And-Verify.ps1 first)"
}

# 1) HotAI patch: only the .badiff may live in hotai/, otherwise HotAI would recompute it on next launch.
$hotaiDiff = Join-Path $MinecraftRoot "hotai/$owner.badiff"
New-Item -ItemType Directory -Path (Split-Path -LiteralPath $hotaiDiff) -Force | Out-Null
Copy-Item -LiteralPath $releaseDiff -Destination $hotaiDiff -Force
Write-Host "HotAI patch installed : $hotaiDiff"
$staleClass = Join-Path $MinecraftRoot "hotai/$owner.class"
if (Test-Path -LiteralPath $staleClass) {
    Remove-Item -LiteralPath $staleClass -Force
    Write-Host "Removed stale class   : $staleClass"
}

# 2) Flat item model goes into kubejs/assets, i.e. the "KubeJS Resource Pack [assets]" pack.
#    That pack is loaded after mod_resources, so it overrides tetra:item/modular_shield without
#    a standalone resource pack and without touching options.txt.
$assetsSource = Join-Path $PSScriptRoot 'kubejs\assets'
$assetsTarget = Join-Path $MinecraftRoot 'kubejs\assets'
Get-ChildItem -LiteralPath $assetsSource -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($assetsSource.Length).TrimStart('\')
    $destination = Join-Path $assetsTarget $relative
    New-Item -ItemType Directory -Path (Split-Path -LiteralPath $destination) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
    Write-Host "kubejs/assets/$relative"
}

# 3) Remove the standalone resource pack if an earlier run of this tool installed one.
$oldPack = Join-Path $MinecraftRoot 'resourcepacks\SDBF-FlatTetraShield'
if (Test-Path -LiteralPath $oldPack) {
    Remove-Item -LiteralPath $oldPack -Recurse -Force
    Write-Host "Removed old resource pack: $oldPack"
}
$oldEntry = 'file/SDBF-FlatTetraShield'
$optionsPath = Join-Path $MinecraftRoot 'options.txt'
if (Test-Path -LiteralPath $optionsPath -PathType Leaf) {
    $lines = [IO.File]::ReadAllLines($optionsPath)
    $index = -1
    for ($i = 0; $i -lt $lines.Length; $i++) { if ($lines[$i] -like 'resourcePacks:*') { $index = $i; break } }
    if ($index -ge 0) {
        # PowerShell 5.1's ConvertFrom-Json returns an array as one object, so enumerate explicitly.
        $parsed = ConvertFrom-Json -InputObject $lines[$index].Substring('resourcePacks:'.Length)
        $packList = @()
        foreach ($p in $parsed) { $packList += [string]$p }
        if ($packList -contains $oldEntry) {
            $packList = @($packList | Where-Object { $_ -ne $oldEntry })
            $quoted = $packList | ForEach-Object { '"' + ($_ -replace '\\', '\\' -replace '"', '\"') + '"' }
            $lines[$index] = 'resourcePacks:[' + ($quoted -join ',') + ']'
            [IO.File]::WriteAllLines($optionsPath, $lines, [Text.UTF8Encoding]::new($false))
            Write-Host "Removed from options.txt: $oldEntry"
        } else {
            Write-Host "options.txt already clean (no $oldEntry)"
        }
    }
}

Write-Host ''
Write-Host 'Rollback:'
Write-Host "  1. delete $hotaiDiff"
Write-Host "  2. delete $assetsTarget\tetra\models\item\modular_shield*.json and $assetsTarget\tetra\textures\item\modular_shield_flat.png"
