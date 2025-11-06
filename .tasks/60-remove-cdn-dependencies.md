# Task 60: Remove CDN Dependencies from Standalone Build

**Status**: ✅ CRITICAL - Security & Offline Capability
**Priority**: HIGH
**Effort**: 2-3 hours

## Problem

CHUCC-SQUI currently loads Carbon Design System CSS from a CDN (unpkg.com) in the standalone build, which violates the requirement that the application must be self-contained and work in isolated environments without internet access.

### Current Issues

1. **CDN CSS Reference** (standalone.html:11)
   ```html
   <link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte@0.90.1/css/all.css">
   ```
   - Requires internet access to load Carbon styles
   - Fails in air-gapped environments
   - Security risk: external dependency on third-party CDN

2. **Build Script Limitation**
   - `scripts/copy-standalone.js` doesn't copy Carbon CSS files
   - Only copies built JS bundle, not CSS dependencies
   - Carbon CSS is imported in `src/main.ts` but not bundled for standalone

3. **Missing CSS in dist-standalone**
   - No local Carbon CSS files in standalone distribution
   - Application would be unstyled without internet access

## Requirements

### Must Have
- ✅ All dependencies bundled locally (no external URLs)
- ✅ Works in completely offline/air-gapped environments
- ✅ No runtime network requests for static assets
- ✅ Carbon Design System CSS fully bundled

### Should Have
- ✅ Optimized CSS bundle (remove unused styles)
- ✅ Support for all Carbon themes (white, g10, g90, g100)
- ✅ Minimal bundle size increase

## Solution Design

### Approach 1: Copy Carbon CSS to dist-standalone (RECOMMENDED)

**Pros:**
- Simple implementation
- Preserves existing architecture
- Easy to maintain
- Works with current build process

**Cons:**
- Slightly larger bundle (multiple theme files)
- Requires updating standalone.html

**Steps:**
1. Update `scripts/copy-standalone.js` to copy Carbon CSS files
2. Update `standalone.html` to reference local CSS files
3. Add CSS theme switching logic if needed

### Approach 2: Bundle CSS with Vite

**Pros:**
- Single bundled CSS file
- Can optimize/tree-shake unused styles
- Aligns with modern build practices

**Cons:**
- Requires Vite configuration changes
- May need separate build config for standalone
- More complex implementation

**Recommendation:** Use Approach 1 for initial implementation, consider Approach 2 for optimization later.

## Implementation Plan

### 1. Update Build Script

Modify `scripts/copy-standalone.js`:

```typescript
// Copy Carbon CSS files
const carbonCssDir = path.join(rootDir, 'node_modules/carbon-components-svelte/css');
const carbonCssFiles = ['all.css', 'white.css', 'g10.css', 'g90.css', 'g100.css'];

console.log('Copying Carbon CSS files...');
for (const file of carbonCssFiles) {
  const srcPath = path.join(carbonCssDir, file);
  const destPath = path.join(standaloneDir, 'css', file);

  // Create css directory if it doesn't exist
  if (!fs.existsSync(path.dirname(destPath))) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`  ✓ css/${file}`);
}
```

### 2. Update standalone.html

Replace CDN link with local CSS:

```html
<!-- Before -->
<link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte@0.90.1/css/all.css">

<!-- After -->
<link rel="stylesheet" href="./css/all.css">
```

### 3. Add Theme Switching Support (Optional)

If dynamic theme switching is needed:

```javascript
// Add to standalone.html <script>
function loadTheme(theme) {
  const link = document.querySelector('link[href*="carbon-components"]');
  if (link) {
    link.href = `./css/${theme}.css`;
  }
}

// Load theme from URL param or config
const theme = urlConfig.theme?.theme || 'g10';
loadTheme(theme);
```

### 4. Update README

Document offline capability:

