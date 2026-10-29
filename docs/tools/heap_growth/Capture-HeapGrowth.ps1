#requires -Version 5.1
<#
.SYNOPSIS
采集同一次 Minecraft 运行中低、高内存阶段的 Java 堆快照。
.EXAMPLE
.\Capture-HeapGrowth.ps1
.EXAMPLE
.\Capture-HeapGrowth.ps1 -Mode Baseline
.EXAMPLE
.\Capture-HeapGrowth.ps1 -Mode High
.EXAMPLE
.\Capture-HeapGrowth.ps1 -Mode Status
.NOTES
完整快照会暂停游戏并请求一次 Full GC，不需要关闭 DisableExplicitGC。
默认输出到整合包 docs/archive/heap-samples，文件不会被覆盖或自动删除。
HistogramOnly 仅采集经过 GC 的类直方图，不能代替分析持有关系所需的完整堆快照。
#>
[CmdletBinding()]
param(
    [ValidateSet('Interactive', 'Baseline', 'High', 'Status')]
    [string]$Mode = 'Interactive',
    [string]$MinecraftRoot = '',
    [int]$TargetJavaProcessId = 0,
    [string]$JcmdPath = '',
    [string]$OutputRoot = '',
    [switch]$HistogramOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$utf8 = [Text.UTF8Encoding]::new($false)
try { [Console]::OutputEncoding = $utf8 } catch { }

function Write-Utf8File {
    param([string]$Path, [string]$Text)
    [IO.File]::WriteAllText($Path, $Text, $script:utf8)
}

function Get-NormalizedPath {
    param([string]$Value)
    return [IO.Path]::GetFullPath($Value.Replace('/', '\')).TrimEnd('\').ToLowerInvariant()
}

function Get-GameProcess {
    param([int]$RequestedProcessId)
    $filter = "Name = 'java.exe' OR Name = 'javaw.exe'"
    if ($RequestedProcessId -gt 0) { $filter = "ProcessId = $RequestedProcessId" }
    $matchingProcesses = @()
    foreach ($candidate in @(Get-CimInstance Win32_Process -Filter $filter)) {
        if ($candidate.Name -notmatch '^javaw?\.exe$' -or -not $candidate.CommandLine) { continue }
        $gameDir = [regex]::Match($candidate.CommandLine, '(?:^|\s)--gameDir(?:=|\s+)(?:"([^"]+)"|(\S+))')
        if (-not $gameDir.Success) { continue }
        $candidateRoot = $gameDir.Groups[1].Value
        if (-not $candidateRoot) { $candidateRoot = $gameDir.Groups[2].Value }
        if ((Get-NormalizedPath $candidateRoot) -eq (Get-NormalizedPath $script:MinecraftRoot)) {
            $matchingProcesses += $candidate
        }
    }
    if ($matchingProcesses.Count -eq 0) {
        throw '未找到这个整合包正在运行的 Java 进程。请先启动游戏；若使用管理员权限启动游戏，也需以相同权限运行采样脚本。'
    }
    if ($matchingProcesses.Count -gt 1) {
        throw ("找到多个匹配进程（{0}），请使用 -TargetJavaProcessId 指定。" -f (($matchingProcesses | ForEach-Object ProcessId) -join ', '))
    }
    return $matchingProcesses[0]
}

function Find-Jcmd {
    param($GameProcess)
    $candidates = @()
    if ($script:JcmdPath) { $candidates += $script:JcmdPath }
    if ($GameProcess.ExecutablePath) {
        $candidates += Join-Path (Split-Path -Parent $GameProcess.ExecutablePath) 'jcmd.exe'
    }
    $instanceConfig = Join-Path (Split-Path -Parent $script:MinecraftRoot) 'instance.cfg'
    if (Test-Path -LiteralPath $instanceConfig) {
        foreach ($line in Get-Content -LiteralPath $instanceConfig -Encoding UTF8) {
            if ($line -match '^JavaPath=(.+)$') {
                $javaPath = $Matches[1].Trim().Trim('"')
                $candidates += Join-Path (Split-Path -Parent $javaPath) 'jcmd.exe'
            }
        }
    }
    if ($env:JAVA_HOME) { $candidates += Join-Path $env:JAVA_HOME 'bin\jcmd.exe' }
    $onPath = Get-Command jcmd.exe -ErrorAction SilentlyContinue
    if ($onPath) { $candidates += $onPath.Source }
    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { return (Resolve-Path -LiteralPath $candidate).Path }
    }
    throw '未找到 JDK 的 jcmd.exe。请使用 -JcmdPath 指定其完整路径。'
}

function ConvertTo-NativeArgument {
    param([string]$Value)
    if ($Value.Length -gt 0 -and $Value -notmatch '[\s"]') { return $Value }
    $escaped = [regex]::Replace($Value, '(\\*)"', '$1$1\"')
    $escaped = [regex]::Replace($escaped, '(\\+)$', '$1$1')
    return '"' + $escaped + '"'
}

function Assert-SameProcess {
    $process = Get-Process -Id $script:gameProcessId -ErrorAction SilentlyContinue
    if (-not $process -or $process.StartTime.ToUniversalTime().Ticks -ne $script:gameStartTicks) {
        throw '原游戏进程已经退出或重启。请重新运行脚本；不同进程的样本会分开保存。'
    }
}

function Invoke-GameJcmd {
    param([string]$Command, [string]$SavePath = '', [int]$TimeoutSeconds = 120)
    Assert-SameProcess
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $script:resolvedJcmd
    $startInfo.Arguments = (@([string]$script:gameProcessId, $Command) | ForEach-Object { ConvertTo-NativeArgument $_ }) -join ' '
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.StandardOutputEncoding = $script:utf8
    $startInfo.StandardErrorEncoding = $script:utf8
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw '无法启动 jcmd。' }
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $timer = [Diagnostics.Stopwatch]::StartNew()
        $nextNotice = 30
        while (-not $process.WaitForExit(1000)) {
            if ($timer.Elapsed.TotalSeconds -ge $TimeoutSeconds) {
                $process.Kill()
                throw ("jcmd 等待超过 {0} 秒，已停止等待工具；游戏进程未被终止。若快照仍在写入，请等待写入完成后再采集。" -f $TimeoutSeconds)
            }
            if ($timer.Elapsed.TotalSeconds -ge $nextNotice) {
                Write-Host ("仍在等待 Java 完成 {0}（已等待约 {1} 秒）……" -f $Command.Split(' ')[0], [int]$timer.Elapsed.TotalSeconds)
                $nextNotice += 30
            }
        }
        $process.WaitForExit()
        $text = $stdout.GetAwaiter().GetResult() + $stderr.GetAwaiter().GetResult()
        if ($SavePath) { Write-Utf8File $SavePath $text }
        if ($process.ExitCode -ne 0 -or $text -match '(?im)^\s*(?:com\.sun\.tools\.attach\.|java\.[\w.]+Exception|Unknown diagnostic command|java\.io\.IOException|Error:|Syntax error)') {
            throw ("jcmd 执行失败：{0}`n{1}" -f $Command, $text)
        }
        return $text
    } finally { $process.Dispose() }
}

