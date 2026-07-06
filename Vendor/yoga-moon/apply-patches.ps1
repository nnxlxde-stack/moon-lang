$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$yoga = Join-Path $root "Vendor\yoga\yoga"

if (-not (Test-Path $yoga)) {
    throw "Vendor/yoga submodule is missing. Run: git submodule update --init --recursive"
}

$moduleMap = Join-Path $yoga "module.modulemap"
$moduleMapDisabled = Join-Path $yoga "module.modulemap.disabled"
if (Test-Path $moduleMap) {
    Rename-Item $moduleMap $moduleMapDisabled -Force
}

$vendorPackage = Join-Path $root "Vendor\yoga\Package.swift"
$vendorPackageDisabled = Join-Path $root "Vendor\yoga\Package.swift.disabled"
if (Test-Path $vendorPackage) {
    Rename-Item $vendorPackage $vendorPackageDisabled -Force
}

$includeDir = Join-Path $yoga "include"
New-Item -ItemType Directory -Force -Path $includeDir | Out-Null
Copy-Item (Join-Path $PSScriptRoot "YogaCoreStub.h") (Join-Path $includeDir "YogaCoreStub.h") -Force

Write-Host "Yoga vendor patches applied."