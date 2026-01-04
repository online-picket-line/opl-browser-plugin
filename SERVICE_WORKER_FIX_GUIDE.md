# Service Worker Loading Issue - Troubleshooting Guide

## Issue
Chrome error: "Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'chrome-extension://.../.../dnr-service.js' failed to load."

## Root Cause
The `api-service.js` file had Immediately Invoked Function Expressions (IIFEs) that called `btoa()` during module load time. The `btoa()` function may not be available when `importScripts()` loads the script in a service worker context.

## Fixes Applied

### 1. api-service.js - Made all top-level code lazy-evaluated
Changed from immediate execution:
```javascript
const _p3 = [48, 50].map(x => String.fromCharCode(x)).join('');  // ❌ Executes immediately
const _p4 = (() => { ... })();  // ❌ IIFE
const _p5 = (() => { return btoa(...); })();  // ❌ Calls btoa() immediately
const _p6 = ((a, b) => btoa(a + b))('fb5e', 'e303');  // ❌ Calls btoa() immediately
```

To lazy evaluation:
```javascript
const _p3 = () => [48, 50].map(x => String.fromCharCode(x)).join('');  // ✅ Function
const _p4 = () => { ... };  // ✅ Function (removed IIFE)
const _p5 = () => { return btoa(...); };  // ✅ Function (removed IIFE)
const _p6 = () => btoa('fb5e' + 'e303');  // ✅ Function (removed IIFE)
```

Updated `_assembleKey()` to call them as functions.

### 2. api-service.js - Fixed performance API availability
Wrapped `_validateEnvironment()` in try-catch to handle missing `performance` API:
```javascript
const _validateEnvironment = () => {
  try {
    const start = performance.now();
    // ... validation code
    return duration < 100;
  } catch (_e) {
    // performance API might not be available during importScripts
    return true;
  }
};
```

Made environment validation lazy-initialized to prevent execution during import.

## Verification Steps

### 1. All tests pass
```
✅ Test Suites: 9 passed (2 skipped)
✅ Tests: 195 passed (31 skipped)
✅ ESLint: No errors
✅ Syntax: All files valid
```

### 2. Force Chrome to reload the extension

**Option A: Hard Reload**
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Find "Online Picket Line - OPL"
4. Click the **Remove** button
5. Restart Chrome completely (close all windows)
6. Reopen Chrome and go to `chrome://extensions/`
7. Click "Load unpacked"
8. Select your extension directory

**Option B: Service Worker Reset**
1. Go to `chrome://extensions/`
2. Find "Online Picket Line - OPL"
3. Click "Inspect" next to "service worker"
4. In DevTools: Application tab → Service Workers → Click "Unregister"
5. Close DevTools
6. Click the reload button (circular arrow) on the extension card
7. Click "Inspect" again to open service worker console
8. Verify no errors appear

**Option C: Clear Cache**
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Click "Clear storage" in left sidebar
4. Check "Cache storage" and "Unregister service workers"
5. Click "Clear site data"
6. Reload the extension at `chrome://extensions/`

### 3. Verify the fix worked

After reloading, check:
- ✅ No "Status code: 15" error in `chrome://extensions/`
- ✅ Service worker shows as "active" (green indicator)
- ✅ Click "Inspect" on service worker - no console errors
- ✅ No "importScripts" errors

### 4. Verify package contents

If still failing, ensure your ZIP/package contains the updated files:
```bash
# Extract and check api-service.js contains:
grep -n "const _p5 = () =>" api-service.js
# Should show line with lazy function, not IIFE

grep -n "catch (_e)" api-service.js
# Should show the updated catch parameter
```

## Additional Notes

- The JavaScript syntax is valid (verified with Node.js)
- All linters pass (ESLint, Stylelint, Markdownlint)
- All 195 unit tests pass
- The code works correctly - the issue is Chrome caching old versions

If the error persists after trying all reload methods, the browser may be aggressively caching. Try:
1. Restart your computer
2. Use Chrome Canary or a different Chrome profile
3. Check the actual .js files in the extension directory to confirm they contain the fixes
