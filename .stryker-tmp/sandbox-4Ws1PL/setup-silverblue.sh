#!/bin/bash

# Silverblue Setup Script for OPL Browser Plugin Development
# This script sets up the development environment in a toolbox

set -e

TOOLBOX_NAME="opl-dev"
PROJECT_DIR=$(pwd)

echo "================================================"
echo "OPL Browser Plugin - Silverblue Setup"
echo "================================================"
echo ""

# Check if running on Silverblue
if [ ! -f "/usr/bin/rpm-ostree" ]; then
    echo "⚠️  This doesn't appear to be Fedora Silverblue"
    echo "   This script is designed for Silverblue systems"
    echo "   On regular Fedora/Linux, just install Node.js:"
    echo "   sudo dnf install nodejs npm"
    exit 0
fi

echo "✅ Detected Fedora Silverblue"
echo ""

# Check if toolbox command exists
if ! command -v toolbox &> /dev/null; then
    echo "❌ toolbox command not found"
    echo "   Please install toolbox: sudo rpm-ostree install toolbox"
    exit 1
fi

echo "📦 Checking for toolbox: $TOOLBOX_NAME"

# Check if toolbox already exists
if toolbox list 2>/dev/null | grep -q "$TOOLBOX_NAME"; then
    echo "✅ Toolbox '$TOOLBOX_NAME' already exists"
else
    echo "📦 Creating toolbox: $TOOLBOX_NAME"
    toolbox create "$TOOLBOX_NAME"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create toolbox"
        exit 1
    fi
    echo "✅ Toolbox created"
fi

echo ""
echo "📦 Installing Node.js in toolbox..."

# Install Node.js in the toolbox
toolbox run -c "$TOOLBOX_NAME" bash -c "
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        echo '✅ Node.js already installed'
        node --version
    else
        echo '📦 Installing Node.js...'
        sudo dnf install -y nodejs npm
        echo '✅ Node.js installed'
        node --version
    fi
    
    # Verify npm
    if command -v npm &> /dev/null; then
        echo '✅ npm installed'
        npm --version
    fi
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js"
    exit 1
fi

echo ""
echo "📦 Installing project dependencies..."

# Navigate to project and install dependencies
toolbox run -c "$TOOLBOX_NAME" bash -c "
    cd '$PROJECT_DIR'
    
    if [ ! -f 'package.json' ]; then
        echo '❌ package.json not found'
        echo '   Make sure you are in the project directory'
        exit 1
    fi
    
    echo '📦 Running npm install...'
    npm install
    
    if [ \$? -eq 0 ]; then
        echo '✅ Dependencies installed'
    else
        echo '❌ Failed to install dependencies'
        exit 1
    fi
"

if [ $? -ne 0 ]; then
    echo "❌ Setup failed"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "You can now run tests using:"
echo ""
echo "  ./run-tests.sh              # Automatic (detects flatpak)"
echo ""
echo "Or manually in the toolbox:"
echo ""
echo "  toolbox enter $TOOLBOX_NAME"
echo "  cd '$PROJECT_DIR'"
echo "  npm test"
echo ""
echo "Or from VS Code terminal (in flatpak):"
echo ""
echo "  flatpak-spawn --host toolbox run -c $TOOLBOX_NAME bash -c \"cd '$PROJECT_DIR' && npm test\""
echo ""
echo "================================================"
