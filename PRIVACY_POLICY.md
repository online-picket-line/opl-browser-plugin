# Privacy Policy - Online Picket Line Browser Extension

**Last Updated:** January 3, 2026  
**Effective Date:** January 3, 2026

## Introduction

Online Picket Line ("OPL", "we", "our", or "the extension") is a browser extension that informs users about active labor actions (strikes, boycotts, etc.) when they visit websites associated with those actions. This privacy policy explains what data we collect, how we use it, and your rights regarding your information.

## Our Privacy Commitment

**We do not collect, store, or transmit your browsing history or personal information.**

The extension is designed with privacy-first principles:
- Uses modern declarativeNetRequest API that cannot access page content by design
- All URL matching happens locally in your browser
- No tracking, no analytics, no user profiling
- Open source code available for review

## Data Collection

### What We DO NOT Collect

❌ **Browsing History**: We do not collect, store, or transmit information about which websites you visit  
❌ **Personal Information**: No names, email addresses, phone numbers, or other PII  
❌ **Page Content**: We do not read, access, or transmit the content of web pages  
❌ **Form Data**: We do not access or collect data you enter into forms  
❌ **Passwords or Credentials**: We never access authentication information  
❌ **User Behavior**: No tracking of clicks, scrolling, time on site, or other behaviors  
❌ **Device Information**: No collection of device IDs, fingerprints, or hardware details  
❌ **Location Data**: No geolocation tracking

### What We DO Collect

✅ **User Preferences (Local Only)**
- Display mode choice (banner vs. block mode)
- Stored in: `chrome.storage.sync` (syncs across your devices via browser sync)
- Purpose: Remember your preference
- **Not transmitted to us or any third party**

✅ **Labor Action Data Cache (Local Only)**
- Public labor action information fetched from API
- Stored in: `chrome.storage.local` (local to your browser)
- Purpose: Enable offline functionality and reduce network requests
- **Not transmitted to us or any third party**
- This is public data about strikes, boycotts, and labor organizing

✅ **Cache Timestamps (Local Only)**
- When labor action data was last fetched
- Purpose: Determine when to refresh data
- **Not transmitted to us or any third party**

✅ **Extension Version (For Update Checks)**
- Your current extension version number
- Purpose: Check if updates are available
- Sent to: GitHub API (public, no authentication)
- **No personal identification possible**

## How the Extension Works

### Block Mode (Default for Most Users)

When block mode is enabled:

1. **Browser-Level URL Matching**: 
   - The browser's declarativeNetRequest API matches URLs against rules
   - **No JavaScript execution** unless there's a match
   - Extension code never sees URLs that don't match
   
2. **If Match Found**:
   - Browser redirects to our informational page (`block.html`)
   - Page loads cached labor action details from local storage
   - **No additional network requests**
   - **No URL transmitted anywhere**

3. **Technical Privacy Guarantee**:
   - declarativeNetRequest API **cannot access page content** by architectural design
   - Chrome engineered this API specifically for privacy
   - Impossible for us to read your browsing data, even if we wanted to

### Banner Mode (Non-Intrusive Option)

When banner mode is enabled:

1. **Lightweight Content Script**:
   - Small script (~5KB) runs on web pages
   - Checks current URL against locally cached labor action patterns
   - **Matching happens entirely in your browser**
   
2. **If Match Found**:
   - Displays informational banner at bottom of page
   - Page loads normally
   - Banner uses cached labor action details
   - **No network requests, no data transmission**

3. **What the Script Does NOT Do**:
   - Does not read page content
   - Does not modify page content (except adding banner)
   - Does not track your activity
   - Does not transmit URLs anywhere

## Network Requests

The extension makes network requests only to these endpoints:

### 1. Online Picketline API (Configurable)

**Default Endpoint:** `https://onlinepicketline.com/api/blocklist.json`

**Frequency:** Every 15 minutes (respecting API rate limits)

**Data Sent:**
- API key (embedded in extension, public-tier, read-only)
- Extension version (in User-Agent header)
- Content hash (from previous request, for efficient caching)

**Data Received:**
- Public labor action information (strikes, boycotts, employer names, URLs, descriptions)

**Purpose:** Keep labor action data current

**Your Control:** 
- You can configure a different API endpoint in settings
- You can disable automatic updates (extension will use cached data)

**Privacy:**
- No user identification
- No IP logging by default API endpoint
- Public data only (same information visible on website)

### 2. GitHub Releases API

**Endpoint:** `https://api.github.com/repos/online-picket-line/opl-browser-plugin/releases/latest`

**Frequency:** Once every 24 hours

**Data Sent:** None (public API, no authentication)

**Data Received:** Latest extension version information

**Purpose:** Notify you when updates are available

**Your Control:** 
- You can dismiss update notifications
- Updates never download automatically
- Manual update checking available

## Data Storage

All data is stored locally in your browser using Chrome's Storage API:

### Local Storage (`chrome.storage.local`)

- Labor action cache
- Cache timestamps
- Connection status
- Temporary bypass states

**Lifetime:** Until you clear browser data or uninstall the extension

### Sync Storage (`chrome.storage.sync`)

- Display mode preference (banner vs. block)
- Update notification dismissals

**Lifetime:** Syncs across your devices via browser sync (if enabled)

### Session Storage

- Temporary bypass tokens (for "Proceed Anyway" button)

**Lifetime:** Cleared when browser/tab closes

## Third-Party Services

### Services We Use

