# Build moon-lang release assets and upload to GitHub Releases.
# Usage: .\scripts\release.ps1 v0.3.0
param(
    [Parameter(Mandatory = $true)]
    [string]$Tag
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }

function Find-SwiftRuntimeBin {
    $local = Join-Path $env:LOCALAPPDATA "Programs\Swift\Runtimes"
    if (-not (Test-Path $local)) { return $null }
    $bins = Get-ChildItem $local -Directory | ForEach-Object {
        Join-Path $_.FullName "usr\bin"
    } | Where-Object { Test-Path $_ } | Sort-Object -Descending
    return $bins | Select-Object -First 1
}

Push-Location $Root
try {
    Write-Host "Building release..." -ForegroundColor Cyan
    swift build -c release
    if ($LASTEXITCODE -ne 0) { throw "swift build failed" }

    $candidates = @(
        ".build\x86_64-unknown-windows-msvc\release\moon.exe",
        ".build\release\moon.exe"
    )
    $moonExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $moonExe) { throw "moon.exe not found" }

    $moonAsset = "moon-$Tag-windows-x86_64.exe"
    Copy-Item $moonExe $moonAsset -Force
    $env:Path = "$(Find-SwiftRuntimeBin);$env:Path"
    & ".\$moonExe" version

    $runtimeBin = Find-SwiftRuntimeBin
    if (-not $runtimeBin) { throw "Swift runtime bin not found. Install Swift 6.3+ first." }
    $runtimeAsset = "moon-runtime-$Tag-windows-x86_64.zip"
    if (Test-Path $runtimeAsset) { Remove-Item $runtimeAsset -Force }
    Compress-Archive -Path (Join-Path $runtimeBin "*.dll") -DestinationPath $runtimeAsset -Force
    Write-Host "Runtime DLLs: $((Get-ChildItem $runtimeBin -Filter '*.dll').Count)" -ForegroundColor Cyan

    $stdlibAsset = "moon-stdlib-$Tag.zip"
    if (Test-Path $stdlibAsset) { Remove-Item $stdlibAsset -Force }
    Compress-Archive -Path "stdlib" -DestinationPath $stdlibAsset -Force

    Write-Host "Uploading assets to $Tag..." -ForegroundColor Cyan
    & $gh release upload $Tag $moonAsset $runtimeAsset $stdlibAsset --clobber -R nnxlxde-stack/moon-lang
    Write-Host "Done: https://github.com/nnxlxde-stack/moon-lang/releases/tag/$Tag" -ForegroundColor Green
}
finally {
    Pop-Location
}