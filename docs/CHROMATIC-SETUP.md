# Chromatic Visual Regression Testing Setup

This document explains how to set up Chromatic for automated visual regression testing of Storybook stories.

## What is Chromatic?

**Chromatic** is a visual regression testing tool that automatically detects UI changes by comparing screenshots of your Storybook stories across builds. It's particularly useful for catching:

- Unintended visual changes
- CSS regressions
- Component rendering bugs across browsers
- Accessibility issues

**License**: Free for open-source projects, paid for private repos
**Website**: https://www.chromatic.com

## Prerequisites

- Storybook already installed and configured ✅ (we have this)
- GitHub repository for CI/CD integration
- Chromatic account (sign up with GitHub)

## Setup Steps

### 1. Sign Up for Chromatic

1. Go to https://www.chromatic.com
2. Click "Sign up with GitHub"
3. Authorize Chromatic to access your repository
4. Select the `CHUCC-SQUI` repository

### 2. Get Your Project Token

After creating a project in Chromatic:

1. Copy your unique project token (looks like: `chpt_xxx...`)
2. Add it to your environment:

```bash
# .env.local (gitignored - DO NOT COMMIT)
CHROMATIC_PROJECT_TOKEN=chpt_your_token_here
```

Or add it as a GitHub Secret:
- Go to: Repository → Settings → Secrets and variables → Actions
- Click "New repository secret"
- Name: `CHROMATIC_PROJECT_TOKEN`
- Value: `chpt_your_token_here`

### 3. Install Chromatic CLI

The `chromatic` package is already installed via `@chromatic-com/storybook` addon.

Verify installation:

```bash
npx chromatic --version
```

### 4. Run Your First Chromatic Build

```bash
npm run chromatic
```

This will:
1. Build your Storybook
2. Upload stories to Chromatic
3. Take screenshots of all stories
4. Create a baseline for future comparisons

**First run**: All stories will be accepted as the baseline
**Subsequent runs**: Any visual changes will be flagged for review

### 5. Review Changes in Chromatic UI

After running Chromatic, you'll get a URL to review changes:

```
https://www.chromatic.com/build?appId=xxx&number=1
```

In the UI, you can:
- ✅ **Accept** changes (new baseline)
- ❌ **Deny** changes (mark as bug)
- 👁️ Compare side-by-side before/after
- 📊 View browser/viewport matrix

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/chromatic.yml`:

```yaml
name: Chromatic

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required for Chromatic

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true # Don't fail CI on visual changes
          autoAcceptChanges: main # Auto-accept changes on main branch
```

### Environment Variables

Configure these in Chromatic project settings or GitHub Secrets:

| Variable | Description | Required |
|----------|-------------|----------|
| `CHROMATIC_PROJECT_TOKEN` | Your project token | ✅ Yes |
| `CHROMATIC_APP_CODE` | Alternative to token | Optional |

## Configuration

### Chromatic Config (.chromatic.yml - Optional)

Create `.chromatic.yml` in project root:

```yaml
# Chromatic configuration
buildScriptName: build-storybook
exitZeroOnChanges: true
exitOnceUploaded: false

# Ignore certain stories
ignoreLastBuildOnBranch: 'renovate/**'

# Browser matrix (default: Chrome desktop)
browsers:
  - name: chrome
    viewport:
      width: 1920
      height: 1080
  - name: chrome
    viewport:
      width: 375
      height: 667 # Mobile viewport

# Threshold for visual changes (0-1)
threshold: 0.2 # 20% difference triggers flag
```

## Storybook Integration

The `@chromatic-com/storybook` addon is already installed and provides:

- 🎨 Visual diff comparison in Storybook
- 📊 Chromatic status in Storybook UI
- 🔗 Deep links to Chromatic builds

## Usage

### Local Development

```bash
# Run Chromatic locally
npm run chromatic

# Run with specific flags
npx chromatic --only-changed --skip "Icon/**"
```

### CI/CD

```bash
# GitHub Actions will run automatically on:
# - Push to main
# - Pull requests

# Manual trigger:
gh workflow run chromatic.yml
```

## Best Practices

1. **Baseline Management**
   - Accept baselines carefully
   - Review all changes before accepting
   - Use `--auto-accept-changes` only on main branch

2. **Story Coverage**
   - Add stories for all visual states (hover, focus, error, loading)
   - Use play functions to test interactions
   - Cover responsive breakpoints

3. **Performance**
   - Limit large dataset stories to representative samples
   - Use `ignoreLastBuildOnBranch` for WIP branches
   - Skip unchanged stories with `--only-changed`

4. **Thresholds**
   - Start with default threshold (0)
   - Adjust if getting too many false positives
   - Different thresholds for different story categories

## Troubleshooting

### Build Fails with "No stories found"

- Verify Storybook builds successfully: `npm run build-storybook`
- Check `.storybook/main.ts` stories glob patterns

### "Threshold exceeded" false positives

- Fonts may render slightly differently across systems
- Animation timing can cause differences
- Consider increasing threshold or using `waitForAnimations`

### Rate limit errors

- Free tier: 5,000 snapshots/month
- Upgrade plan if exceeding limits
- Use `--only-changed` to reduce snapshot count

## Useful Commands

```bash
# Run Chromatic
npm run chromatic

# Run only changed stories
npx chromatic --only-changed

# Skip certain stories
npx chromatic --skip "**/*.test.stories.ts"

# Debug mode
npx chromatic --debug

# List all stories
npx chromatic --list

# Dry run (no upload)
npx chromatic --dry-run
```

## Cost Estimation

| Plan | Price | Snapshots/month | Browsers |
|------|-------|----------------|----------|
| **Free** (Open Source) | $0 | 5,000 | 1 browser |
| **Essential** | $149/mo | 35,000 | 5 browsers |
| **Professional** | $399/mo | 100,000 | Unlimited |

**Our project**: ~50 stories × 1 browser × ~20 builds/month = ~1,000 snapshots/month
**Recommendation**: Free tier is sufficient

## Links

- 📚 [Chromatic Documentation](https://www.chromatic.com/docs/)
- 🎨 [Storybook + Chromatic Guide](https://storybook.js.org/tutorials/visual-testing-handbook/)
- 🔧 [GitHub Action](https://github.com/chromaui/action)
- 💬 [Discord Community](https://discord.gg/storybook)

## Next Steps

1. ✅ Sign up for Chromatic account
2. ✅ Add `CHROMATIC_PROJECT_TOKEN` to GitHub Secrets
3. ✅ Create `.github/workflows/chromatic.yml`
4. ✅ Run first build: `npm run chromatic`
5. ✅ Review and accept baseline
6. ✅ Enable on pull requests

---

**Note**: Chromatic is optional but highly recommended for visual regression testing. Our existing integration tests and Storybook play functions provide good coverage, but Chromatic adds an extra layer of confidence for visual changes across browsers and viewports.
