/**
 * Systematic E2E test to debug why results don't render after query execution
 * Tests each step of the execution flow to identify where reactivity breaks
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Query Execution Reactivity Analysis', () => {
  test('should systematically analyze query execution and results display', async ({ page }) => {
    console.log('\n=== Starting Systematic Query Execution Analysis ===\n');

    // Navigate to Wikidata endpoint story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--wikidata-endpoint&viewMode=story`);
    
    // Wait for component to initialize
    await page.waitForTimeout(2000);
    
    console.log('Step 1: Component loaded');

    // Check initial state
    const initialState = await page.evaluate(() => {
      const placeholder = document.querySelector('.results-placeholder');
      const hasResultsContainer = !!document.querySelector('.results-container');
      const hasDataTable = !!document.querySelector('.data-table-container');
      const placeholderText = placeholder?.textContent?.trim();
      
      return {
        hasPlaceholder: !!placeholder,
        hasResultsContainer,
        hasDataTable,
        placeholderText,
      };
    });
    
    console.log('Step 2: Initial state:', JSON.stringify(initialState, null, 2));

    // Find the Run button
    const runButton = page.locator('button').filter({ hasText: 'Run' });
    await expect(runButton).toBeVisible({ timeout: 5000 });
    
    console.log('Step 3: Run button found');

    // Click Run and immediately check loading state
    await runButton.click();
    console.log('Step 4: Run button clicked');
    
    // Wait a short time for loading state
    await page.waitForTimeout(500);
    
    const loadingState = await page.evaluate(() => {
      const placeholder = document.querySelector('.results-placeholder');
      const hasLoadingIndicator = placeholder?.textContent?.includes('Executing') || 
                                   placeholder?.textContent?.includes('Please wait');
      const cancelButton = document.querySelector('button[title*="Cancel"]') || 
                          Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cancel'));
      
      return {
        hasLoadingIndicator,
        hasCancelButton: !!cancelButton,
        placeholderContent: placeholder?.textContent?.trim().substring(0, 100),
      };
    });
    
    console.log('Step 5: Loading state:', JSON.stringify(loadingState, null, 2));

    // Wait for query to complete (up to 10 seconds)
    await page.waitForTimeout(10000);
    
    console.log('Step 6: Waited 10 seconds for query execution');

    // Check state after query execution
    const afterExecutionState = await page.evaluate(() => {
      const placeholder = document.querySelector('.results-placeholder');
      const resultsContainer = document.querySelector('.results-container');
      const dataTableContainer = document.querySelector('.data-table-container');
      const resultsToolbar = document.querySelector('.results-toolbar');
      const wxGrid = document.querySelector('.wx-grid');
      const resultsInfo = document.querySelector('.results-info');
      const errorNotification = document.querySelector('.bx--toast-notification--error');
      
      // Get all class names from placeholder
      const placeholderClasses = placeholder?.className || '';
      
      // Check for any visible elements with "result" in class name
      const allResultElements = Array.from(document.querySelectorAll('[class*="result"]')).map(el => ({
        tag: el.tagName,
        classes: el.className,
        visible: (el as HTMLElement).offsetParent !== null,
        text: el.textContent?.substring(0, 50),
      }));
      
      return {
        hasPlaceholder: !!placeholder,
        placeholderClasses,
        hasResultsContainer: !!resultsContainer,
        resultsContainerVisible: resultsContainer ? (resultsContainer as HTMLElement).offsetParent !== null : false,
        hasDataTableContainer: !!dataTableContainer,
        dataTableVisible: dataTableContainer ? (dataTableContainer as HTMLElement).offsetParent !== null : false,
        hasResultsToolbar: !!resultsToolbar,
        hasWxGrid: !!wxGrid,
        hasResultsInfo: !!resultsInfo,
        hasError: !!errorNotification,
        errorText: errorNotification?.textContent?.trim(),
        allResultElements,
        placeholderHTML: placeholder?.innerHTML.substring(0, 200),
      };
    });
    
    console.log('Step 7: After execution state:', JSON.stringify(afterExecutionState, null, 2));

    // Check computed styles and visibility
    const visibilityCheck = await page.evaluate(() => {
      const resultsContainer = document.querySelector('.results-container');
      const dataTable = document.querySelector('.data-table-container');
      
      if (resultsContainer) {
        const styles = window.getComputedStyle(resultsContainer);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          dataTableExists: !!dataTable,
        };
      }
      return null;
    });
    
    console.log('Step 8: Visibility check:', JSON.stringify(visibilityCheck, null, 2));

    // Now test format switching
    console.log('Step 9: Testing format switch to trigger render...');
    
    const formatSelector = page.locator('select, .bx--select-input').first();
    const hasSelectorBeforeSwitch = await formatSelector.isVisible().catch(() => false);
    
    console.log('Step 10: Format selector visible:', hasSelectorBeforeSwitch);
    
    if (hasSelectorBeforeSwitch) {
      // Try to switch format
      await formatSelector.selectOption({ index: 1 }).catch(() => {
        console.log('Could not select format option');
      });
      
      await page.waitForTimeout(2000);
      
      const afterFormatSwitch = await page.evaluate(() => {
        const dataTableContainer = document.querySelector('.data-table-container');
        const wxGrid = document.querySelector('.wx-grid');
        
        return {
          hasDataTableContainer: !!dataTableContainer,
          dataTableVisible: dataTableContainer ? (dataTableContainer as HTMLElement).offsetParent !== null : false,
          hasWxGrid: !!wxGrid,
          wxGridVisible: wxGrid ? (wxGrid as HTMLElement).offsetParent !== null : false,
        };
      });
      
      console.log('Step 11: After format switch:', JSON.stringify(afterFormatSwitch, null, 2));
    }

    // Take screenshots for visual debugging
    await page.screenshot({ path: 'test-results/query-execution-debug-full.png', fullPage: true });
    
    console.log('\n=== Analysis Complete ===\n');
    
    // The test should fail if results aren't visible after execution
    expect(afterExecutionState.hasResultsContainer || afterExecutionState.hasError).toBeTruthy();
  });

  test('should check store reactivity by inspecting console logs', async ({ page }) => {
    console.log('\n=== Console Log Analysis ===\n');
    
    // Capture console logs
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('[ResultsPlaceholder]') || 
          text.includes('[queryExecutionService]') ||
          text.includes('Reactive state')) {
        console.log('📊 Console:', text);
      }
    });

    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--wikidata-endpoint&viewMode=story`);
    await page.waitForTimeout(2000);

    const runButton = page.locator('button').filter({ hasText: 'Run' });
    await runButton.click();
    
    // Wait for execution
    await page.waitForTimeout(10000);
    
    console.log('\n=== Relevant Console Logs ===');
    const relevantLogs = logs.filter(log => 
      log.includes('[ResultsPlaceholder]') || 
      log.includes('[queryExecutionService]') ||
      log.includes('Reactive state')
    );
    
    relevantLogs.forEach(log => console.log(log));
    
    console.log('\n=== End Console Logs ===\n');
  });
});
