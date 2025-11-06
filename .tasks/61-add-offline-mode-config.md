# Task 61: Add Configuration to Disable External Prefix Lookup

**Status**: 📝 MEDIUM PRIORITY - Configuration Enhancement
**Priority**: MEDIUM
**Effort**: 1-2 hours

## Problem

CHUCC-SQUI currently makes external network requests to `prefix.cc` API for prefix suggestions (`src/lib/services/prefixService.ts:135`). This is the ONLY external request that is not related to user-configured SPARQL endpoints.

While this feature degrades gracefully on failure, it still attempts network requests which:

1. May fail in air-gapped environments (causing console warnings)
2. May violate security policies in isolated environments
3. May cause timeouts and delays when prefix.cc is unavailable
4. Reduces predictability in isolated deployments

## Requirements

### Must Have
- ✅ Configuration option to disable prefix.cc API calls
- ✅ Graceful degradation when disabled
- ✅ No external requests when disabled
- ✅ Backward compatible (prefix lookup enabled by default)
- ✅ Clear, specific naming (not "offline mode")

### Should Have
- ✅ Document offline mode in README
- ✅ Add offline mode to standalone.html URL parameters
- ✅ Provide clear feedback when features are disabled

## Solution Design

### Naming Considerations

**AVOID**: `offlineMode`, `airGappedMode`, `isolatedMode`
- Too vague - users might think it disables SPARQL endpoint queries
- Doesn't describe what it actually does
- Could be confusing for web component users

**RECOMMENDED**: `disableExternalPrefixLookup` or `enablePrefixLookup`
- Specific and clear about what it controls
- Self-documenting
- No ambiguity about SPARQL endpoint queries

**Selected**: `enablePrefixLookup` (default: `true`)
- Positive framing (enable vs disable)
- Clear that it only affects prefix lookup
- Default `true` maintains backward compatibility

### Configuration Schema

Add `enablePrefixLookup` to `PrefixConfig` type:

```typescript
// src/lib/types/config.ts
export interface PrefixConfig {
  /**
   * Default prefix mappings
   */
  default?: Record<string, string>;

  /**
   * Custom prefix discovery hook
   */
  discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;

  /**
   * Enable external prefix lookup via prefix.cc API
   * When disabled, only local/configured prefixes are available
   * @default true
   */
  enablePrefixLookup?: boolean;
}
```

### PrefixService Updates

Update `prefixService.ts` to respect the configuration:

```typescript
export class PrefixService {
  private customPrefixes: Record<string, string> = {};
  private discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;
  private enablePrefixLookup: boolean = true; // NEW

  constructor(config?: PrefixConfig) { // Updated
    if (config?.default) {
      this.customPrefixes = { ...config.default };
    }
    this.discoveryHook = config?.discoveryHook;
    this.enablePrefixLookup = config?.enablePrefixLookup ?? true; // NEW
  }

  async searchPrefixes(query: string): Promise<PrefixSuggestion[]> {
    // NEW: Skip API call if external prefix lookup is disabled
    if (!this.enablePrefixLookup) {
      console.debug('External prefix lookup disabled (prefix.cc API call skipped)');
      return [];
    }

    try {
      const response = await fetch(`https://prefix.cc/${encodeURIComponent(query)}.file.json`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      // ... rest of implementation
    } catch (error) {
      console.warn('Failed to fetch prefix suggestions:', error);
      return [];
    }
  }
}
```

## Implementation Plan

### 1. Update Type Definitions

File: `src/lib/types/config.ts`

```typescript
export interface PrefixConfig {
  default?: Record<string, string>;
  discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;
  enablePrefixLookup?: boolean; // NEW - defaults to true
}

// No changes to SQUIConfig needed - configuration is part of PrefixConfig
export interface SQUIConfig {
  endpoint?: EndpointConfig;
  prefixes?: PrefixConfig; // Already includes enablePrefixLookup
  templates?: TemplateConfig;
  theme?: ThemeConfig;
  features?: FeaturesConfig;
  limits?: LimitsConfig;
  disablePersistence?: boolean;
  instanceId?: string;
}
```

### 2. Update PrefixService

File: `src/lib/services/prefixService.ts`

- Add `enablePrefixLookup` property (default: `true`)
- Update constructor to read from `PrefixConfig`
- Modify `searchPrefixes()` to skip API call when disabled
- Add debug logging when feature is disabled

### 3. Pass Configuration Through Component Tree

File: `src/SparqlQueryUI.svelte`

```typescript
<script lang="ts">
  import { prefixService } from './lib/services/prefixService';

  let {
    endpoint,
    prefixes, // Already includes enablePrefixLookup
    // ... other props
  }: SQUIConfig = $props();

  // Initialize prefix service with configuration
  $effect(() => {
    if (prefixes) {
      const service = new PrefixService(prefixes);
      // Use service...
    }
  });
</script>
```

**Note**: No changes to SQUIConfig needed - the configuration naturally lives within the `prefixes` object.

### 4. Update Standalone HTML

File: `standalone.html`

```javascript
// Parse disableExternalPrefixLookup parameter (for air-gapped environments)
const disableExternalPrefixLookup = params.get('disableExternalPrefixLookup');
if (disableExternalPrefixLookup === 'true') {
  config.prefixes = config.prefixes || {};
  config.prefixes.enablePrefixLookup = false;
}
```

Update welcome message:

```javascript
console.log('%cURL Parameters:', 'font-size: 14px; font-weight: bold');
// ... existing params
console.log('  ?disableExternalPrefixLookup=true - Disable prefix.cc API (air-gapped mode)');
```

### 5. Update Documentation

File: `README.md`

```markdown
## Air-Gapped / Isolated Environments

