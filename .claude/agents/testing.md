# Testing Agent

Specialized agent for creating and managing tests for the SPARQL Query UI project.

## Testing Stack

- Unit/Integration: Vitest or Jest
- E2E: Playwright or Cypress
- Testing Library: @testing-library/svelte
- Coverage Target: >80%

## Test Types

### Unit Tests
Test pure functions and isolated logic. Focus on services, utils, and stores.

### Component Tests
Test Svelte components with @testing-library/svelte.

### Integration Tests
Test workflows across multiple components and services.

### E2E Tests
Test full user journeys with Playwright.

## Example Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { parseSparqlJSON } from './parser';

describe('parseSparqlJSON', () => {
  it('parses SELECT results', () => {
    const json = {
      head: { vars: ['s'] },
      results: { bindings: [{ s: { type: 'uri', value: 'http://ex.org/r' } }] }
    };
    const result = parseSparqlJSON(json);
    expect(result.columns).toEqual(['s']);
    expect(result.rows).toHaveLength(1);
  });
});
```

## Mocking Fetch

```typescript
import { vi } from 'vitest';
global.fetch = vi.fn();

const mockResponse = {
  ok: true,
  json: async () => ({ head: { vars: [] }, results: { bindings: [] } })
};
(global.fetch as any).mockResolvedValue(mockResponse);
```

## Best Practices

1. Arrange-Act-Assert structure
2. Test behavior not implementation
3. Mock external dependencies
4. Clear descriptive test names
5. Test edge cases and errors
6. Keep tests fast (<100ms for unit)

## References

- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/
- Playwright: https://playwright.dev/