function Get-ProcessMemory {
    Assert-SameProcess
    $process = Get-Process -Id $script:gameProcessId
    return [ordered]@{
        timestamp = [DateTimeOffset]::Now.ToString('o')
        workingSetBytes = $process.WorkingSet64
        privateBytes = $process.PrivateMemorySize64
    }
}

function Save-HeapSample {
    param([ValidateSet('Baseline', 'High')][string]$Stage)
    Assert-SameProcess
    $manifestPath = Join-Path $script:sessionDirectory 'session.json'
    $manifest = $null
    if (Test-Path -LiteralPath $manifestPath) {
        $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($manifest.processId -ne $script:gameProcessId -or $manifest.processStartUtcTicks -ne $script:gameStartTicks) {
            throw '样本目录的进程身份不一致，请更换输出目录。'
        }
    }
    if ($Stage -eq 'High' -and (-not $manifest -or -not $manifest.baselineSample)) {
        throw '这次游戏运行还没有基线样本。请先在低占用阶段采集一次 Baseline。'
    }
    New-Item -ItemType Directory -Path $script:sessionDirectory -Force | Out-Null
    $sampleName = $Stage.ToLowerInvariant() + '-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $sampleDirectory = Join-Path $script:sessionDirectory $sampleName
    New-Item -ItemType Directory -Path $sampleDirectory | Out-Null
    $metadataPath = Join-Path $sampleDirectory 'sample.json'
    $metadata = [ordered]@{
        schemaVersion = 1
        stage = $Stage
        status = 'started'
        startedAt = [DateTimeOffset]::Now.ToString('o')
        processId = $script:gameProcessId
        processStartUtcTicks = $script:gameStartTicks
        minecraftRoot = $script:MinecraftRoot
        javaExecutable = $script:gameExecutable
        jcmdExecutable = $script:resolvedJcmd
        captureKind = $(if ($script:HistogramOnly) { 'live-class-histogram' } else { 'live-heap-dump' })
        captureRequestsFullGc = $true
        processMemoryBefore = Get-ProcessMemory
    }
    Write-Utf8File $metadataPath ($metadata | ConvertTo-Json -Depth 10)
    try {
        $flags = Invoke-GameJcmd 'VM.flags' (Join-Path $sampleDirectory 'vm-flags.txt')
        $null = Invoke-GameJcmd 'VM.version' (Join-Path $sampleDirectory 'vm-version.txt')
        $null = Invoke-GameJcmd 'GC.heap_info' (Join-Path $sampleDirectory 'heap-before.txt')
        if (-not $script:HistogramOnly) {
            $heapLimit = [regex]::Match($flags, '(?:^|\s)-XX:MaxHeapSize=(\d+)')
            if (-not $heapLimit.Success) { throw '无法读取 Java 堆上限，未开始生成大型堆快照。请检查 vm-flags.txt。' }
            $requiredBytes = [long]([double]$heapLimit.Groups[1].Value * 1.5 + 1GB)
            $drive = [IO.DriveInfo]::new([IO.Path]::GetPathRoot($sampleDirectory))
            if ($drive.AvailableFreeSpace -lt $requiredBytes) {
                throw ("磁盘剩余空间不足，完整采样至少预留 {0:N1} GiB；可使用 -HistogramOnly 采集小型直方图。" -f ($requiredBytes / 1GB))
            }
            $heapPath = Join-Path $sampleDirectory 'heap.hprof'
            Write-Host '正在采集堆快照并进行 GC，游戏可能暂停。请等待完成，不要关闭游戏。' -ForegroundColor Yellow
            $null = Invoke-GameJcmd ('GC.heap_dump "' + $heapPath + '"') (Join-Path $sampleDirectory 'heap-dump-command.txt') 1800
            if (-not (Test-Path -LiteralPath $heapPath) -or (Get-Item -LiteralPath $heapPath).Length -eq 0) {
                throw 'jcmd 没有生成有效的 heap.hprof，请检查 heap-dump-command.txt。'
            }
            $metadata['heapDumpBytes'] = (Get-Item -LiteralPath $heapPath).Length
            # Full GC already occurred for the heap dump. Avoid requesting a second one.
            $null = Invoke-GameJcmd 'GC.class_histogram -all' (Join-Path $sampleDirectory 'histogram-all-after-dump.txt') 600
            $metadata['auxiliaryHistogramIncludesUnreachable'] = $true
        } else {
            Write-Host '正在采集经过 GC 的类直方图，游戏可能暂停。' -ForegroundColor Yellow
            $null = Invoke-GameJcmd 'GC.class_histogram' (Join-Path $sampleDirectory 'histogram-live.txt') 600
        }
        $null = Invoke-GameJcmd 'GC.heap_info' (Join-Path $sampleDirectory 'heap-after.txt')
        $metadata['processMemoryAfter'] = Get-ProcessMemory
        $metadata['status'] = 'completed'
        $metadata['completedAt'] = [DateTimeOffset]::Now.ToString('o')
        $latestLog = Join-Path $script:MinecraftRoot 'logs\latest.log'
        if (Test-Path -LiteralPath $latestLog) {
            try {
                Write-Utf8File (Join-Path $sampleDirectory 'latest-log-tail.txt') ((Get-Content -LiteralPath $latestLog -Tail 1000 -Encoding UTF8) -join [Environment]::NewLine)
            } catch { $metadata['logTailError'] = $_.Exception.Message }
        }
        Write-Utf8File $metadataPath ($metadata | ConvertTo-Json -Depth 10)
        if (-not $manifest) {
            $manifest = [pscustomobject]@{
                schemaVersion = 1
                processId = $script:gameProcessId
                processStartUtcTicks = $script:gameStartTicks
                minecraftRoot = $script:MinecraftRoot
                baselineSample = $null
                samples = @()
            }
        }
        if ($Stage -eq 'Baseline') { $manifest.baselineSample = $sampleName }
        $manifest.samples = @($manifest.samples) + $sampleName
        Write-Utf8File $manifestPath ($manifest | ConvertTo-Json -Depth 10)
        Write-Host ("采样完成：{0}" -f $sampleDirectory) -ForegroundColor Green
        Write-Host ("GC 后堆信息：`n{0}" -f (Get-Content -LiteralPath (Join-Path $sampleDirectory 'heap-after.txt') -Raw -Encoding UTF8))
    } catch {
        $metadata['status'] = 'failed'
        $metadata['error'] = $_.Exception.Message
        Write-Utf8File $metadataPath ($metadata | ConvertTo-Json -Depth 10)
        throw
    }
}

