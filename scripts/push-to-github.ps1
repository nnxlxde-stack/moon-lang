# Push full commit history to https://github.com/nnxlxde-stack/moon-lang.git
# Requires GitHub access to nnxlxde-stack/moon-lang (PAT or SSH key).

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$remote = "https://github.com/nnxlxde-stack/moon-lang.git"
git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remote
} else {
    git remote set-url origin $remote
}

Write-Host "Commits to push (oldest → newest):" -ForegroundColor Cyan
git log --oneline --reverse master

Write-Host "`nPushing master → origin/main ..." -ForegroundColor Cyan
git push -u origin master:main --force-with-lease

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Remote: $remote (branch main)" -ForegroundColor Green
} else {
    Write-Host @"

Push failed. Authenticate as nnxlxde-stack owner:

  HTTPS + Personal Access Token:
    git credential-manager erase https://github.com
    # then push again — browser/PAT prompt for nnxlxde-stack

  Or SSH:
    git remote set-url origin git@github.com:nnxlxde-stack/moon-lang.git
    ssh -T git@github.com
    git push -u origin master:main --force-with-lease

"@ -ForegroundColor Yellow
    exit 1
}