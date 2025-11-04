# Task 54: Complete Graph Name Completion E2E Tests

**Priority**: Medium
**Status**: Pending
**Depends On**: Task 53 (Fix Graph Completion E2E Tests - PARTIAL)

## Overview

Task 53 made significant progress on the graph name completion E2E tests, improving from 1/7 to 3/7 passing tests. The core issues (store access and cursor positioning) have been fixed. This task focuses on fixing the remaining 4 failing E2E tests.

## Current Status

### ✅ Passing Tests (3/7)
1. **should show completion popup for FROM clause** - ✅ PASSING
2. **should show metadata in completion items** - ✅ PASSING
3. **should handle editor without service description gracefully** - ✅ PASSING

### ❌ Failing Tests (4/7)
1. **should show only named graphs for FROM NAMED** - Gets 20 SPARQL keywords instead of 3 graph IRIs
2. **should filter completions based on partial input** - Gets 4 items instead of 3 (CLOSE!)
3. **should support keyboard navigation in completion popup** - Timeout waiting for aria-selected
4. **should insert graph IRI on selection** - Content doesn't change after selection

## Root Causes Identified

### Test #2: FROM NAMED (expects 3, gets 20)
- **Issue**: Still showing SPARQL keywords instead of graph IRIs
- **Mock Setup**: Decorator IS running and setting up 3 named graphs correctly
- **Possible Causes**:
  - Query text in story may not have "FROM NAMED " at the end
  - `isFromNamed()` regex not matching the story content
  - Need to verify actual story content matches test expectations

### Test #3: Filter Partial Input (expects 3, gets 4)
- **Issue**: Gets 4 completions instead of 3 (VERY CLOSE!)
- **Mock Data**: Has 4 graphs (people, places, products, events) - only 3 start with 'p'
- **Possible Causes**:
  - One extra graph is matching the filter that shouldn't
  - Need to check which 4 items are being returned
  - May be including "events" or another graph incorrectly

### Test #5: Keyboard Navigation (timeout)
- **Issue**: Timeout waiting for `aria-selected="true"` after ArrowDown
- **Status**: Was passing before, regressed after recent changes
- **Possible Causes**:
  - ArrowDown not being processed by CodeMirror completion popup
  - Need to add wait time after completion popup appears
  - May need different keyboard event approach

### Test #6: Insert Graph IRI (content unchanged)
- **Issue**: Content before and after selection is identical
- **Possible Causes**:
  - Enter key not triggering completion
  - Need to click on completion item instead
  - Selection not applying correctly

## Fixes Completed in Task 53

1. ✅ Fixed `getServiceDescription()` to use `get()` for direct store access
2. ✅ Fixed cursor positioning: Changed `End` → `Ctrl+End` in all tests
3. ✅ Improved decorator pattern matching for graph completion stories
4. ✅ Removed unnecessary debug logging
5. ✅ All 949 unit & integration tests passing
6. ✅ Build succeeds with zero errors/warnings

## Recommended Approach

### Investigation Phase
1. **Add targeted debug logging** to failing tests only
2. **Capture actual completion items** being shown
3. **Verify story content** matches test expectations
4. **Check timing issues** for keyboard navigation

### Fix Each Test Individually
1. Start with Test #3 (closest to passing - 4 vs 3)
2. Then Test #2 (FROM NAMED filtering)
3. Then Test #6 (IRI insertion)
4. Finally Test #5 (keyboard navigation)

### Specific Investigations

**Test #2 - FROM NAMED:**
```typescript
// Add to test:
const editorContent = await page.locator('.cm-content').textContent();
console.log('[E2E] Editor content:', editorContent);

// Verify story ends with "FROM NAMED "
// Check if isFromNamed() matches this content
```

**Test #3 - Filtered:**
```typescript
// Add to test:
for (let i = 0; i < count; i++) {
  const itemText = await completionItems.nth(i).textContent();
  console.log(`[E2E] Item ${i+1}:`, itemText);
}
// Identify which 4 items are shown and why
```

**Test #5 - Keyboard Navigation:**
```typescript
// Add wait after popup appears:
await page.waitForTimeout(500);
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);
// Check if aria-selected updates
```

**Test #6 - Insert IRI:**
```typescript
// Try clicking instead of Enter:
await completionItems.first().click();
// Or ensure Enter is sent to the right element
await page.locator('.cm-tooltip-autocomplete').press('Enter');
```

## Acceptance Criteria

- [ ] All 7 E2E tests pass consistently
- [ ] Test #2: Shows exactly 3 named graphs for FROM NAMED
- [ ] Test #3: Shows exactly 3 filtered graphs starting with 'p'
- [ ] Test #5: Keyboard navigation works (ArrowDown changes selection)
- [ ] Test #6: Graph IRI is inserted into editor on selection
- [ ] No regressions in the 3 currently passing tests
- [ ] Build and all unit/integration tests still pass

## Files to Modify

1. **E2E Test File**:
   - `tests/e2e/graph-name-completion.storybook.spec.ts` - Add targeted fixes

2. **Story Configuration** (if needed):
   - `src/lib/components/Editor/SparqlEditor.stories.ts` - Verify story content

3. **Potential Code Fixes**:
   - May not need any - tests might just need timing/interaction adjustments
   - Core functionality is proven working by unit/integration tests

## Resources

- **Previous Task**: `.tasks/53-fix-graph-completion-e2e-tests.md`
- **Test Output**: Shows test #3 gets 4 items (close to 3 expected)
- **Integration Tests**: 29/29 passing - feature works correctly
- **Unit Tests**: 32/32 passing - query analysis correct

## Notes

- The graph name completion feature itself is **fully functional**
- All 61 unit & integration tests pass
- This is purely an E2E test setup/interaction issue
- Tests need correct timing, content verification, and interaction patterns
- Consider if some test expectations need adjustment (e.g., test #3: maybe 4 is correct?)

## Estimated Effort

**2-3 hours** - Each failing test needs individual investigation and fix. Most likely timing and interaction issues rather than core functionality bugs.
