# Task 76: Migrate to loglevel Logging Library

## Overview

Replace direct `console.*` calls and the existing `debug.ts` utility with the industry-standard `loglevel` library. This provides consistent, production-safe logging with runtime control and zero bundle overhead in production builds.

## Motivation

### Current Problems

1. **Inconsistent Logging**: Mix of direct `console.*` calls (17 files) and custom `debug.ts` utility
2. **Debug Noise**: Debug logs appear in production builds
3. **Maintenance**: Custom `debug.ts` requires ongoing maintenance
4. **No Standard**: Each developer may use different logging patterns

### Why loglevel?

1. **Industry Standard**: Used by millions of Svelte/JavaScript projects
2. **Minimal Bundle Size**: <1KB minified + gzipped
3. **Battle-Tested**: Stable, reliable, well-maintained
4. **TypeScript Support**: Official type definitions via `@types/loglevel`
5. **Runtime Control**: Change log levels without rebuilding
6. **Browser + Node.js**: Works in both environments (tests + browser)
7. **Tree-Shakeable**: Unused code eliminated by Vite
8. **MIT License**: Compatible with Apache 2.0 project license

### Benefits

✅ **Production-Safe**: Log levels prevent debug noise in production
✅ **Developer-Friendly**: Runtime control via `log.setLevel()`
✅ **Zero Dependencies**: loglevel has no external dependencies
✅ **Consistent API**: Single logging pattern across entire codebase
✅ **Better DX**: Clear log level semantics (trace, debug, info, warn, error)
✅ **Testing Support**: Works seamlessly with Vitest

## Requirements

### 1. Install loglevel

```bash
npm install loglevel
npm install --save-dev @types/loglevel
```

**License Check**: MIT (✅ Compatible with Apache 2.0)

### 2. Create Logger Wrapper

**File**: `src/lib/utils/logger.ts`

```typescript
/**
 * Application logger using loglevel
 *
 * Log levels (in order of severity):
 * - trace: Very detailed debugging (not commonly used)
 * - debug: Detailed debugging for development
 * - info: Informational messages
 * - warn: Warning messages (something unexpected but handled)
 * - error: Error messages (failures that need attention)
 * - silent: Disable all logging
 *
 * Usage:
 *   import { logger } from '$lib/utils/logger';
 *   logger.debug('Debug message');
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 *
 * Runtime control (browser console):
 *   logger.setLevel('debug');  // Show debug and above
 *   logger.setLevel('warn');   // Show only warnings and errors
 *   logger.setLevel('silent'); // Disable all logs
 *   logger.getLevel();         // Get current level
 *
 * Environment-based defaults:
 * - Development: 'debug' (show all except trace)
 * - Production: 'warn' (show only warnings and errors)
 */

import log from 'loglevel';

// Configure default log level based on environment
const defaultLevel = import.meta.env.DEV ? 'debug' : 'warn';

// Initialize logger
log.setLevel(defaultLevel);

// Check localStorage for persisted log level (browser only)
if (typeof localStorage !== 'undefined') {
  try {
    const savedLevel = localStorage.getItem('logLevel');
    if (savedLevel) {
      log.setLevel(savedLevel as log.LogLevelDesc);
    }
  } catch {
    // localStorage might not be available (e.g., in tests)
  }
}

/**
 * Wrap setLevel to persist to localStorage
 */
const originalSetLevel = log.setLevel.bind(log);
log.setLevel = ((level: log.LogLevelDesc, persist = true) => {
  originalSetLevel(level, persist);

  // Persist to localStorage if in browser
  if (persist && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('logLevel', String(level));
    } catch {
      // Ignore localStorage errors
    }
  }

  return log;
}) as typeof log.setLevel;

/**
 * Global logger instance
 *
 * @example
 * import { logger } from '$lib/utils/logger';
 *
 * logger.debug('Query parsing started');
 * logger.info('Connected to endpoint');
 * logger.warn('Falling back to JSON format');
 * logger.error('Failed to execute query', error);
 */
export const logger = log;

/**
 * Performance logging helper (only logs in debug mode)
 *
 * @example
 * import { logPerformance } from '$lib/utils/logger';
 *
 * logPerformance('Query Performance', {
 *   'Total time': '245.32 ms',
 *   'Network': '123.45 ms',
 *   'Parse': '67.89 ms',
 *   'Results': '1,234 rows',
 * });
 */
export function logPerformance(label: string, metrics: Record<string, unknown>): void {
  if (log.getLevel() <= log.levels.DEBUG) {
    console.group(`🔬 ${label}`);
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
    console.groupEnd();
  }
}

/**
 * Expose logger to window for runtime control (development only)
 *
 * Usage in browser console:
 *   window.__logger.setLevel('debug')
 *   window.__logger.setLevel('warn')
 *   window.__logger.getLevel()
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as { __logger?: typeof log }).__logger = log;
}

/**
 * Log level constants for convenience
 */
export const LogLevel = {
  TRACE: 'trace' as const,
  DEBUG: 'debug' as const,
  INFO: 'info' as const,
  WARN: 'warn' as const,
  ERROR: 'error' as const,
  SILENT: 'silent' as const,
};
```

