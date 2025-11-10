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

### Key Dependencies and Licenses

The following major dependencies are included in SQUI builds:

- **Svelte** - MIT License
- **CodeMirror 6** - MIT License
- **Carbon Design System** - Apache 2.0
- **SVAR Svelte DataGrid** - MIT License

All licenses are compatible with Apache 2.0 distribution.

## Security Best Practices

### For Developers

1. **Never add CDN dependencies** - All assets must be bundled locally
   - Run `npm run check:cdn` to verify no CDN URLs in source code
   - This check is included in `npm run check` and CI pipeline
2. **Audit new dependencies** - Check licenses and external requests
3. **Run security checks** - Use `npm audit` regularly
4. **Test offline** - Verify builds work without internet

### For Deployers

1. **Use Content Security Policy** - Restrict what resources can be loaded
2. **Enable offline mode** - For air-gapped deployments
3. **Configure SPARQL endpoints** - Use local or trusted endpoints only
4. **Monitor network requests** - Ensure no unexpected external calls

### For End Users

1. **Review endpoint URLs** - Only query trusted SPARQL endpoints
2. **Use HTTPS** - For endpoint connections when available
3. **Check browser console** - Look for security warnings or errors
4. **Report issues** - Contact your administrator if suspicious behavior is observed

## Vulnerability Reporting

If you discover a security vulnerability in SQUI, please report it to your system administrator or the project maintainers.

**Please do NOT:**
- Create public GitHub issues for security vulnerabilities
- Share vulnerability details publicly before a fix is available

**Please DO:**
- Provide detailed reproduction steps
- Include version information
- Describe the impact and potential risk
- Allow reasonable time for a fix before public disclosure
