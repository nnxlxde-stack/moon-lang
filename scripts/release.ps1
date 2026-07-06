# Build moon-lang release binary and upload to GitHub Releases.
# Usage: .\scripts\release.ps1 v0.3.0
param(
    [Parameter(Mandatory = $true)]
    [string]$Tag
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }

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

    $asset = "moon-$Tag-windows-x86_64.exe"
    Copy-Item $moonExe $asset -Force
    & ".\$moonExe" version

    Write-Host "Uploading $asset to $Tag..." -ForegroundColor Cyan
    & $gh release upload $Tag $asset --clobber -R nnxlxde-stack/moon-lang
    Write-Host "Done: https://github.com/nnxlxde-stack/moon-lang/releases/tag/$Tag" -ForegroundColor Green
}
finally {
    Pop-Location
}