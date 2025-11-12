# Task 73: Update Storybook Configuration for State Isolation

## Overview

Update Storybook configuration to wrap all stories in `StoreProvider` component, ensuring each story gets isolated store instances. This fixes the state leakage issue where one story's state affects other stories.

## Motivation

### Current Problem: State Leakage in Storybook

**Symptom:** RunButton appears disabled in all stories in the story overview panel.

**Root Cause:**
```typescript
// RunButton.stories.ts - "Disabled" story
export const Disabled: Story = {
  decorators: [(story: any) => {
    queryStore.setText('');  // ❌ Empties GLOBAL query for ALL stories!
    defaultEndpoint.set('');
    return story();
  }],
};
```

When Storybook renders the overview (all stories at once), the `Disabled` story's decorator clears the global stores, which affects **every other story** on the page.

**Current Workaround:** `withStoreInit` decorator in `.storybook/preview.ts` tries to reset stores, but it doesn't prevent cross-story contamination.

### Solution: StoreProvider Decorator

Wrap each story in a fresh `StoreProvider` instance:

```typescript
const withStoreProvider: Decorator = (story) => {
  return {
    Component: StoreProvider,
    slot: story(),
  };
};
```

Now each story gets **independent store instances**, preventing state leakage.

## Requirements

### 1. Update .storybook/preview.ts

**Current (lines 169-181):**
```typescript
const withStoreInit: Decorator = (story, context) => {
  // Reset stores to initial state before each story
  if (typeof window !== 'undefined') {
    try {
      resultsStore.reset();
      queryStore.reset();
    } catch (err) {
      console.warn('Failed to reset stores:', err);
    }
  }

  return story();
};
```

**Replace with StoreProvider decorator:**
```typescript
import StoreProvider from '../src/lib/components/StoreProvider.svelte';
import type { Decorator } from '@storybook/svelte';

/**
 * Store Provider decorator - ensures each story gets isolated store instances
 *
 * This prevents state leakage between stories in the Storybook overview.
 * Each story receives fresh store instances via Svelte context.
 *
 * CRITICAL: Must come BEFORE story-specific decorators in the decorator chain
 */
const withStoreProvider: Decorator = (story, context) => {
  // Get initial values from story parameters if provided
  const initialEndpoint = context.parameters?.initialEndpoint || '';
  const initialQuery = context.parameters?.initialQuery || '';

  return {
    Component: StoreProvider,
    props: {
      initialEndpoint,
      initialQuery,
      children: story(),
    },
  };
};
```

### 2. Update Decorator Order

**IMPORTANT**: Decorator execution order matters!

```typescript
// .storybook/preview.ts

const preview: Preview = {
  // ...
  // Decorators execute in REVERSE order: last → first
  decorators: [
    withGraphCompletionMocks,  // 3. Runs last (sets up graph mocks)
    withStoreProvider,         // 2. Runs second (provides fresh stores)
    withTheme,                 // 1. Runs first (applies theme)
  ],
};
```

**Execution Flow:**
1. `withTheme` applies Carbon theme class
2. `withStoreProvider` creates fresh stores and wraps story
3. `withGraphCompletionMocks` sets up mock service descriptions
4. Story component renders with isolated stores

### 3. Update RunButton.stories.ts

Remove store manipulation from decorators (no longer needed):

**Before:**
```typescript
export const Default: Story = {
  args: { disabled: false },
  decorators: [
    (story: any) => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o } LIMIT 10');  // ❌ Mutates global
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);
      return story();
    },
  ],
};
```

**After:**
```typescript
export const Default: Story = {
  args: { disabled: false },
  parameters: {
    initialQuery: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
    initialEndpoint: 'https://dbpedia.org/sparql',
  },
};
```

**Benefits:**
- ✅ No global state mutation
- ✅ Declarative (parameters instead of imperative code)
- ✅ Automatically isolated (StoreProvider handles it)
- ✅ Cleaner, more maintainable

### 4. Update Other Story Files

Apply the same pattern to all stories that manipulate stores:

#### SparqlEditor.stories.ts
```typescript
// Before: Decorator mutates global stores
// After: Use parameters and StoreProvider will handle initialization

export const WithSimpleQuery: Story = {
  args: {
    initialValue: 'SELECT * WHERE { ?s ?p ?o }',
  },
  // initialValue prop is passed to component
  // No need to manipulate stores
};
```

#### QueryTabs.stories.ts
```typescript
// Already uses context pattern for tabStore
// Update to ensure compatibility with StoreProvider

export const Default: Story = {
  args: {} as any,
  decorators: [
    (story) => {
      // Reset tab store before each story
      tabStore.reset();
      localStorage.clear();
      return story();
    },
  ],
};
```

### 5. Create Storybook Test for Isolation

Create a story that **verifies** state isolation:

**File**: `src/lib/components/StoreProvider.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/svelte';
import StoreProvider from './StoreProvider.svelte';
import RunButton from '../Toolbar/RunButton.svelte';

const meta = {
  title: 'Internal/StoreProvider',
  component: StoreProvider,
  tags: ['autodocs'],
} satisfies Meta<StoreProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demonstrate state isolation between multiple StoreProvider instances
 */
export const StateIsolation: Story = {
  render: () => ({
    Component: Container,
  }),
};

// Container component to show multiple isolated instances
function Container() {
  return `
    <div style="display: flex; gap: 2rem;">
      <div style="flex: 1; border: 1px solid #ccc; padding: 1rem;">
        <h3>Instance 1 (Has Query)</h3>
        <StoreProvider
          initialQuery="SELECT * WHERE { ?s ?p ?o }"
          initialEndpoint="http://example1.org/sparql"
        >
          <RunButton />
        </StoreProvider>
      </div>

      <div style="flex: 1; border: 1px solid #ccc; padding: 1rem;">
        <h3>Instance 2 (Empty)</h3>
        <StoreProvider
          initialQuery=""
          initialEndpoint=""
        >
          <RunButton />
        </StoreProvider>
      </div>
    </div>
  `;
}
```