### 3. Migration Pattern

Replace console calls according to these patterns:

```typescript
// ❌ BEFORE: Direct console calls
console.log('Debug message');
console.debug('Debug info');
console.info('Informational');
console.warn('Warning');
console.error('Error occurred', error);

// ✅ AFTER: loglevel logger
import { logger } from '$lib/utils/logger';

logger.debug('Debug message');
logger.debug('Debug info');
logger.info('Informational');
logger.warn('Warning');
logger.error('Error occurred', error);
```

```typescript
// ❌ BEFORE: Custom debug utility
import { debug } from '$lib/utils/debug';

debug.log('Debug message');
debug.warn('Warning');
debug.error('Error');

// ✅ AFTER: loglevel logger
import { logger } from '$lib/utils/logger';

logger.debug('Debug message');
logger.warn('Warning');
logger.error('Error');
```

```typescript
// ❌ BEFORE: Performance logging with console.group
console.group('🔬 Query Performance');
console.log('⏱️  Total time:', time, 'ms');
console.log('📊 Results:', rowCount, 'rows');
console.groupEnd();

// ✅ AFTER: logPerformance helper
import { logPerformance } from '$lib/utils/logger';

logPerformance('Query Performance', {
  'Total time': `${time.toFixed(2)} ms`,
  'Results': `${rowCount} rows`,
});
```

### 4. Files to Update

Update the following files (17 files with console calls):

**Stores** (4 files):
- `src/lib/stores/tabStore.ts` (7 console calls)
- `src/lib/stores/resultsStore.ts` (if any)
- `src/lib/stores/settingsStore.ts` (2 console.error calls)

**Components** (6 files):
- `src/lib/components/Toolbar/RunButton.svelte`
- `src/lib/components/Results/ResultsPlaceholder.svelte`
- `src/lib/components/Editor/SparqlEditor.svelte`
- `src/lib/components/Results/RawView.svelte`
- `src/lib/components/Tabs/QueryTabs.svelte`
- `src/SparqlQueryUI.inner.svelte`

**Services** (4 files):
- `src/lib/services/performanceService.ts` (11 console calls in logMetrics)
- `src/lib/services/prefixService.ts` (3 console calls)
- `src/lib/services/queryExecutionService.ts`
- `src/lib/services/serviceDescriptionCache.ts`
- `src/lib/services/workerParserService.ts`

**Utilities** (2 files):
- `src/lib/utils/download.ts`
- `src/standalone-wrapper.js` (JavaScript file - may keep console for bootstrap)

### 5. Remove Old Debug Utility

**Delete**: `src/lib/utils/debug.ts` (no longer needed)

Update any remaining imports:
```bash
# Search for debug.ts imports
grep -r "from.*debug" src/
```

