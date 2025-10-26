# Storybook Browser Freeze - Bugfix Documentation

## Issue
Storybook browser tab became completely unresponsive (frozen):
- Could not use mouse or keyboard in Storybook tab
- F12 dev tools would not open
- Navigation visible but preview iframe empty
- Required force-closing the browser tab

## Root Cause

### Bug #1: Infinite Loop in SparqlEditor.svelte (CRITICAL)

**Location:** `src/lib/components/Editor/SparqlEditor.svelte:153`

**The Bug:**
```typescript
// BEFORE (BROKEN):
$effect(() => {
  const theme = $themeStore;  // ❌ Gets entire object { current: 'white', previous: null }
  if (theme !== currentTheme) {  // ❌ Object !== String is ALWAYS true
    currentTheme = theme;  // ❌ Sets string var to object
    if (editorView) {
      editorView.dispatch({
        effects: themeCompartment.reconfigure(createCarbonTheme(currentTheme)),
      });
    }
  }
});
```

**Why It Caused Infinite Loop:**
1. `$themeStore` returns the entire `ThemeState` object: `{ current: 'white', previous: null }`
2. `theme` (object) compared to `currentTheme` ('white' string) is ALWAYS !== (always true)
3. `currentTheme` gets set to the object (type error)
4. `$effect` triggers again because themeStore changed
5. Loop repeats infinitely → **Browser freeze**

**The Fix:**
```typescript
// AFTER (FIXED):
$effect(() => {
  const theme = $themeStore.current;  // ✅ Gets string 'white'
  if (theme !== currentTheme) {  // ✅ String comparison works correctly
    currentTheme = theme;  // ✅ String assigned to string
    if (editorView) {
      editorView.dispatch({
        effects: themeCompartment.reconfigure(createCarbonTheme(currentTheme)),
      });
    }
  }
});
```

### Bug #2: Incompatible Decorator in Storybook Preview

**Location:** `.storybook/preview.ts:58-82`

**The Bug:**
The decorator tried to wrap Svelte 5 components using an old pattern that doesn't work with runes (`$props()`, `$state()`, etc.):

```typescript
// BEFORE (INCOMPATIBLE):
decorators: [
  (Story, context) => {
    return {
      Component: Story,
      props: { ...context.args },  // ❌ Doesn't work with $props()
      context: { ...context },
    };
  },
],
```

**The Fix:**
```typescript
// AFTER (SVELTE 5 COMPATIBLE):
decorators: [],  // ✅ Removed incompatible decorator
```

## Testing the Fix

### Step 1: Restart Storybook
```bash
# Kill any existing Storybook process (Ctrl+C in terminal)
npm run storybook
```

### Step 2: Open in Browser
Navigate to: http://localhost:6006/

### Step 3: Verify Stories Render

#### **SparqlEditor Stories** (`Components/Editor/SparqlEditor`)

Click on "Default" - You should see:
- ✅ CodeMirror editor with line numbers
- ✅ Gray gutter on left with line numbers 1, 2, 3...
- ✅ White editor area
- ✅ Blinking cursor on line 1
- ✅ Browser tab remains responsive
- ✅ F12 dev tools work

Click on "WithSimpleQuery" - You should see:
```sparql
SELECT * WHERE { ?s ?p ?o }
```
With syntax highlighting:
- **SELECT**, **WHERE** in blue
- **?s ?p ?o** in dark blue
- **{ }** in black

#### **SparqlQueryUI Stories** (`SparqlQueryUI`)

Click on "Default" - You should see:
- ✅ Top pane: Empty editor
- ✅ Middle: Gray draggable divider
- ✅ Bottom pane: "Results will appear here..."
- ✅ Can drag divider up/down

#### **Toolbar Stories** (`Components/Toolbar`)

Click on "Default" - You should see:
- ✅ Gray toolbar container

### Step 4: Test Theme Switching

1. In any story, click the background color picker (top toolbar)
2. Select different backgrounds (white, g10, g90, g100)
3. Verify:
   - ✅ Editor theme changes correctly
   - ✅ No browser freeze
   - ✅ Syntax highlighting adapts to theme

### Step 5: Test Autocompletion (if applicable)

In stories with editable editors:
1. Type "SEL" in the editor
2. Verify:
   - ✅ Completion popup appears with "SELECT"
   - ✅ No freeze or lag

## Expected Console Output

When Storybook starts, you should see:
```
✓ Storybook 9.1.15 for sveltekit started
✓ Local: http://localhost:6006/
```

Expected warnings (safe to ignore):
- DEP0190 deprecation warning (npm internal)
- Slot deprecation warnings (will be fixed in Phase 2)
- A11y warnings for SplitPane (documented as known issues)

