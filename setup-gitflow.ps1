# GitFlow Setup Script for Fitness App
# This script sets up the complete GitFlow with milestone branches and automatic merging

Write-Host "🚀 Setting up GitFlow for Fitness App..." -ForegroundColor Green

# Initialize Git repository if not already done
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Set up Git configuration
git config user.name "Bupe Nondo"
git config user.email "peternondo1@gmail.com"

# Add all files to staging
Write-Host "📁 Adding all files to Git..." -ForegroundColor Yellow
git add .

# Create initial commit on main branch
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "🎉 Initial commit: Complete Fitness App

✅ Features included:
- Complete onboarding system with 8 steps
- Dynamic dashboard with progress tracking  
- Workout plan generation and execution
- Achievement and badge system
- Settings with profile management and password security
- Firebase authentication and Firestore integration
- Responsive design with dark/light theme
- Admin panel with analytics
- Comprehensive testing suite
- Production-ready deployment configuration

🔧 Technical stack:
- React + TypeScript + Vite
- Firebase (Auth, Firestore, Hosting)
- Tailwind CSS for styling
- tRPC for type-safe APIs
- Comprehensive testing with Vitest
- GitFlow ready for milestone development

🏗️ Architecture:
- Monorepo structure with apps and packages
- Modular component architecture
- Service layer for business logic
- Comprehensive error handling
- Performance optimizations
- Security best practices"

# Rename master to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -eq "master") {
    git branch -m main
    Write-Host "✅ Renamed master branch to main" -ForegroundColor Green
}

# Create dev branch
Write-Host "🌿 Creating dev branch..." -ForegroundColor Yellow
git checkout -b dev
git checkout main

Write-Host "✅ GitFlow setup complete!" -ForegroundColor Green
Write-Host "📋 Branches created:" -ForegroundColor Cyan
Write-Host "  - main (production)" -ForegroundColor White
Write-Host "  - dev (development)" -ForegroundColor White

# Define milestones for incremental development
$milestones = @(
    @{
        name = "milestone/01-project-foundation"
        description = "Project setup, configuration, and basic structure"
        features = @("Project initialization", "TypeScript setup", "Build configuration", "Basic folder structure")
    },
    @{
        name = "milestone/02-authentication-system"
        description = "Firebase authentication and user management"
        features = @("Firebase setup", "Google Sign-in", "User authentication", "Auth context")
    },
    @{
        name = "milestone/03-onboarding-flow"
        description = "Complete user onboarding experience"
        features = @("Welcome screen", "Personal info", "Fitness goals", "Body metrics", "Preferences")
    },
    @{
        name = "milestone/04-dashboard-core"
        description = "Main dashboard with basic functionality"
        features = @("Dashboard layout", "User profile", "Navigation", "Basic UI components")
    },
    @{
        name = "milestone/05-workout-system"
        description = "Workout planning and execution"
        features = @("Workout plans", "Exercise database", "Workout sessions", "Progress tracking")
    },
    @{
        name = "milestone/06-progress-tracking"
        description = "Comprehensive progress and analytics"
        features = @("Progress stats", "Charts", "Goal tracking", "Achievement system")
    },
    @{
        name = "milestone/07-settings-security"
        description = "Settings, profile management, and security"
        features = @("Settings page", "Profile editing", "Password management", "Security features")
    },
    @{
        name = "milestone/08-admin-system"
        description = "Admin panel and management tools"
        features = @("Admin dashboard", "User management", "Analytics", "System monitoring")
    },
    @{
        name = "milestone/09-testing-quality"
        description = "Testing suite and quality assurance"
        features = @("Unit tests", "Integration tests", "E2E tests", "Performance optimization")
    },
    @{
        name = "milestone/10-deployment-production"
        description = "Production deployment and final optimizations"
        features = @("Firebase deployment", "Performance optimization", "Security hardening", "Documentation")
    }
)

Write-Host "🏗️ Creating milestone branches..." -ForegroundColor Yellow

foreach ($milestone in $milestones) {
    git checkout -b $milestone.name
    Write-Host "  ✅ Created: $($milestone.name)" -ForegroundColor Green
    
    # Create milestone documentation
    $milestoneDoc = @"
# $($milestone.name.Replace('milestone/', '').Replace('-', ' ').ToUpper())

## Description
$($milestone.description)

## Features
$($milestone.features | ForEach-Object { "- $_" } | Out-String)

## Status
- [ ] Development
- [ ] Testing  
- [ ] Code Review
- [ ] Merge to dev
- [ ] Merge to main

## Notes
This milestone represents a significant development phase in the fitness app project.
"@
    
    $milestoneDoc | Out-File -FilePath "docs/milestones/$($milestone.name.Replace('milestone/', '')).md" -Encoding UTF8
    git add "docs/milestones/$($milestone.name.Replace('milestone/', '')).md"
    git commit -m "📋 Add milestone documentation for $($milestone.name)"
}

# Return to main branch
git checkout main

Write-Host "🎯 Milestone branches created successfully!" -ForegroundColor Green
Write-Host "📊 Total milestones: $($milestones.Count)" -ForegroundColor Cyan

# Show branch structure
Write-Host "🌳 Branch structure:" -ForegroundColor Cyan
git branch -a

Write-Host "🚀 GitFlow setup complete! Ready for development." -ForegroundColor Green