### 6. Update Documentation

**File**: `README.md` (add logging section)

```markdown
## Debugging

SQUI uses [loglevel](https://github.com/pimterry/loglevel) for logging.

### Log Levels

- **Development**: `debug` level (shows all logs except trace)
- **Production**: `warn` level (shows only warnings and errors)

### Runtime Control

In the browser console:

\`\`\`javascript
// Enable debug logging
window.__logger.setLevel('debug');

// Show only warnings and errors
window.__logger.setLevel('warn');

// Disable all logging
window.__logger.setLevel('silent');

// Check current log level
window.__logger.getLevel();
\`\`\`

The log level is persisted to `localStorage` and survives page reloads.

### In Code

\`\`\`typescript
import { logger } from '$lib/utils/logger';

logger.debug('Detailed debugging information');
logger.info('Informational message');
logger.warn('Warning: something unexpected');
logger.error('Error occurred', error);
\`\`\`

### Performance Logging

\`\`\`typescript
import { logPerformance } from '$lib/utils/logger';

logPerformance('Query Execution', {
  'Total time': '245.32 ms',
  'Network': '123.45 ms',
  'Results': '1,234 rows',
});
\`\`\`
```

## Implementation Steps

### Step 1: Install loglevel
```bash
npm install loglevel
npm install --save-dev @types/loglevel
```

**Verify**:
- Check `package.json` includes loglevel and @types/loglevel
- Run `npm run type-check` to verify TypeScript types

### Step 2: Create Logger Wrapper
1. Create `src/lib/utils/logger.ts` with the code above
2. Export logger, logPerformance, and LogLevel
3. Add JSDoc comments for IDE support
4. Test import works: `import { logger } from '$lib/utils/logger';`

### Step 3: Update Stores
1. Update `src/lib/stores/tabStore.ts`
   - Replace `console.log` → `logger.debug`
   - Replace `console.warn` → `logger.warn`
   - Replace `console.error` → `logger.error`
2. Update `src/lib/stores/settingsStore.ts`
   - Replace `console.error` → `logger.error`
3. Run tests: `npm test`

### Step 4: Update Services
1. Update `src/lib/services/performanceService.ts`
   - Replace `logMetrics()` body with `logPerformance()`
   - Import: `import { logPerformance } from '$lib/utils/logger';`
2. Update `src/lib/services/prefixService.ts`
   - Replace `console.debug` → `logger.debug`
   - Replace `console.warn` → `logger.warn`
3. Update remaining services
4. Run tests: `npm test`

### Step 5: Update Components
1. Update `src/lib/components/Toolbar/RunButton.svelte`
2. Update `src/lib/components/Results/ResultsPlaceholder.svelte`
3. Update `src/lib/components/Editor/SparqlEditor.svelte`
4. Update `src/lib/components/Results/RawView.svelte`
5. Update `src/lib/components/Tabs/QueryTabs.svelte`
6. Update `src/SparqlQueryUI.inner.svelte`
7. Run tests: `npm test`
8. Run Storybook: `npm run storybook` (verify components work)

### Step 6: Remove Old Debug Utility
```bash
# Check for remaining imports
grep -r "from.*debug" src/

# Remove the file
rm src/lib/utils/debug.ts
```

### Step 7: Update Documentation
1. Add logging section to `README.md`
2. Document log levels and runtime control
3. Add code examples

### Step 8: Quality Checks
```bash
npm run type-check          # TypeScript validation
npm run lint                # ESLint checks
npm test                    # All tests must pass
npm run build               # Production build (0 errors, 0 warnings)
npm run storybook           # Visual verification
npm run test:e2e:storybook  # E2E tests
```

### Step 9: Manual Testing

**Browser Console Testing**:
1. Open application in browser
2. Open DevTools console
3. Test commands:
   ```javascript
   __logger.setLevel('debug');  // Enable debug logs
   __logger.setLevel('warn');   // Reduce verbosity
   __logger.setLevel('silent'); // Disable all logs
   __logger.getLevel();         // Check current level
   ```
