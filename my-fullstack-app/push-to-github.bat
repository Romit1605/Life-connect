@echo off
echo ========================================
echo Pushing Life Connect to GitHub
echo ========================================
echo.

REM Navigate to project directory
cd /d "c:\Users\NET\medine\my-fullstack-app"

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add remote repository
echo Setting up remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Romit1605/Life-connect.git
echo.

REM Stage all files
echo Staging all files...
git add .
echo.

REM Create commit
echo Creating commit...
git commit -m "Fix backend errors and integrate MongoDB Atlas - Complete refactor with authentication fixes, improved error handling, and MongoDB Atlas integration"
echo.

REM Push to GitHub (force push to overwrite old code)
echo Pushing to GitHub...
git push -f origin main
echo.

echo ========================================
echo Done! Code pushed to GitHub
echo ========================================
pause
