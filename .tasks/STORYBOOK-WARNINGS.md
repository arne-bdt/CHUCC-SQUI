# Storybook Warnings & Resolutions

This document explains the warnings you may see when running Storybook and how they've been addressed.

## ✅ Fixed Issues

### 1. ~~argTypesRegex Warning~~ (RESOLVED)

**Previous Warning:**
```
Attention: We've detected that you're using actions.argTypesRegex together
with the visual test addon
```

**Resolution:**
Removed the `actions: { argTypesRegex: '^on[A-Z].*' }` configuration from [.storybook/preview.ts](.storybook/preview.ts:1).

**Why it was removed:**
- The visual test addon doesn't process the regex during snapshot testing
- Could cause hard-to-debug issues with action props
- Recommended by Storybook to use explicit `fn()` functions instead

**Action for future event handlers:**
When you add event handler props (like `onClick`, `onSubmit`), explicitly assign actions in stories:
```typescript
import { fn } from '@storybook/test';

export const WithActions: Story = {
  args: {
    onClick: fn(),
    onSubmit: fn(),
  },
};
```

---

## ⚠️ Expected Warnings (Non-Critical)

These warnings are **expected** and **do not indicate errors**:

### 1. DEP0190 Deprecation Warning

**Warning Message:**
```
(node:XXXXX) [DEP0190] DeprecationWarning: Passing args to a child process
with shell option true can lead to security vulnerabilities, as the
arguments are not escaped, only concatenated.
```

**Status:** ⚠️ **Known Issue - Safe to Ignore**

**Explanation:**
- This warning originates from **Node.js internals** used by npm and Storybook
- It's a warning about how npm spawns child processes
- **Not** caused by your code or configuration
- **Not** a security risk in local development or CI/CD environments

**Why it appears:**
- npm uses `shell: true` when running scripts with `&&` operators
- Example: `npm run check` executes `type-check && lint && format:check && ...`
- Node.js v21+ warns about this pattern for security awareness

**Is it dangerous?**
No, in this context:
- ✅ All commands are defined in `package.json` (trusted source)
- ✅ No user input is passed to shell commands
- ✅ Build environment is controlled (not accepting external args)

**Will it be fixed?**
- Waiting for npm/Storybook to update their internal shell handling
- Track progress: https://github.com/npm/cli/issues/6099
- Expected fix in future npm versions

**Action Required:**
**None** - Safe to ignore during development and builds.

---

### 2. Svelte Slot Deprecation Warnings

**Warning Messages:**
```
[vite-plugin-svelte] Using `<slot>` to render parent content is deprecated.
Use `{@render ...}` tags instead
```

**Status:** ⚠️ **Expected - Will be addressed in Task 06+**

**Explanation:**
- Svelte 5 introduces a new syntax for slots using `{@render ...}` tags
- Existing components ([SplitPane](src/lib/components/Layout/SplitPane.svelte:1), [Toolbar](src/lib/components/Toolbar/Toolbar.svelte:1)) use legacy `<slot>` syntax
- Both syntaxes work correctly; this is just a **future deprecation notice**

**Why not fixed yet:**
- Current components were built in Task 02 before Svelte 5 migration
- Will be systematically updated during Phase 2 (Tasks 06-12) when we refactor components
- Fixing now would be premature optimization

**Action Required:**
**Defer** - Address during component refactoring in Phase 2.

---

### 3. A11y Warnings in SplitPane

**Warning Messages:**
```
[vite-plugin-svelte] noninteractive element cannot have nonnegative tabIndex value
[vite-plugin-svelte] Non-interactive element `<div>` should not be assigned
mouse or keyboard event listeners
```

**Status:** ⚠️ **Expected - Will be addressed in Task 42-44 (Accessibility)**

**Explanation:**
- The SplitPane divider is a `<div>` with `role="separator"` and `tabindex="0"`
- Svelte compiler warns because `<div>` is not interactive by default
- **However**: Adding `role="separator"` + `tabindex="0"` makes it accessible
- This is **correct ARIA implementation** for a draggable separator

**Why the warning:**
- Svelte's a11y linter doesn't recognize `role="separator"` as interactive
- It's a false positive - the implementation is correct

**Action Required:**
**Defer** - Will add ESLint ignore comment during Task 42 (WCAG compliance).

