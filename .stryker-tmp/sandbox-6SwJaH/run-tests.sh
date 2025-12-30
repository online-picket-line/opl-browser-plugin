#!/bin/bash

# Test Runner Script
# Validates test files and runs Jest tests if available
# Supports Fedora Silverblue with flatpak/toolbox

echo "================================================"
echo "Online Picket Line - Update Service Test Runner"
echo "================================================"
echo ""

# Detect if running in flatpak (Silverblue scenario)
USING_FLATPAK=false
TOOLBOX_NAME="opl-dev"

if [ -f "/.flatpak-info" ] || [ -n "$FLATPAK_ID" ]; then
    echo "🔍 Detected flatpak environment (Silverblue)"
    USING_FLATPAK=true
    
    # Check if flatpak-spawn is available
    if ! command -v flatpak-spawn &> /dev/null; then
        echo "❌ flatpak-spawn not found"
        echo "   This is unexpected in a flatpak environment"
        exit 1
    fi
    
    echo "✅ flatpak-spawn available"
    
    # Check if toolbox exists
    if ! flatpak-spawn --host toolbox list 2>/dev/null | grep -q "$TOOLBOX_NAME"; then
        echo "⚠️  Toolbox '$TOOLBOX_NAME' not found"
        echo "   Creating toolbox..."
        flatpak-spawn --host toolbox create "$TOOLBOX_NAME"
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create toolbox"
            echo "   Run: toolbox create $TOOLBOX_NAME"
            exit 1
        fi
        echo "✅ Toolbox created"
    fi
    
    echo "✅ Using toolbox: $TOOLBOX_NAME"
    
    # Install Node.js in toolbox if needed
    echo "📦 Checking Node.js in toolbox..."
    if ! flatpak-spawn --host toolbox run -c "$TOOLBOX_NAME" node --version &> /dev/null; then
        echo "📦 Installing Node.js in toolbox..."
        flatpak-spawn --host toolbox run -c "$TOOLBOX_NAME" sudo dnf install -y nodejs npm
        if [ $? -ne 0 ]; then
            echo "❌ Failed to install Node.js"
            exit 1
        fi
    fi
    
    NODE_VERSION=$(flatpak-spawn --host toolbox run -c "$TOOLBOX_NAME" node --version 2>/dev/null)
    NPM_VERSION=$(flatpak-spawn --host toolbox run -c "$TOOLBOX_NAME" npm --version 2>/dev/null)
    
    echo "✅ Node.js version: $NODE_VERSION"
    echo "✅ npm version: $NPM_VERSION"
else
    # Regular environment (not flatpak)
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
fi

echo ""

# Function to run npm command (handles flatpak/toolbox)
run_npm() {
    if [ "$USING_FLATPAK" = true ]; then
        flatpak-spawn --host toolbox run -c "$TOOLBOX_NAME" bash -c "cd '$PWD' && $*"
    else
        eval "$*"
    fi
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

# Verify test files exist
echo "🔍 Checking test files..."
test_files=(
    "tests/update-service.test.js"
    "tests/background-update-integration.test.js"
    "tests/popup-update-ui.test.js"
)

missing_files=0
for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo ""
    echo "❌ $missing_files test file(s) missing"
    exit 1
fi

echo ""
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
