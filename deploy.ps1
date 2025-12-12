Write-Host "=========================================" -ForegroundColor Green
Write-Host "Smart Greenhouse Farmers Life v2.0" -ForegroundColor Green
Write-Host "Repository Setup & Push" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Add all changes
Write-Host "Adding files to git..." -ForegroundColor Cyan
git add .

# Create commit if there are changes
$status = git status --porcelain
if ($status) {
    Write-Host "Creating commit..." -ForegroundColor Cyan
    git commit -m "chore: update project files"
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# Show current status
Write-Host ""
Write-Host "Current remotes:" -ForegroundColor Cyan
git remote -v

# Push to new repository
Write-Host ""
Write-Host "Pushing to SmartGreenFarmersLife repository..." -ForegroundColor Cyan
git push -u newrepo main

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "View your repository at:" -ForegroundColor Cyan
Write-Host "https://github.com/TechGriffo254/SmartGreenFarmersLife" -ForegroundColor Yellow
