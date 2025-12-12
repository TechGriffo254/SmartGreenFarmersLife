#!/bin/bash

echo "========================================="
echo "Smart Greenhouse Farmers Life v2.0"
echo "Repository Setup & Push"
echo "========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git..."
    git init
    git branch -M main
fi

# Add all changes
echo "Adding files to git..."
git add .

# Create commit if there are changes
if git diff --staged --quiet; then
    echo "No changes to commit."
else
    git commit -m "chore: update project files"
fi

# Show remotes
echo ""
echo "Current remotes:"
git remote -v

# Push to new repository
echo ""
echo "Pushing to SmartGreenFarmersLife repository..."
git push -u newrepo main

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "View your repository at:"
echo "https://github.com/TechGriffo254/SmartGreenFarmersLife"
