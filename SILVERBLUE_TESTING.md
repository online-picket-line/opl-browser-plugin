# Running Tests on Fedora Silverblue

## Quick Start

If you're using Fedora Silverblue with VS Code in a flatpak container, follow these steps:

### 1. First-Time Setup

Run the setup script to create a toolbox and install Node.js:

```bash
./setup-silverblue.sh
```

This will:
- Create a toolbox named `opl-dev`
- Install Node.js and npm in the toolbox
- Install project dependencies

### 2. Run Tests

Use the test runner script (it auto-detects flatpak):

```bash
./run-tests.sh
```

The script will:
- Detect you're in a flatpak environment
- Use `flatpak-spawn` to run tests in the toolbox
- Handle all the complexity for you

## Manual Commands

### Create Toolbox (if needed)

```bash
# From outside flatpak (host terminal)
toolbox create opl-dev

# Install Node.js
toolbox run -c opl-dev sudo dnf install -y nodejs npm
```

### Run Tests Manually

#### Option 1: From VS Code Terminal (in flatpak)

```bash
# Run all tests
flatpak-spawn --host toolbox run -c opl-dev bash -c "cd '$PWD' && npm test"

# Run specific test
flatpak-spawn --host toolbox run -c opl-dev bash -c "cd '$PWD' && npm test tests/update-service.test.js"

# Run with coverage
flatpak-spawn --host toolbox run -c opl-dev bash -c "cd '$PWD' && npm run test:coverage"
```

#### Option 2: Enter Toolbox First

```bash
# Open a host terminal (Ctrl+Alt+T)
toolbox enter opl-dev

# Navigate to project
cd /var/home/oplfun/projects/online-picket-line/opl-browser-plugin

# Run tests
npm test
```

## Understanding the Setup

### Why Toolbox?

Fedora Silverblue is an immutable OS. You can't install Node.js directly on the host system. Instead, you use **toolboxes** - containerized development environments.

### What is flatpak-spawn?

When VS Code runs in a flatpak, it's sandboxed. To access the host system (where toolboxes live), you use `flatpak-spawn --host`.

### The Test Runner Script

The `run-tests.sh` script automatically:
1. Detects if running in flatpak
2. Creates toolbox if needed
3. Installs Node.js if needed
4. Runs tests using `flatpak-spawn`

## Troubleshooting

### "toolbox: command not found"

Install toolbox on the host:
```bash
# In a host terminal (Ctrl+Alt+T)
sudo rpm-ostree install toolbox
sudo systemctl reboot
```

### "flatpak-spawn: command not found"

This shouldn't happen if VS Code is in flatpak. Verify:
```bash
echo $FLATPAK_ID
# Should output: com.visualstudio.code
```

### Tests Don't Run

Check Node.js in toolbox:
```bash
flatpak-spawn --host toolbox run -c opl-dev node --version
```

If not installed:
```bash
flatpak-spawn --host toolbox run -c opl-dev sudo dnf install -y nodejs npm
```

### Dependencies Not Installed

```bash
flatpak-spawn --host toolbox run -c opl-dev bash -c "cd '$PWD' && npm install"
```

### Wrong Working Directory

Make sure `$PWD` points to the project:
```bash
cd /var/home/oplfun/projects/online-picket-line/opl-browser-plugin
./run-tests.sh
```

## Testing the Setup

Verify everything is working:

```bash
# 1. Check flatpak environment
echo $FLATPAK_ID
# Expected: com.visualstudio.code

# 2. Check toolbox exists
flatpak-spawn --host toolbox list | grep opl-dev

# 3. Check Node.js in toolbox
flatpak-spawn --host toolbox run -c opl-dev node --version

# 4. Run a simple test
./run-tests.sh tests/update-service.test.js
```

## Common Commands Cheatsheet

```bash
# Setup (first time)
./setup-silverblue.sh

# Run all tests
./run-tests.sh

# Run specific test
./run-tests.sh tests/update-service.test.js

# Run with coverage
./run-tests.sh --coverage

# Watch mode
./run-tests.sh --watch

# Install dependencies
flatpak-spawn --host toolbox run -c opl-dev bash -c "cd '$PWD' && npm install"

# Enter toolbox (for debugging)
# (Use host terminal: Ctrl+Alt+T)
toolbox enter opl-dev
```

## Architecture

```
┌─────────────────────────────────────┐
│  VS Code (Flatpak Container)       │
│  ├── Your code                      │
│  ├── flatpak-spawn (escape to host)│
│  └── run-tests.sh (auto-detects)   │
└──────────────┬──────────────────────┘
               │ flatpak-spawn --host
               ↓
┌─────────────────────────────────────┐
│  Host System (Silverblue)           │
│  └── Toolbox (opl-dev)              │
│      ├── Node.js                    │
│      ├── npm                        │
│      ├── Jest                       │
│      └── Your project files         │
│          (mounted from host)        │
└─────────────────────────────────────┘
```

## Performance Notes

- **First run**: Slower (creates toolbox, installs Node.js)
- **Subsequent runs**: Fast (~2-3 seconds for all tests)
- The toolbox is persistent - setup is one-time only

## Alternative: Use Host Terminal

If you prefer working directly in the toolbox:

1. Open a host terminal: `Ctrl+Alt+T`
2. Enter toolbox: `toolbox enter opl-dev`
3. Navigate: `cd /var/home/oplfun/projects/...`
4. Run tests: `npm test`

This avoids `flatpak-spawn` complexity but requires switching terminals.

## Why Not Install Node.js in Flatpak?

The VS Code flatpak doesn't include Node.js, and you can't install system packages in flatpaks. Toolboxes are the recommended Silverblue workflow for development.

## Resources

- [Fedora Silverblue Documentation](https://docs.fedoraproject.org/en-US/fedora-silverblue/)
- [Toolbox Documentation](https://containertoolbx.org/)
- [Flatpak Documentation](https://docs.flatpak.org/)

---

**Last Updated**: December 28, 2025  
**Tested On**: Fedora Silverblue with VS Code flatpak
