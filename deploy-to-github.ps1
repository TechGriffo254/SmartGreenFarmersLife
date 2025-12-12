# Smart Greenhouse Farmers Life - Repository Setup & Deployment

Write-Host "🌱 Smart Greenhouse Farmers Life - Repository Setup" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Checking current directory..." -ForegroundColor Cyan
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Check if already a git repository
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove existing git history and start fresh? (yes/no)"
    if ($response -eq "yes") {
        Write-Host "🗑️  Removing existing .git directory..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .git
        Write-Host "✅ Removed existing git history" -ForegroundColor Green
    } else {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

Write-Host "📋 Step 2: Installing dependencies..." -ForegroundColor Cyan

# Backend dependencies
Write-Host "   Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green

# Frontend dependencies
Write-Host "   Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 3: Checking environment files..." -ForegroundColor Cyan

# Check backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "   ⚠️  Backend .env not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "   📝 Please edit backend\.env with your credentials!" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Backend .env exists" -ForegroundColor Green
}

# Check frontend .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "   ⚠️  Frontend .env not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "   📝 Please edit frontend\.env with your credentials!" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Frontend .env exists" -ForegroundColor Green
}
Write-Host ""

Write-Host "📋 Step 4: Initializing git repository..." -ForegroundColor Cyan
git init
git branch -M main
Write-Host "   ✅ Git repository initialized" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 5: Creating .gitignore..." -ForegroundColor Cyan
$gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Environment files
.env
.env.local
.env.production

# Build outputs
frontend/build/
frontend/dist/
backend/uploads/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Misc
.cache/
.tmp/
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent
Write-Host "   ✅ .gitignore created" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 6: Adding files to git..." -ForegroundColor Cyan
git add .
Write-Host "   ✅ Files added to staging" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 7: Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Smart Greenhouse Farmers Life v2.0

Features:
- Vite-based React frontend
- Express.js backend with MongoDB
- Real-time IoT monitoring
- AI farming assistant (Google Gemini)
- Pest detection (YOLO11)
- Weather integration (OpenWeatherMap)
- Multilingual support (EN/SW)
- Voice input/output
- Data aggregation & analytics"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Initial commit created" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 8: Setting up remote repository..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   🌐 Go to GitHub and create a new repository:" -ForegroundColor Yellow
Write-Host "   Repository name: SmartGreenFarmersLife" -ForegroundColor Cyan
Write-Host "   Description: IoT Smart Greenhouse with AI Assistant" -ForegroundColor Cyan
Write-Host "   Public or Private: Your choice" -ForegroundColor Cyan
Write-Host "   DO NOT initialize with README, .gitignore, or license" -ForegroundColor Red
Write-Host ""

$createRepo = Read-Host "Have you created the repository on GitHub? (yes/no)"

if ($createRepo -eq "yes") {
    Write-Host ""
    Write-Host "   Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/TechGriffo254/SmartGreenFarmersLife.git
    
    Write-Host "   ✅ Remote origin added" -ForegroundColor Green
    Write-Host ""
    
    $pushNow = Read-Host "Do you want to push to GitHub now? (yes/no)"
    
    if ($pushNow -eq "yes") {
        Write-Host ""
        Write-Host "   📤 Pushing to GitHub..." -ForegroundColor Yellow
        git push -u origin main
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Push failed! You may need to authenticate." -ForegroundColor Red
            Write-Host "   Try running: git push -u origin main" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Successfully pushed to GitHub!" -ForegroundColor Green
        }
    } else {
        Write-Host ""
        Write-Host "   📝 To push later, run:" -ForegroundColor Yellow
        Write-Host "   git push -u origin main" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "   📝 After creating the repository, run:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/TechGriffo254/SmartGreenFarmersLife.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Edit backend\.env with your API keys" -ForegroundColor Yellow
Write-Host "   2. Edit frontend\.env with your API keys" -ForegroundColor Yellow
Write-Host "   3. Start backend: cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "   4. Start frontend: cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host "   5. Open http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README_NEW.md - Complete project documentation" -ForegroundColor Yellow
Write-Host "   - INSTALLATION.md - Detailed setup guide" -ForegroundColor Yellow
Write-Host "   - MIGRATION_NOTES.md - What changed" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Happy Farming! 🌱" -ForegroundColor Green