4. Reload page - verify log level persists
5. Clear localStorage - verify defaults work

**Production Build Testing**:
1. Build for production: `npm run build`
2. Serve production build: `npm run preview`
3. Open browser console
4. Verify only warnings and errors appear (no debug logs)
5. Set level to 'debug' - verify debug logs appear

## Acceptance Criteria

### Installation
- ✅ loglevel installed in package.json
- ✅ @types/loglevel installed as dev dependency
- ✅ MIT license verified
- ✅ No installation errors

### Logger Implementation
- ✅ `src/lib/utils/logger.ts` created
- ✅ Exports `logger`, `logPerformance`, `LogLevel`
- ✅ Default level: 'debug' (dev), 'warn' (prod)
- ✅ localStorage persistence works
- ✅ TypeScript types work correctly
- ✅ JSDoc comments for IDE support

### Migration Complete
- ✅ All 17 files updated to use logger
- ✅ Zero direct `console.*` calls in src/ (except standalone-wrapper.js)
- ✅ `debug.ts` removed
- ✅ All imports updated

### Documentation
- ✅ README.md includes logging section
- ✅ Log levels documented
- ✅ Runtime control documented
- ✅ Code examples provided

### Testing
- ✅ All unit tests pass (npm test)
- ✅ All integration tests pass
- ✅ All E2E tests pass (npm run test:e2e:storybook)
- ✅ Storybook renders without errors
- ✅ Manual browser testing passes

### Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm test                    # ✅ All tests pass
npm run test:e2e:storybook  # ✅ All E2E tests pass
npm run type-check          # ✅ No type errors
npm run lint                # ✅ No violations
```

### Production Behavior
- ✅ Dev mode: Shows debug logs by default
- ✅ Production: Shows only warnings/errors by default
- ✅ Runtime control works (window.__logger)
- ✅ Log level persists across page reloads
- ✅ No console noise in production

## Log Level Guidelines

### When to Use Each Level

**logger.debug()** - Development debugging
```typescript
logger.debug('Parsing query:', query);
logger.debug('Store state updated:', state);
logger.debug('CodeMirror initialized');
```

**logger.info()** - Informational events
```typescript
logger.info('Connected to endpoint:', endpoint);
logger.info('Query executed successfully');
logger.info('Settings loaded from localStorage');
```

**logger.warn()** - Unexpected but handled
```typescript
logger.warn('Falling back to JSON format');
logger.warn('Prefix discovery failed:', error);
logger.warn('Cannot remove the last tab');
```

**logger.error()** - Errors requiring attention
```typescript
logger.error('Failed to execute query:', error);
logger.error('Failed to parse response:', error);
logger.error('Failed to load settings:', error);
```

**logger.trace()** - Very detailed (rarely used)
```typescript
logger.trace('Entered function:', functionName);
logger.trace('Loop iteration:', index, item);
```

### Performance Logging

Use `logPerformance()` for multi-line metrics:

```typescript
import { logPerformance } from '$lib/utils/logger';

logPerformance('Query Performance', {
  'Total time': `${metrics.totalTime.toFixed(2)} ms`,
  'Network': `${metrics.networkTime.toFixed(2)} ms`,
  'Parse': `${metrics.parseTime.toFixed(2)} ms`,
  'Results': `${metrics.rowCount} rows × ${metrics.columnCount} cols`,
});
```

This only logs when level is 'debug' or lower.

## Dependencies

**Prerequisites:**
- None (can be done independently)

**Blocks:**
- No other tasks

**Related:**
- Task 74: Finalization (general code cleanup)

## Testing Requirements

### Unit Tests

**File**: `tests/unit/utils/logger.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logger, logPerformance, LogLevel } from '$lib/utils/logger';

