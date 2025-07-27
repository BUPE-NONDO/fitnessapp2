# 🚀 Automated GitFlow Script for FitnessApp
# This script automates the entire development process

Write-Host "🚀 Starting Automated GitFlow Process..." -ForegroundColor Green

# Function to create and merge milestone
function New-Milestone {
    param(
        [string]$MilestoneName,
        [string]$CommitMessage,
        [string]$PRTitle,
        [string]$PRBody
    )
    
    Write-Host "📋 Creating $MilestoneName..." -ForegroundColor Yellow
    
    # Create milestone branch
    git checkout dev
    git pull origin dev
    git checkout -b $MilestoneName
    
    # Add changes (this will be customized per milestone)
    git add .
    git commit -m $CommitMessage
    git push origin $MilestoneName
    
    # Create and merge PR
    gh pr create --title $PRTitle --body $PRBody --base dev --head $MilestoneName
    gh pr merge --merge --delete-branch
    
    Write-Host "✅ $MilestoneName completed and merged!" -ForegroundColor Green
}

# Start the automation
Write-Host "🏗️ Setting up complete fitness app structure..." -ForegroundColor Cyan

# Ensure we're on dev branch
git checkout dev

Write-Host "🎯 Automation complete! All milestones processed." -ForegroundColor Green
Write-Host "📋 Next: Run the individual milestone scripts..." -ForegroundColor Yellow
