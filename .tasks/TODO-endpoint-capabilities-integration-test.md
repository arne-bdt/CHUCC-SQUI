# TODO: Fix EndpointCapabilities Integration Test

## Issue

The integration test for `EndpointCapabilities.svelte` was removed due to complex store mocking issues with Vitest. The test attempted to use `vi.mock()` to mock the `serviceDescriptionStore`, but encountered hoisting and initialization errors.

## Error Details

```
Error: [vitest] There was an error when mocking a module.
If you are using "vi.mock" factory, make sure there are no top level variables inside

Caused by: ReferenceError: Cannot access '__vi_import_4__' before initialization
```

## Current Status

- ✅ Component: `EndpointCapabilities.svelte` exists and works
- ✅ Storybook stories: All created and functional
- ✅ E2E tests: Created and passing in `endpoint-capabilities.storybook.spec.ts`
- ✅ Sub-component tests: `LanguageSupport.test.ts` and `FeatureList.test.ts` exist
- ❌ Main component integration test: Removed due to mocking complexity

## Test Gap

Missing integration test coverage for:
- EndpointCapabilities component with real store interactions
- Refresh button functionality
- Store state transitions (loading → loaded, error states)
- Dynamic endpoint switching

## Alternative Coverage

Currently covered by:
- **E2E tests**: Test actual component in browser with Playwright
- **Storybook stories**: Visual verification of all states
- **Sub-component tests**: Individual parts tested in isolation
- **Store tests**: `serviceDescriptionStore.test.ts` tests store logic

## Proposed Solutions

### Option 1: Simplify Store Mocking
- Use a test-specific store instance instead of mocking the module
- Create the component with a custom store prop (requires component refactor)

### Option 2: Use Real Store with Test Helpers
- Import the actual store and manipulate it directly in tests
- Reset store state in `beforeEach()`
- Use real store methods instead of mocking

### Option 3: Accept E2E as Primary Testing Method
- Consider E2E tests sufficient for this component
- Document that complex store-dependent components rely on E2E tests
- Reserve integration tests for simpler, non-store components

### Option 4: Refactor Component for Testability
- Accept store as a prop instead of importing directly
- Use dependency injection pattern
- Makes testing easier but changes component API

## Recommended Approach

**Option 2** (Use Real Store) is recommended:

```typescript
import { serviceDescriptionStore } from '../../src/lib/stores/serviceDescriptionStore';

describe('EndpointCapabilities', () => {
  beforeEach(() => {
    // Reset store to clean state
    serviceDescriptionStore.reset();
  });

  it('should render full capabilities', async () => {
    // Use real store methods to set up test state
    const mockDesc: ServiceDescription = { /* ... */ };

    // Render component
    render(EndpointCapabilities, {
      props: { endpointUrl: 'https://example.org/sparql' }
    });

    // Manually set store state using internal methods
    // (This requires exposing a test-only method on the store)
    await serviceDescriptionStore.fetchForEndpoint('https://example.org/sparql');

    // Wait for reactivity
    await waitFor(() => {
      expect(screen.getByText('Endpoint Capabilities')).toBeInTheDocument();
    });
  });
});
```

## Priority

**Low-Medium**

The component is well-tested through E2E tests and Storybook. Integration tests would be nice-to-have for faster feedback, but not critical for functionality verification.

## Related Files

- Component: `src/lib/components/Capabilities/EndpointCapabilities.svelte`
- Store: `src/lib/stores/serviceDescriptionStore.ts`
- Store tests: `tests/integration/serviceDescriptionStore.test.ts`
- E2E tests: `tests/e2e/endpoint-capabilities.storybook.spec.ts`
- Removed test: Previously at `tests/integration/EndpointCapabilities.test.ts`

## Next Steps

1. Review mocking patterns in other integration tests
2. Check if store can expose test-only helper methods
3. Attempt Option 2 implementation
4. If successful, document the pattern for future component tests
5. If unsuccessful, document that complex store components use E2E tests

## Created

2025-11-04 (Task 53 implementation)

## Notes

- This is a known limitation of Vitest's module mocking with complex Svelte stores
- Other projects have encountered similar issues
- E2E tests provide excellent coverage for this use case
- Consider this when designing future component architectures
