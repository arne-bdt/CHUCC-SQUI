# Debugging SQUI

## Debug Logging

SQUI includes conditional debug logging that can be enabled/disabled without code changes.

### Enabling Debug Mode

**In the Browser (Development/Production):**

```javascript
// Open browser console and run:
debug.enable()
// Then reload the page
```

**In Tests (Vitest):**

```bash
# Set environment variable before running tests
DEBUG=true npm test

# Or using Vitest environment
VITEST_DEBUG=true npm test
```

**In Node.js:**

```bash
# Set environment variable
DEBUG=true npm run build
```

### Disabling Debug Mode

**In the Browser:**

```javascript
// Open browser console and run:
debug.disable()
// Then reload the page
```

**In Tests:**

```bash
# Simply run without the DEBUG variable
npm test
```

### What Gets Logged

When debug mode is enabled, you'll see detailed logs for:

- **[queryStore]** - Query state changes, subscriptions, and updates
  - NEW SUBSCRIPTION / UNSUBSCRIBE events
  - setText, setState operations
  - Subscriber counts

- **[SparqlEditor]** - Editor lifecycle and synchronization
  - onMount/onDestroy events
  - Store subscription events
  - Editor update operations
  - Guard flags for preventing infinite loops

### Accessing the Debug Utility

The debug utility is exported from `src/lib/utils/debug.ts`:

```typescript
import { debug } from '$lib/utils/debug';

// Use instead of console.log
debug.log('This only logs in debug mode');
debug.warn('This only warns in debug mode');
debug.info('This only shows in debug mode');

// Errors always log (even without debug mode)
debug.error('This always logs');

// Check if debug is enabled
if (debug.isEnabled()) {
  // Do expensive debug operations
}
```

### Why Use Conditional Logging?

1. **Clean test output** - No verbose logs cluttering test results
2. **Better performance** - Reduced logging overhead in production
3. **Easy debugging** - Enable when needed without code changes
4. **Production-safe** - Debug logs automatically disabled in production builds

### Example: Debugging Tab Switching

```javascript
// In browser console:
debug.enable()
location.reload()

// Now switch tabs and see detailed logs:
// [queryStore] setText ENTRY: { text: 'SELECT...', subscriberCount: 2 }
// [SparqlEditor] queryStore subscription fired: { newText: 'SELECT...' }
// etc.
```
