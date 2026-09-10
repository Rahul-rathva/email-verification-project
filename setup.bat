@echo off
REM setup.bat - Setup and start the Email Verification Project (Windows)
REM This batch script installs dependencies and provides startup instructions

setlocal enabledelayedexpansion
cls

echo.
echo ========================================
echo Email Verification Module - Setup
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed. 
    echo Please install from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%

REM Check MongoDB
echo.
echo Checking MongoDB...
where mongod >nul 2>nul
if errorlevel 1 (
    echo [WARN] MongoDB not found in PATH
    echo       Install from https://www.mongodb.com/try/download/community
) else (
    echo [OK] MongoDB found
)

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Copy .env file
if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file
)

REM Run backend tests
echo.
echo Running backend tests...
call npm test 2>nul || (
    echo [INFO] Tests may require MongoDB to run fully
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.

echo IMPORTANT: Before starting the app, ensure MongoDB is running!
echo.
echo Starting the application:
echo.
echo 1. Start MongoDB (open new Command Prompt):
echo    mongod
echo.
echo 2. Start Backend (open new Command Prompt):
echo    cd backend
echo    npm start
echo    Backend will run on: http://localhost:5000
echo.
echo 3. Start Frontend (open new Command Prompt):
echo    cd frontend
echo    npm run dev
echo    Frontend will run on: http://localhost:5173
echo.
echo Test the API:
echo    curl -X POST http://localhost:5000/api/verify -H "Content-Type: application/json" -d "{\"email\": \"test@gmail.com\"}"
echo.
echo Press any key to exit...
pause >nul