describe('logger', () => {
  let originalLogLevel: string;

  beforeEach(() => {
    // Save original log level
    originalLogLevel = logger.getLevel().toString();
  });

  afterEach(() => {
    // Restore original log level
    logger.setLevel(originalLogLevel as any);
  });

  it('exports logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.debug).toBeInstanceOf(Function);
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
  });

  it('allows setting log level', () => {
    logger.setLevel(LogLevel.WARN);
    expect(logger.getLevel()).toBe(logger.levels.WARN);

    logger.setLevel(LogLevel.DEBUG);
    expect(logger.getLevel()).toBe(logger.levels.DEBUG);
  });

  it('exports LogLevel constants', () => {
    expect(LogLevel.DEBUG).toBe('debug');
    expect(LogLevel.INFO).toBe('info');
    expect(LogLevel.WARN).toBe('warn');
    expect(LogLevel.ERROR).toBe('error');
    expect(LogLevel.SILENT).toBe('silent');
  });

  it('logPerformance only logs in debug mode', () => {
    const consoleSpy = vi.spyOn(console, 'group');

    // Set to warn level - should not log
    logger.setLevel(LogLevel.WARN);
    logPerformance('Test', { metric: '123' });
    expect(consoleSpy).not.toHaveBeenCalled();

    // Set to debug level - should log
    logger.setLevel(LogLevel.DEBUG);
    logPerformance('Test', { metric: '123' });
    expect(consoleSpy).toHaveBeenCalledWith('🔬 Test');

    consoleSpy.mockRestore();
  });
});
```

### Integration Tests

No specific integration tests needed - logger is a utility that works independently.

### E2E Tests

No specific E2E tests needed - verify manually that logging works in browser.

## Troubleshooting

### Issue: Logger not found in context

**Symptom**: `Cannot find module '$lib/utils/logger'`

**Solution**:
1. Verify `src/lib/utils/logger.ts` exists
2. Check Vite alias configuration in `vite.config.ts`
3. Restart dev server: `npm run dev`

### Issue: TypeScript errors for loglevel

**Symptom**: `Could not find a declaration file for module 'loglevel'`

**Solution**:
```bash
npm install --save-dev @types/loglevel
```

### Issue: Logs not appearing in production

**Symptom**: No logs in production build

**Solution**: This is expected! Production default is 'warn' level.
- To see debug logs in production, run in console:
  ```javascript
  __logger.setLevel('debug');
  ```
- Or set `LOG_LEVEL` before initialization

### Issue: Tests failing with loglevel

**Symptom**: Vitest errors related to logging

**Solution**:
- loglevel works with Vitest out of the box
- If localStorage errors occur, they're caught and ignored
- Tests may need to mock localStorage if needed

### Issue: localStorage quota exceeded

**Symptom**: Error when persisting log level

**Solution**:
- Error is caught and ignored gracefully
- Log level won't persist but will still work for session

## Future Enhancements

### Structured Logging
Add context to log messages:
```typescript
logger.debug('Query executed', { endpoint, duration, rowCount });
```

### Remote Logging
Use loglevel plugin for production error reporting:
```bash
npm install loglevel-plugin-remote
```

### Log Filtering
Add component-specific log namespaces:
```typescript
const editorLogger = logger.getLogger('editor');
const storeLogger = logger.getLogger('store');
```

### Performance Tracing
Integrate with browser Performance API:
```typescript
performance.mark('query-start');
// ... query execution ...
performance.mark('query-end');
performance.measure('query-duration', 'query-start', 'query-end');
```

## References

- **loglevel**: https://github.com/pimterry/loglevel
- **loglevel documentation**: https://github.com/pimterry/loglevel#documentation
- **TypeScript types**: https://www.npmjs.com/package/@types/loglevel
- **Vite environment variables**: https://vitejs.dev/guide/env-and-mode.html
- **Console API**: https://developer.mozilla.org/en-US/docs/Web/API/Console

---

**Previous Task**: [Task 75: Verify State Isolation with Tests](./75-verify-state-isolation.md)

**Status**: 🆕 NEW - Ready for implementation
