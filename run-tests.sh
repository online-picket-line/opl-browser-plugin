#!/bin/bash

# Test Runner Script
# Validates test files and runs Jest tests

echo "================================================"
echo "Online Picket Line - Update Service Test Runner"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js v16 or higher"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    echo "   Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

echo ""

# Function to run npm command
run_npm() {
    eval "$*"
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    run_npm npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo ""
fi


echo "================================================"
echo "Running Tests"
echo "================================================"
echo ""

# Run tests
if [ "$1" == "--coverage" ]; then
    echo "Running tests with coverage..."
    run_npm npm run test:coverage
elif [ "$1" == "--watch" ]; then
    echo "Running tests in watch mode..."
    run_npm npm run test:watch
elif [ ! -z "$1" ]; then
    echo "Running specific test: $1"
    run_npm npm test -- "$1"
else
    echo "Running all tests..."
    run_npm npm test
fi

exit_code=$?

echo ""
echo "================================================"
if [ $exit_code -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed (exit code: $exit_code)"
fi
echo "================================================"

exit $exit_code