```markdown
## Offline/Air-Gapped Deployment

SQUI standalone distribution is completely self-contained:

- ✅ No CDN dependencies
- ✅ No external network requests for static assets
- ✅ Works in isolated/air-gapped environments
- ✅ All styles and scripts bundled locally

Simply copy the `dist-standalone` directory to your server or environment.
```

## Testing Plan

### Unit Tests
- No specific unit tests needed (build script logic is simple)

### Integration Tests
- Verify Carbon CSS files are copied to dist-standalone/css/
- Verify standalone.html references local CSS
- Verify all theme files (white, g10, g90, g100) are included

### E2E Tests
```typescript
test('standalone build loads without internet', async ({ page, context }) => {
  // Block all external requests
  await context.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith('http://localhost') || url.startsWith('file://')) {
      route.continue();
    } else {
      route.abort(); // Block external requests
    }
  });

  await page.goto('http://localhost:8000/dist-standalone/');

  // Verify no console errors about missing CSS
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.waitForTimeout(2000);
  expect(errors.filter(e => e.includes('css') || e.includes('stylesheet'))).toHaveLength(0);

  // Verify Carbon styles are applied
  const bgColor = await page.evaluate(() => {
    return getComputedStyle(document.body).getPropertyValue('--cds-ui-background');
  });
  expect(bgColor).toBeTruthy();
});
```

### Manual Testing
1. Build standalone: `npm run build:standalone`
2. Disconnect from internet
3. Serve locally: `python -m http.server 8000` (in dist-standalone/)
4. Open http://localhost:8000 in browser
5. Verify:
   - Page loads without errors
   - Carbon styles are applied
   - All UI components render correctly
   - No network requests to external URLs

## Acceptance Criteria

- [ ] No CDN references in standalone.html
- [ ] Carbon CSS files copied to dist-standalone/css/
- [ ] All theme files included (white, g10, g90, g100, all)
- [ ] Standalone build works without internet connection
- [ ] Build script updated with CSS copying logic
- [ ] README documents offline capability
- [ ] Manual testing confirms offline functionality
- [ ] Build size increase < 500KB (acceptable for self-contained requirement)

## Build & Tests Status

After implementation:

```bash
npm run build:standalone  # Must succeed
npm run preview:standalone # Must work offline
```

## Files to Modify

- `scripts/copy-standalone.js` - Add CSS copying logic
- `standalone.html` - Replace CDN link with local reference
- `dist-standalone/README.md` - Document offline capability

## Files to Create

- `dist-standalone/css/all.css` (copied from node_modules)
- `dist-standalone/css/white.css` (copied from node_modules)
- `dist-standalone/css/g10.css` (copied from node_modules)
- `dist-standalone/css/g90.css` (copied from node_modules)
- `dist-standalone/css/g100.css` (copied from node_modules)

## Dependencies

- No new dependencies required
- Uses existing `carbon-components-svelte` package

## Risks & Mitigations

**Risk:** Larger bundle size
**Mitigation:** Carbon CSS is ~300KB, acceptable for offline capability

**Risk:** CSS versioning issues
**Mitigation:** Copy from node_modules ensures version consistency

**Risk:** Breaking existing functionality
**Mitigation:** Thorough testing, fallback to CDN if needed (dev mode only)

## Related Tasks

- Task 61: Add Offline Mode Configuration
- Task 62: Add Prefix.cc API Configuration

## Notes

- This is a CRITICAL security and deployment requirement
- Many environments (government, healthcare, finance) require air-gapped deployments
- No external dependencies should be loaded at runtime
- All assets must be self-contained in the distribution package

## Definition of Done

- [ ] Code changes completed and tested
- [ ] Build script updated
- [ ] Manual offline testing completed
- [ ] Documentation updated
- [ ] Build succeeds with `npm run build:standalone`
- [ ] Application works without internet connection
- [ ] No console errors about missing CSS
- [ ] All Carbon UI components render correctly
- [ ] All theme files included
- [ ] README documents offline capability
