# Task 62: Audit and Document External Dependencies

**Status**: 📝 LOW PRIORITY - Documentation & Security
**Priority**: LOW
**Effort**: 1 hour

## Problem

To ensure CHUCC-SQUI can operate in isolated environments, we need comprehensive documentation of all external dependencies and network requests, both at build time and runtime.

## Requirements

### Must Have
- ✅ Complete audit of all external network requests
- ✅ Documentation of build-time vs runtime dependencies
- ✅ Clear security/deployment guidelines
- ✅ Configuration options for each external dependency

### Should Have
- ✅ Automated checks for new external dependencies
- ✅ Linting rules to prevent accidental CDN usage
- ✅ Template for security review

## Audit Scope

### Runtime Dependencies (What the App Loads)

1. **Static Assets**
   - ✅ Carbon CSS - NOW LOCAL (after Task 60)
   - ✅ JavaScript bundles - ALWAYS LOCAL
   - ✅ Fonts - CHECK NEEDED

2. **API Calls**
   - ✅ prefix.cc API - CONFIGURABLE (Task 61)
   - ✅ SPARQL endpoints - USER CONFIGURED (expected)

3. **Third-party Scripts**
   - ✅ No analytics/tracking scripts
   - ✅ No external JavaScript
   - ✅ No iframe embeds

### Build-time Dependencies (Development Only)

1. **NPM Packages**
   - All in package.json
   - Downloaded during `npm install`
   - Bundled into local artifacts
   - NOT loaded at runtime

2. **CDN Usage**
   - None (after Task 60)

## Implementation Plan

### 1. Create Security Documentation

File: `docs/SECURITY.md`

```markdown
# Security & Deployment Guide

## Isolated/Air-Gapped Environments

SQUI is designed to work in completely isolated environments without internet access.

### Runtime Dependencies

SQUI has ZERO runtime dependencies on external services:

✅ **No CDN dependencies** - All CSS/JS bundled locally
✅ **No analytics** - No tracking or telemetry
✅ **No external scripts** - All code self-contained
✅ **No web fonts from CDN** - Fonts bundled or system fallbacks

### Optional External Services

The following features require network access and can be disabled:

| Feature | Service | Configuration | Default |
|---------|---------|---------------|---------|
| Prefix suggestions | prefix.cc API | `offlineMode: true` | Enabled |
| SPARQL queries | User endpoints | User configured | N/A |

### Offline Deployment Checklist

- [ ] Use standalone build: `npm run build:standalone`
- [ ] Enable offline mode: `?offlineMode=true` or config
- [ ] Configure local SPARQL endpoint URLs
- [ ] Test with network disabled
- [ ] Verify no console errors about missing resources
- [ ] Check browser DevTools Network tab (should be empty except endpoint queries)

### Build-time Dependencies

Development requires internet access for:

- NPM package installation
- Optional: Storybook Chromatic (visual testing)

Once packages are installed, builds can run offline.

### Network Request Audit

**Static Assets:**
- None (all bundled locally)

**Runtime API Calls:**
- `https://prefix.cc/*` - Optional prefix suggestions (disable with `offlineMode: true`)
- User-configured SPARQL endpoints (expected and necessary)

**Analytics/Tracking:**
- None (SQUI does not phone home)

### Verifying Offline Operation

```bash
# 1. Build standalone
npm run build:standalone

# 2. Serve locally
cd dist-standalone
python -m http.server 8000

# 3. Open browser
# URL: http://localhost:8000?offlineMode=true

# 4. Disable network in browser DevTools
# (Chrome: DevTools → Network → Offline checkbox)

# 5. Verify
# - Page loads without errors
# - UI renders correctly
# - SPARQL queries work (to configured endpoints)
# - No failed network requests (except endpoint queries)
```

## Content Security Policy (CSP)

Recommended CSP for production deployments:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://*.sparql-endpoint.com;
  img-src 'self' data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

**Note:** Adjust `connect-src` to include your SPARQL endpoint domains.

## License Compliance