**Expected Result:**
- Instance 1: RunButton is **enabled** (has query and endpoint)
- Instance 2: RunButton is **disabled** (empty query and endpoint)
- They don't affect each other

## Implementation Steps

### Step 1: Update .storybook/preview.ts
1. Import `StoreProvider` component
2. Replace `withStoreInit` with `withStoreProvider` decorator
3. Update decorator order (important!)
4. Remove direct store imports if no longer needed

### Step 2: Update RunButton.stories.ts
1. Remove decorator functions that mutate stores
2. Replace with `parameters` for initial values
3. Test each story individually
4. Test all stories together (overview mode)

### Step 3: Update SparqlEditor.stories.ts
1. Review existing decorators
2. Replace store manipulation with parameters
3. Verify editor initialization still works

### Step 4: Update Other Story Files
1. Search for `queryStore`, `resultsStore`, `defaultEndpoint` in `.stories.ts` files
2. Replace decorator mutations with parameters
3. Test each file

### Step 5: Create StoreProvider.stories.ts
1. Create demonstration story
2. Show multiple isolated instances
3. Verify no state leakage

### Step 6: E2E Testing
1. Start Storybook: `npm run storybook`
2. Navigate to RunButton stories
3. Verify all stories show correct state in overview
4. Click individual stories to verify details
5. Run E2E tests: `npm run test:e2e:storybook`

## Acceptance Criteria

### Functional Requirements
- ✅ Each Storybook story has isolated store state
- ✅ Story overview shows correct state for all stories
- ✅ No state leakage between stories
- ✅ RunButton stories all show correct enabled/disabled state
- ✅ Graph completion stories still work with mock data

### Code Quality
- ✅ Clean decorator implementation
- ✅ No direct store manipulation in story decorators
- ✅ Declarative story configuration via parameters
- ✅ Consistent pattern across all story files

### Testing
- ✅ All Storybook stories render correctly
- ✅ Story overview (grid view) shows correct state
- ✅ Individual stories work in isolation
- ✅ E2E tests pass: `npm run test:e2e:storybook`
- ✅ Manual verification: `npm run storybook`

### Build & Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm run build-storybook     # ✅ Storybook builds successfully
npm run test:e2e:storybook  # ✅ All E2E tests pass
```

## Visual Verification Checklist

Open Storybook and verify these stories:

### RunButton Stories
- [ ] Default: Button is **enabled** (green)
- [ ] Disabled: Button is **disabled** (grayed out)
- [ ] Loading: Shows loading indicator
- [ ] NoQuery: Button is **disabled**
- [ ] NoEndpoint: Button is **disabled**
- [ ] ExplicitlyDisabled: Button is **disabled**

**CRITICAL**: In the story overview (grid view), each story should show its OWN state, not a shared state.

### SparqlEditor Stories
- [ ] Default: Empty editor
- [ ] WithSimpleQuery: Shows "SELECT * WHERE { ?s ?p ?o }"
- [ ] WithPrefixQuery: Shows PREFIX declarations
- [ ] GraphNameCompletionFROM: Shows completion suggestions

## Dependencies

**Prerequisite Tasks:**
- Task 70: Create StoreProvider Component
- Task 71: Update Store Factory Functions
- Task 72: Refactor Components to Use Context

**Required for:**
- Task 75: Verify State Isolation with Tests

## Technical Notes

### Storybook Decorator Order

Decorators are applied in **reverse order**:

```typescript
decorators: [A, B, C]
// Execution: C(B(A(story)))
```

This is why `withStoreProvider` should come BEFORE story-specific decorators.

### Parameters vs Decorators

**Parameters** (preferred):
```typescript
parameters: {
  initialQuery: 'SELECT ...',
}
```

**Decorators** (when you need imperative logic):
```typescript
decorators: [(story) => {
  // Setup that can't be expressed in parameters
  return story();
}]
```

Use parameters when possible for clarity.

### Backward Compatibility

Components still work without `StoreProvider` because `storeContext.ts` provides fallback to global stores. This means:

- Storybook stories: Use isolated stores (via StoreProvider)
- Main app: Uses global stores (no StoreProvider yet)
- Tests: Can use either pattern

## Future Enhancements

- **Story Parameters Validation**: Type-check story parameters
- **DevTools Integration**: Show which stores a story uses
- **Performance Monitoring**: Track store creation in Storybook
- **Template Stories**: Create reusable story templates with StoreProvider

## References

- **Storybook Decorators**: https://storybook.js.org/docs/writing-stories/decorators
- **Storybook Parameters**: https://storybook.js.org/docs/writing-stories/parameters
- **Svelte Context**: https://svelte.dev/docs/svelte/context

---

**Previous Task**: [Task 72: Refactor Components to Use Context](./72-refactor-components-context.md)
**Next Task**: [Task 74: Add Backward Compatibility Fallbacks](./74-backward-compatibility.md)