try {
    if (-not $MinecraftRoot) { $MinecraftRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..')) }
    $MinecraftRoot = (Resolve-Path -LiteralPath $MinecraftRoot).Path
    $game = Get-GameProcess $TargetJavaProcessId
    $gameProcessId = [int]$game.ProcessId
    $gameExecutable = $game.ExecutablePath
    $gameStartTicks = (Get-Process -Id $gameProcessId).StartTime.ToUniversalTime().Ticks
    $resolvedJcmd = Find-Jcmd $game
    if (-not $OutputRoot) { $OutputRoot = Join-Path $MinecraftRoot 'docs\archive\heap-samples' }
    $OutputRoot = [IO.Path]::GetFullPath($OutputRoot)
    $sessionName = (Get-Process -Id $gameProcessId).StartTime.ToUniversalTime().ToString('yyyyMMddTHHmmssZ') + '-pid' + $gameProcessId
    $sessionDirectory = Join-Path $OutputRoot $sessionName
    Write-Host ("目标 Java 进程：{0}；启动时间：{1}" -f $gameProcessId, (Get-Process -Id $gameProcessId).StartTime) -ForegroundColor Cyan
    Write-Host ("工具：{0}`n输出：{1}" -f $resolvedJcmd, $sessionDirectory)
    if ($Mode -eq 'Status') {
        Write-Host (Invoke-GameJcmd 'GC.heap_info')
        exit 0
    }
    New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
    $ignorePath = Join-Path $OutputRoot '.gitignore'
    if (-not (Test-Path -LiteralPath $ignorePath)) { Write-Utf8File $ignorePath "*`n!.gitignore`n" }
    if ($Mode -ne 'Interactive') {
        Save-HeapSample $Mode
        exit 0
    }
    Write-Host '先等游戏进入世界、JEI 加载完成，再在低占用阶段采集基线；之后继续游玩，增长明显时采集 High。'
    Write-Host '采集后可继续游戏；所有样本均保留在本地，不会自动上传。'
    while ($true) {
        Write-Host "`n[1] 低占用基线  [2] 高占用样本  [S] 查看堆占用（不触发 GC）  [Q] 退出"
        $choice = (Read-Host '请选择').Trim().ToUpperInvariant()
        if ($choice -eq 'Q') { break }
        try {
            switch ($choice) {
                '1' { Save-HeapSample 'Baseline' }
                '2' { Save-HeapSample 'High' }
                'S' { Write-Host (Invoke-GameJcmd 'GC.heap_info') }
                default { Write-Host '请输入 1、2、S 或 Q。' }
            }
        } catch { Write-Host $_.Exception.Message -ForegroundColor Red }
    }
} catch {
    Write-Host ("采样失败：{0}" -f $_.Exception.Message) -ForegroundColor Red
    exit 1
}