All bundled dependencies are Apache 2.0 compatible. See `package.json` for full list.
```

### 2. Add ESLint Rule

File: `.eslintrc.cjs` or `eslint.config.js`

```javascript
rules: {
  // Prevent CDN usage in source code
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value=/https?:\\/\\/(unpkg|cdn|jsdelivr|cdnjs)/]',
      message: 'CDN URLs are not allowed. All assets must be bundled locally for offline support.'
    }
  ],
}
```

### 3. Add Build Check Script

File: `scripts/check-external-deps.js`

```javascript
/**
 * Check for external dependencies in build output
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist-standalone');

const externalPatterns = [
  /https?:\/\/unpkg\.com/,
  /https?:\/\/cdn\.jsdelivr\.net/,
  /https?:\/\/cdnjs\.cloudflare\.com/,
  /https?:\/\/fonts\.googleapis\.com/,
  /https?:\/\/fonts\.gstatic\.com/,
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  for (const pattern of externalPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file: filePath,
        pattern: pattern.source,
        matches: matches
      });
    }
  }

  return violations;
}

function checkDirectory(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  const violations = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile() && /\.(html|css|js)$/.test(file)) {
      violations.push(...checkFile(filePath));
    }
  }

  return violations;
}

console.log('Checking for external dependencies...');
const violations = checkDirectory(distDir);

if (violations.length > 0) {
  console.error('❌ External dependencies found:');
  violations.forEach(v => {
    console.error(`  ${v.file}`);
    console.error(`    Pattern: ${v.pattern}`);
    console.error(`    Matches: ${v.matches.join(', ')}`);
  });
  process.exit(1);
} else {
  console.log('✅ No external dependencies found');
}
```

Add to package.json:

```json
"scripts": {
  "check:external": "node scripts/check-external-deps.js"
}
```

### 4. Update README

File: `README.md`

Add section:

```markdown
## Deployment

### Isolated/Air-Gapped Environments

SQUI is fully self-contained and works without internet access:

```bash
# Build standalone distribution
npm run build:standalone

# Verify no external dependencies
npm run check:external

# Deploy dist-standalone directory to your environment
cp -r dist-standalone /path/to/deployment
```

**Offline configuration:**

```
index.html?offlineMode=true&endpoint=http://your-local-sparql-endpoint/sparql
```

See [docs/SECURITY.md](docs/SECURITY.md) for detailed deployment guide.

### Standard Web Deployment

For internet-connected deployments, all features work out of the box:

```bash
npm run build:standalone
# Deploy dist-standalone to web server
```
```

## Testing Plan

### Automated Checks

```bash
# 1. Build standalone
npm run build:standalone

# 2. Check for external dependencies
npm run check:external

# Expected: Exit 0, no violations
```

### Manual Audit

1. Build standalone distribution
2. Open browser DevTools → Network tab
3. Load application with network disabled
4. Verify:
   - No failed requests (except configured endpoints)
   - All assets load from local files
   - UI renders correctly

## Acceptance Criteria

- [ ] Security documentation created (docs/SECURITY.md)
- [ ] ESLint rule prevents CDN usage
- [ ] Build check script detects external dependencies
- [ ] README documents offline deployment
- [ ] All external dependencies documented
- [ ] Offline deployment checklist provided
- [ ] CSP recommendations included
- [ ] Build check passes: `npm run check:external`

## Files to Create

- `docs/SECURITY.md` - Security and deployment guide
- `scripts/check-external-deps.js` - Build check script

## Files to Modify

- `.eslintrc.cjs` or `eslint.config.js` - Add no-CDN rule
- `package.json` - Add check:external script
- `README.md` - Add deployment section

## Related Tasks

- Task 60: Remove CDN Dependencies
- Task 61: Add Offline Mode Configuration

## Definition of Done

- [ ] Documentation created
- [ ] Build check script created and passes
- [ ] ESLint rule added
- [ ] README updated
- [ ] Manual audit completed
- [ ] No external dependencies in build output
- [ ] All documentation accurate
