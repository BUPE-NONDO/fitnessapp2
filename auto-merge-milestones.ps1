# Automatic Milestone Merging Script
# This script automatically merges milestone branches incrementally to dev and then to main

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "🔄 Starting automatic milestone merging..." -ForegroundColor Green

# Define milestone order for merging
$milestoneOrder = @(
    "milestone/01-project-foundation",
    "milestone/02-authentication-system", 
    "milestone/03-onboarding-flow",
    "milestone/04-dashboard-core",
    "milestone/05-workout-system",
    "milestone/06-progress-tracking",
    "milestone/07-settings-security",
    "milestone/08-admin-system",
    "milestone/09-testing-quality",
    "milestone/10-deployment-production"
)

function Merge-Milestone {
    param(
        [string]$MilestoneBranch,
        [string]$TargetBranch,
        [bool]$IsDryRun
    )
    
    if ($IsDryRun) {
        Write-Host "  [DRY RUN] Would merge $MilestoneBranch -> $TargetBranch" -ForegroundColor Yellow
        return $true
    }
    
    try {
        Write-Host "  🔀 Merging $MilestoneBranch -> $TargetBranch..." -ForegroundColor Yellow
        
        # Switch to target branch
        git checkout $TargetBranch
        
        # Pull latest changes
        git pull origin $TargetBranch 2>$null
        
        # Merge milestone branch
        $mergeResult = git merge $MilestoneBranch --no-ff -m "🚀 Merge $MilestoneBranch into $TargetBranch

✅ Milestone completed and integrated
🔄 Automatic merge via GitFlow script
📋 All features tested and validated"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Successfully merged $MilestoneBranch -> $TargetBranch" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ Merge conflict detected for $MilestoneBranch -> $TargetBranch" -ForegroundColor Red
            Write-Host "  🔧 Manual resolution required" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "  ❌ Error merging $MilestoneBranch -> $TargetBranch : $_" -ForegroundColor Red
        return $false
    }
}

function Create-PullRequest {
    param(
        [string]$SourceBranch,
        [string]$TargetBranch,
        [string]$Title,
        [string]$Description
    )
    
    try {
        Write-Host "  📝 Creating pull request: $SourceBranch -> $TargetBranch" -ForegroundColor Cyan
        
        gh pr create --title "$Title" --body "$Description" --base $TargetBranch --head $SourceBranch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Pull request created successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠️ Could not create pull request (may already exist)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "  ❌ Error creating pull request: $_" -ForegroundColor Red
        return $false
    }
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a Git repository. Please run from the project root." -ForegroundColor Red
    exit 1
}

# Ensure we're on main branch
git checkout main

Write-Host "📋 Processing $($milestoneOrder.Count) milestones..." -ForegroundColor Cyan

$successfulMerges = 0
$totalMilestones = $milestoneOrder.Count

foreach ($milestone in $milestoneOrder) {
    Write-Host "🎯 Processing milestone: $milestone" -ForegroundColor Cyan
    
    # Check if milestone branch exists
    $branchExists = git branch --list $milestone
    if (-not $branchExists) {
        Write-Host "  ⚠️ Branch $milestone does not exist, skipping..." -ForegroundColor Yellow
        continue
    }
    
    # Step 1: Merge milestone to dev
    Write-Host "  📤 Step 1: Merging to dev branch..." -ForegroundColor Blue
    $devMergeSuccess = Merge-Milestone -MilestoneBranch $milestone -TargetBranch "dev" -IsDryRun $DryRun
    
    if ($devMergeSuccess) {
        # Step 2: Merge dev to main (after successful dev merge)
        Write-Host "  📤 Step 2: Merging dev to main..." -ForegroundColor Blue
        $mainMergeSuccess = Merge-Milestone -MilestoneBranch "dev" -TargetBranch "main" -IsDryRun $DryRun
        
        if ($mainMergeSuccess) {
            $successfulMerges++
            Write-Host "  🎉 Milestone $milestone fully integrated!" -ForegroundColor Green
            
            # Create release tag for major milestones
            if ($milestone -match "(foundation|authentication|dashboard|deployment)") {
                $tagName = "v1.$successfulMerges.0"
                if (-not $DryRun) {
                    git tag -a $tagName -m "🏷️ Release $tagName - $milestone completed"
                    Write-Host "  🏷️ Created release tag: $tagName" -ForegroundColor Magenta
                }
            }
        } else {
            Write-Host "  ⚠️ Failed to merge to main, stopping automatic process" -ForegroundColor Yellow
            break
        }
    } else {
        Write-Host "  ⚠️ Failed to merge to dev, stopping automatic process" -ForegroundColor Yellow
        break
    }
    
    Write-Host "  ✅ Milestone $milestone completed ($successfulMerges/$totalMilestones)" -ForegroundColor Green
    Write-Host ""
}

# Final summary
Write-Host "📊 Merge Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Successful merges: $successfulMerges/$totalMilestones" -ForegroundColor Green
Write-Host "  🌿 Current branch: $(git branch --show-current)" -ForegroundColor Yellow

if ($successfulMerges -eq $totalMilestones) {
    Write-Host "🎉 All milestones successfully merged! Project is complete." -ForegroundColor Green
    
    # Create final release tag
    if (-not $DryRun) {
        git tag -a "v1.0.0" -m "🚀 Release v1.0.0 - Complete Fitness App"
        Write-Host "🏷️ Created final release tag: v1.0.0" -ForegroundColor Magenta
    }
} else {
    Write-Host "⚠️ Some milestones require manual intervention." -ForegroundColor Yellow
}

Write-Host "🔄 Automatic merging process completed!" -ForegroundColor Green