## What Should NOT Happen

❌ Browser tab freezing
❌ Empty preview iframe
❌ F12 dev tools not opening
❌ Infinite console errors
❌ High CPU usage that doesn't decrease

## If Problems Persist

### Check Browser Console (F12 → Console)
Look for errors like:
- "Maximum call stack size exceeded" → Still has infinite loop
- "Cannot read properties of undefined" → Store initialization issue
- "$props is not defined" → Svelte 5 compatibility issue

### Force Refresh
After restarting Storybook:
1. Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear browser cache for localhost:6006

### Verify Git Changes
```bash
git log --oneline -1
# Should show: fix: resolve infinite loop causing Storybook browser freeze

git diff HEAD~1 src/lib/components/Editor/SparqlEditor.svelte
# Should show: - const theme = $themeStore;
#             + const theme = $themeStore.current;
```

## Files Changed

1. **src/lib/components/Editor/SparqlEditor.svelte**
   - Line 153: Fixed theme store access

2. **.storybook/preview.ts**
   - Removed incompatible decorator (lines 58-82)

## Commit

```
commit 30bcd4b
fix: resolve infinite loop causing Storybook browser freeze
```

## Prevention

To prevent similar issues in the future:

1. **Always access store properties explicitly:**
   ```typescript
   ✅ const value = $myStore.property;
   ❌ const value = $myStore;  // Gets entire object
   ```

2. **Test $effect blocks for infinite loops:**
   - Add `console.log()` in effects during development
   - Verify comparison logic works as expected
   - Ensure state updates don't re-trigger the same effect

3. **Use Svelte 5 compatible patterns in Storybook:**
   - Avoid old decorator patterns
   - Let components handle their own state
   - Use stores for theme management

4. **Test Storybook after major component changes:**
   - Verify browser stays responsive
   - Check dev tools work (F12)
   - Monitor CPU usage

## Related Documentation

- Svelte 5 Runes: https://svelte.dev/docs/svelte/$effect
- Svelte Stores: https://svelte.dev/docs/svelte-store
- Storybook Svelte: https://storybook.js.org/docs/svelte/get-started/

## Additional Fixes (Visibility Issues)

### Bug #3: SparqlEditor Showing Empty Gray Bar

**Location:** `src/lib/components/Editor/SparqlEditor.stories.ts`

**The Bug:**
SparqlEditor uses `height: 100%` in CSS, which requires the parent container to have a defined height. Storybook's default preview canvas has no height set, so 100% of nothing = invisible editor.

**The Fix:**
Added `layout: 'fullscreen'` parameter to the meta configuration:
```typescript
parameters: {
  layout: 'fullscreen',  // ✅ Makes editor fill entire viewport
  // ... other params
}
```

**Result:** Editor now fills the viewport and displays with line numbers, syntax highlighting, and cursor.

### Bug #4: Toolbar Showing Empty Gray Bar

**Location:** `src/lib/components/Toolbar/Toolbar.stories.ts`

**The Bug:**
Toolbar component uses Svelte slots for content, but the stories didn't provide any slot content. This resulted in an empty container (just the gray background).

**The Fix:**
Added `render` functions with slot content for all stories:
```typescript
export const Default: Story = {
  args: {},
  render: () => ({
    Component: Toolbar,
    props: {},
    slots: {
      default: '<span style="...">Toolbar (empty - add content via slots)</span>',
    },
  }),
};

export const WithButtons: Story = {
  args: {},
  render: () => ({
    Component: Toolbar,
    props: {},
    slots: {
      default: `
        <div style="display: flex; gap: 1rem; ...">
          <button>Run Query</button>
          <button>Share</button>
          <button>Save</button>
          <select>...</select>
        </div>
      `,
    },
  }),
};
```

**Result:** Toolbar now shows visible content including text and example buttons.

### Bug #5: Vitest Addon Timeout Errors

**Location:** `.storybook/main.ts`

**The Bug:**
The `@storybook/addon-vitest` addon was taking >30 seconds to start, causing timeout errors:
```
Error: Aborting test runner process because it took longer than 30 seconds to start.
```

**The Fix:**
Disabled the addon in the Storybook configuration:
```typescript
addons: [
  '@chromatic-com/storybook',
  '@storybook/addon-docs',
  '@storybook/addon-a11y',
  // '@storybook/addon-vitest', // ✅ Disabled - causing timeout errors
],
```

**Note:** This doesn't affect regular unit tests (`npm test`), which still run via Vitest directly.

## All Commits

```
commit 30bcd4b - fix: resolve infinite loop causing Storybook browser freeze
commit 2f90d15 - fix: make SparqlEditor and Toolbar visible in Storybook
```