1. **Online Picketline API** (configurable)
   - Purpose: Fetch labor action data
   - Data shared: API key, extension version
   - Privacy policy: https://onlinepicketline.com/privacy (if using default endpoint)

2. **GitHub API**
   - Purpose: Check for extension updates
   - Data shared: None (public API)
   - Privacy policy: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement

### Services We DO NOT Use

❌ Google Analytics  
❌ Facebook Pixel  
❌ Any tracking or analytics services  
❌ Advertising networks  
❌ Crash reporting services (though we may add opt-in crash reporting in future)

## Cookies and Tracking

**We do not use cookies or any tracking technologies.**

The extension:
- Does not set or read cookies
- Does not use localStorage for tracking
- Does not employ browser fingerprinting
- Does not use tracking pixels or beacons
- Does not integrate with social media tracking

## Your Rights

### Access

You can view all data stored by the extension:
1. Open browser DevTools (F12)
2. Go to Application → Storage → Extension Storage
3. View all stored data

### Deletion

You can delete all extension data:
- **Option 1**: Uninstall the extension (removes all data)
- **Option 2**: Clear extension data via browser settings
- **Option 3**: Use browser's "Clear browsing data" feature

### Control

You control:
- Whether to use banner or block mode
- API endpoint configuration
- Whether to see update notifications
- Whether to proceed through blocks

### Portability

Your data is minimal (just preferences), but you can:
- Export settings manually via DevTools
- Sync across devices via browser sync

## Children's Privacy

The extension is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has used the extension, please contact us.

## Compliance

### GDPR (European Union)

- **Legal Basis**: Legitimate interest (informing users about labor actions)
- **No Personal Data**: We don't process personal data as defined by GDPR
- **Right to Access**: View data in browser storage
- **Right to Erasure**: Uninstall extension
- **Right to Data Portability**: Minimal data, can be exported
- **No Automated Decision-Making**: User decides whether to proceed through blocks

### CCPA (California)

- **No Sale of Data**: We don't collect personal information to sell
- **No Sharing for Advertising**: We don't use data for targeted advertising
- **Categories Collected**: None (no personal information collected)
- **Right to Know**: This policy explains what we collect
- **Right to Delete**: Uninstall extension

### Other Jurisdictions

We comply with privacy laws in all jurisdictions where the extension is available. Contact us if you have jurisdiction-specific questions.

## Security

### How We Protect Your Privacy

1. **Architecture**: declarativeNetRequest API cannot access page content by design
2. **Local Processing**: All URL matching happens in your browser
3. **No Central Database**: We don't have a server collecting user data
4. **Open Source**: Code is publicly auditable
5. **HTTPS Only**: All network requests use encrypted connections
6. **Minimal Data**: We only store what's necessary for functionality

### API Key Security

The extension includes an embedded API key for the default Online Picketline instance:
- Public-tier key (read-only access)
- Rate-limited (10 requests per 2 minutes per IP)
- Only provides access to public data
- Users can configure their own API endpoint
- Can be revoked if abused

### What You Should Know

- Browser extensions **cannot truly hide code** - anyone can view source
- We embrace transparency rather than "security through obscurity"
- All network requests are visible in DevTools Network tab
- Open source code allows independent security audits

## Changes to This Policy

We may update this privacy policy to reflect:
- Changes in our practices
- Changes in applicable laws
- User feedback

**How We Notify You:**
- Update "Last Updated" date at top of policy
- Announce via extension update notes
- No email notification (we don't have your email)

**Material Changes:**
- Will be announced prominently in extension
- You can continue using extension (implies acceptance) or uninstall

## Open Source & Transparency

**Source Code:** https://github.com/online-picket-line/opl-browser-plugin

You can:
- Review all code
- Verify privacy claims
- Report security issues
- Contribute improvements
- Fork and modify

## Contact Us

**For Privacy Questions:**
- GitHub Issues: https://github.com/online-picket-line/opl-browser-plugin/issues
- Email: privacy@onlinepicketline.org (if available)

**For Security Issues:**
- Please report via GitHub Security Advisories
- We take security seriously and respond promptly

## Legal Basis for Data Processing

We process minimal data based on:

1. **Legitimate Interest**: Informing users about labor actions aligns with labor rights and consumer awareness
2. **User Consent**: Installing the extension implies consent to its functionality
3. **Functionality**: Data storage necessary for extension to work
4. **No Alternative**: Extension cannot function without minimal local data storage

## Data Retention

- **User Preferences**: Until you change them or uninstall
- **Labor Action Cache**: Refreshed every 15 minutes, old data overwritten
- **Temporary Bypass Tokens**: Cleared on browser close
- **Update Check Timestamps**: Until next check or uninstall

**We do not retain any data on our servers because we don't collect any.**

## International Data Transfers

**Not Applicable**: We don't transfer your data because we don't collect it.

The only international data transfers are:
- Your browser fetching labor action data from API (you control endpoint)
- Your browser checking GitHub for updates (GitHub's privacy policy applies)

## Automated Decision Making

**None**: The extension does not use AI or automated profiling for decisions about you. 

URL matching is rule-based (does URL match pattern?), not behavioral analysis.

## Summary

**In plain English:**

- We don't track you
- We don't collect your browsing history
- We can't read your personal information
- Everything happens in your browser
- You control all settings
- You can uninstall anytime
- Code is open source for verification

**Questions?** See our FAQ at https://github.com/online-picket-line/opl-browser-plugin/wiki/FAQ

---

This privacy policy is part of the Online Picket Line open source project, committed to transparency, user privacy, and workers' rights.
