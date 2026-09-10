#!/bin/bash
# setup.sh - Setup and start the Email Verification Project
# This script installs dependencies and starts both backend and frontend

set -e

echo "========================================"
echo "Email Verification Module - Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js and npm
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 14+ from https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check MongoDB
echo ""
echo -e "${BLUE}Checking MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB is not installed or not in PATH${NC}"
    echo "   You can still test the API without MongoDB for now"
    echo "   Install from: https://www.mongodb.com/try/download/community"
else
    echo -e "${GREEN}✓ MongoDB found${NC}"
fi

# Install backend dependencies
echo ""
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Copy .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env from .env.example${NC}"
fi

# Run backend tests
echo ""
echo -e "${BLUE}Running backend tests...${NC}"
npm test -- --passWithNoTests || true

# Install frontend dependencies
echo ""
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo ""
echo -e "${GREEN}========================================"
echo "Setup Complete!"
echo "========================================${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo ""
echo "1. Terminal 1 - Start MongoDB:"
echo "   ${YELLOW}mongod${NC}"
echo ""
echo "2. Terminal 2 - Start Backend:"
echo "   ${YELLOW}cd backend && npm start${NC}"
echo "   Backend will run on: http://localhost:5000"
echo ""
echo "3. Terminal 3 - Start Frontend:"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo "   Frontend will run on: http://localhost:5173"
echo ""
echo -e "${BLUE}Test the API:${NC}"
echo "   ${YELLOW}curl -X POST http://localhost:5000/api/verify -H 'Content-Type: application/json' -d '{\"email\": \"test@gmail.com\"}'${NC}"
echo ""