**Correct pattern (already implemented):**
```svelte
<div
  class="split-pane-divider"
  role="separator"           <!-- Makes it interactive -->
  aria-orientation="horizontal"
  aria-valuenow={Math.round(splitRatio * 100)}
  tabindex="0"              <!-- Keyboard accessible -->
  onmousedown={handleMouseDown}
/>
```

---

### 4. No MDX Story Files Found

**Warning Message:**
```
No story files found for the specified pattern: src\**\*.mdx
```

**Status:** ℹ️ **Informational - Not an Error**

**Explanation:**
- Storybook looks for both `.stories.ts` and `.mdx` files
- This project uses TypeScript stories (`.stories.ts`) instead of MDX
- No MDX files exist (and that's intentional)

**Why TypeScript instead of MDX:**
- Better type safety with Svelte 5 components
- Easier to maintain with IDE support
- Consistent with project's TypeScript-first approach

**Action Required:**
**None** - This is expected behavior.

---

### 5. Large Chunk Size Warning

**Warning Message:**
```
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
```

**Status:** ℹ️ **Expected for Storybook Builds**

**Explanation:**
- Storybook bundles Carbon Design System CSS (~742 KB)
- Includes axe-core for a11y testing (~579 KB)
- These are necessary dependencies for the component documentation

**Why it's okay:**
- This is the **static documentation build**, not the production component
- Users importing `SparqlQueryUI` component won't include Storybook bundles
- Only affects the deployed Storybook documentation site

**Will it affect performance:**
- No impact on the main `npm run build` (component build)
- Storybook static site loads quickly with gzip compression
- Actual sizes: 742 KB → 64 KB (gzipped), 579 KB → 159 KB (gzipped)

**Action Required:**
**None** - Acceptable for documentation builds.

---

## Build Process Integration

### Updated Build Requirements

Storybook is now integrated into the build process:

```bash
# Run all quality checks (including Storybook)
npm run check

# This executes:
# - npm run type-check
# - npm run lint
# - npm run format:check
# - npm run test:unit
# - npm run build-storybook  ← NEW
```

### Individual Storybook Commands

```bash
# Development server (live reload)
npm run storybook              # http://localhost:6006

# Build static documentation
npm run build-storybook        # Output: storybook-static/

# Test stories (interaction/visual)
npm run test:storybook         # Requires Storybook dev server running
```

### CI/CD Integration

For continuous integration, use:

```yaml
# .github/workflows/ci.yml (example)
- name: Run quality checks
  run: npm run check

# This now includes Storybook build verification
```

---

## Storybook Test Runner (Optional)

The `@storybook/test-runner` package is installed for future use:

**What it does:**
- Runs all stories as automated tests
- Verifies stories render without errors
- Can run interaction tests
- Can capture visual snapshots

**How to use (future):**
```bash
# 1. Start Storybook dev server
npm run storybook

# 2. In another terminal, run tests
npm run test:storybook
```

**When to use:**
- **Phase 11** (Tasks 45-47): Testing phase
- Add to CI/CD pipeline for automated visual regression testing
- Catch component rendering errors before deployment

---

## Summary

### ✅ Action Items Completed

1. **Removed** `argTypesRegex` from Storybook config
2. **Added** `build-storybook` to `npm run check` script
3. **Updated** [CLAUDE.md](.claude/CLAUDE.md:1) with Storybook build requirements
4. **Installed** `@storybook/test-runner` for future testing
5. **Documented** all warnings and their resolutions

### 📋 Future Tasks

| Task Phase | Storybook-Related Action |
|------------|--------------------------|
| **Phase 2** (06-12) | Update components to use `{@render}` syntax |
| **Phase 10** (42-44) | Add ESLint ignore for valid a11y patterns |
| **Phase 11** (45-47) | Implement `test:storybook` in CI/CD |
| **Phase 12** (48-50) | Deploy static Storybook as NPM package docs |

### 🎯 Current State

**All critical checks passing:**
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors/warnings
- ✅ Prettier: All files formatted
- ✅ Tests: 92/92 passing
- ✅ Storybook: Builds successfully
- ⚠️ Warnings: All expected and documented

**Storybook is production-ready** for component development! 🎉

---

**Last Updated:** 2025-10-26
**Storybook Version:** 9.1.15
**Related Documentation:** [.tasks/04.5-storybook-setup.md](.tasks/04.5-storybook-setup.md:1)