SQUI can operate in completely isolated environments without access to external APIs:

### Configuration

To disable external prefix lookup (prefix.cc API):

```typescript
<SparqlQueryUI
  prefixes={{
    default: { /* your prefixes */ },
    enablePrefixLookup: false  // Disable prefix.cc API
  }}
  {/* other props */}
/>
```

### URL Parameter (Standalone)

```
index.html?disableExternalPrefixLookup=true
```

### What This Controls

**Disabled when `enablePrefixLookup: false`:**
- Prefix suggestions from prefix.cc API (the ONLY external non-endpoint request)

**Always Works (unaffected by this setting):**
- All core SPARQL querying functionality
- Local/configured prefix management
- All UI components
- SPARQL endpoint queries (to your configured endpoints)
- All data visualization features

**Note:** This setting ONLY affects the prefix.cc API lookup feature.
Your SPARQL endpoint queries always work normally - those are user-configured, not external dependencies.
```

## Testing Plan

### Unit Tests

File: `tests/unit/prefixService.test.ts`

```typescript
describe('PrefixService external prefix lookup', () => {
  test('should skip API calls when enablePrefixLookup is false', async () => {
    const service = new PrefixService({ enablePrefixLookup: false });

    // Mock fetch to ensure it's not called
    const fetchSpy = vi.spyOn(global, 'fetch');

    const results = await service.searchPrefixes('foaf');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  test('should make API calls when enablePrefixLookup is true', async () => {
    const service = new PrefixService({ enablePrefixLookup: true });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ foaf: 'http://xmlns.com/foaf/0.1/' })
    });

    const results = await service.searchPrefixes('foaf');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('prefix.cc'),
      expect.any(Object)
    );
  });

  test('should default to enabled (true) when not specified', async () => {
    const service = new PrefixService();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    await service.searchPrefixes('test');

    expect(global.fetch).toHaveBeenCalled();
  });

  test('should work with other prefix config options', async () => {
    const service = new PrefixService({
      default: { custom: 'http://example.org/' },
      enablePrefixLookup: false
    });

    const prefixes = service.getAllPrefixes();
    expect(prefixes.custom).toBe('http://example.org/');

    const fetchSpy = vi.spyOn(global, 'fetch');
    await service.searchPrefixes('test');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

Test offline mode flag propagation through component tree.

### Manual Testing

1. Start standalone with disabled prefix lookup:
   ```
   ?disableExternalPrefixLookup=true
   ```

2. Open browser console and Network tab

3. Try prefix search/autocomplete in query editor

4. Verify:
   - No network requests to prefix.cc in Network tab
   - Debug message: "External prefix lookup disabled (prefix.cc API call skipped)"
   - No console errors
   - UI still functional
   - Configured/local prefixes still work

5. Test without the parameter (default behavior):
   ```
   (no query parameter)
   ```

6. Verify:
   - prefix.cc API calls appear in Network tab
   - Prefix suggestions work
   - Everything functions normally

## Acceptance Criteria

- [ ] `enablePrefixLookup` option added to PrefixConfig type
- [ ] PrefixService respects enablePrefixLookup setting
- [ ] No API calls made when enablePrefixLookup is false
- [ ] Debug logging added with clear message
- [ ] Standalone HTML supports `?disableExternalPrefixLookup=true` parameter
- [ ] README documents air-gapped configuration
- [ ] Unit tests verify prefix lookup can be disabled
- [ ] Manual testing confirms no external requests when disabled
- [ ] Backward compatible (defaults to enabled/true)
- [ ] Configuration is properly nested in PrefixConfig (not top-level)

## Build & Tests Status

```bash
npm test                    # All tests must pass
npm run type-check          # No type errors
npm run build               # Must succeed
npm run build:standalone    # Must succeed
```

## Files to Modify

- `src/lib/types/config.ts` - Add enablePrefixLookup to PrefixConfig
- `src/lib/services/prefixService.ts` - Add prefix lookup toggle support
- `standalone.html` - Add disableExternalPrefixLookup URL parameter
- `README.md` - Document air-gapped configuration
- `tests/unit/prefixService.test.ts` - Add tests for prefix lookup toggle

**Note:** `src/SparqlQueryUI.svelte` does NOT need changes - configuration is already passed through the `prefixes` prop.

## Dependencies

- No new dependencies required

## Related Tasks

- Task 60: Remove CDN Dependencies (prerequisite)
- Task 62: Add Prefix.cc API Configuration (related)

## Notes

- This setting ONLY affects the prefix.cc API lookup (the sole external non-endpoint request)
- SPARQL endpoint queries are NOT affected (users configure their own endpoints)
- This is opt-in (must explicitly disable) to maintain backward compatibility
- Default behavior (enabled) preserves existing functionality
- The naming is intentionally specific to avoid confusion about what "offline" means for a web component
- Consider adding visual indicator in UI when external lookup is disabled (future enhancement)

## Definition of Done

- [ ] Code changes completed
- [ ] Type definitions updated
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No regressions in online mode
- [ ] Offline mode verified with network disabled
- [ ] Build succeeds
- [ ] All tests pass
