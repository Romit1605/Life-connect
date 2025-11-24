#!/bin/bash

echo "========================================"
echo "Pushing Life Connect to GitHub"
echo "========================================"
echo ""

# Navigate to project directory
cd "c:/Users/NET/medine/my-fullstack-app"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo ""
fi

# Add remote repository
echo "Setting up remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Romit1605/Life-connect.git
echo ""

# Stage all files
echo "Staging all files..."
git add .
echo ""

# Create commit
echo "Creating commit..."
git commit -m "Fix backend errors and integrate MongoDB Atlas

- Fixed critical authentication middleware logic error
- Integrated MongoDB Atlas connection
- Improved error handling across all controllers
- Added data population for better API responses
- Created comprehensive documentation
- Added .gitignore for security"
echo ""

# Push to GitHub (force push to overwrite old code)
echo "Pushing to GitHub..."
git push -f origin main
echo ""

echo "========================================"
echo "Done! Code pushed to GitHub"
echo "========================================"
