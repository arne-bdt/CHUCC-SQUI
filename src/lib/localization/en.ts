/**
 * English (en) translations for SQUI
 * Default locale for the SPARQL Query UI component
 */

export const en = {
  // Toolbar
  'toolbar.run': 'Run Query',
  'toolbar.cancel': 'Cancel',
  'toolbar.cancelling': 'Cancelling...',
  'toolbar.runTooltip': 'Execute SPARQL query (Ctrl+Enter)',
  'toolbar.runTooltipNoQuery': 'Enter a query to execute',
  'toolbar.runTooltipNoEndpoint': 'Select an endpoint first',
  'toolbar.endpoint': 'Endpoint',
  'toolbar.download': 'Download',
  'toolbar.save': 'Save',
  'toolbar.share': 'Share',
  'toolbar.settings': 'Settings',
  'toolbar.help': 'Help',

  // Editor
  'editor.placeholder': 'Enter your SPARQL query here...',
  'editor.queryTemplate': 'Query Template',
  'editor.clearQuery': 'Clear Query',
  'editor.formatQuery': 'Format Query',
  'editor.selectTemplate': 'Select a template',

  // Results
  'results.table': 'Table',
  'results.raw': 'Raw',
  'results.noResults': 'No results found',
  'results.loading': 'Executing query...',
  'results.simpleView': 'Simple View',
  'results.fullView': 'Full View',
  'results.toggleFilters': 'Toggle Filters',
  'results.downloadAs': 'Download as...',
  'results.rowCount': '{count} rows',
  'results.columnCount': '{count} columns',

  // Tabs
  'tabs.new': 'New Query',
  'tabs.close': 'Close Tab',
  'tabs.untitled': 'Query',
  'tabs.confirmClose': 'Close this tab? Unsaved changes will be lost.',

  // Endpoint
  'endpoint.label': 'SPARQL Endpoint',
  'endpoint.placeholder': 'Enter endpoint URL',
  'endpoint.validation.required': 'Endpoint URL is required',
  'endpoint.validation.invalid': 'Invalid endpoint URL',
  'endpoint.error.unreachable': 'Failed to reach endpoint',
  'endpoint.error.cors': 'CORS error - endpoint not accessible',
  'endpoint.testing': 'Testing endpoint...',
  'endpoint.connected': 'Connected',

  // Errors
  'error.network': 'Network error occurred',
  'error.timeout': 'Query timeout',
  'error.parse': 'Failed to parse query results',
  'error.sparql': 'SPARQL error',
  'error.unknown': 'An unknown error occurred',
  'error.retry': 'Retry',
  'error.details': 'Error Details',

  // ASK results
  'ask.true': 'True',
  'ask.false': 'False',
  'ask.result': 'Result',

  // Accessibility
  'a11y.runQuery': 'Execute SPARQL query (Ctrl+Enter)',
  'a11y.cancelQuery': 'Cancel running query',
  'a11y.editor': 'SPARQL Query Editor',
  'a11y.results': 'Query Results',
  'a11y.resultsTable': 'SPARQL query results table',
  'a11y.resultsRegion': 'Query results region',
  'a11y.sortColumn': 'Sort by {column}',
  'a11y.resizeColumn': 'Resize column',
  'a11y.filterColumn': 'Filter column {column}',
  'a11y.closeTab': 'Close tab',
  'a11y.newTab': 'Create new query tab',
  'a11y.endpointSelector': 'Select SPARQL endpoint',
  'a11y.downloadButton': 'Download query results',
  'a11y.formatSelector': 'Select result format',
  'a11y.viewSwitcher': 'Switch between table and raw views',
  'a11y.loading': 'Loading',
  'a11y.queryExecuting': 'Query is executing',
  'a11y.queryComplete': 'Query execution complete',
  'a11y.queryError': 'Query execution failed',
  'a11y.toolbar': 'Query execution toolbar',
  'a11y.tabList': 'Query tabs',

  // Data Grid
  'grid.columns': 'Columns',
  'grid.filter': 'Filter',
  'grid.sort': 'Sort',
  'grid.noData': 'No data available',
  'grid.showColumn': 'Show column',
  'grid.hideColumn': 'Hide column',
  'grid.resetColumns': 'Reset columns',
  'grid.selectAll': 'Select all',
  'grid.deselectAll': 'Deselect all',

  // Warnings
  'warning.largeResult': 'Result set is too large to display completely. Please refine your query.',
  'warning.timeout': 'Query is taking longer than expected',
  'warning.limitReached': 'Result limit of {limit} rows reached',

  // Format names
  'format.json': 'JSON',
  'format.xml': 'XML',
  'format.csv': 'CSV',
  'format.tsv': 'TSV',
  'format.turtle': 'Turtle',
  'format.jsonld': 'JSON-LD',
  'format.ntriples': 'N-Triples',
  'format.rdfxml': 'RDF/XML',

  // Prefixes
  'prefix.add': 'Add Prefix',
  'prefix.remove': 'Remove Prefix',
  'prefix.name': 'Prefix Name',
  'prefix.uri': 'URI',
  'prefix.common': 'Common Prefixes',

  // Query templates
  'template.select': 'SELECT Query',
  'template.construct': 'CONSTRUCT Query',
  'template.ask': 'ASK Query',
  'template.describe': 'DESCRIBE Query',

  // Keyboard shortcuts
  'shortcuts.executeQuery': 'Execute Query',
  'shortcuts.executeQueryMac': 'Execute Query',
  'shortcuts.hint': 'Press Ctrl+Enter to execute query',
  'shortcuts.hintMac': 'Press Cmd+Enter to execute query',
  'shortcuts.title': 'Keyboard Shortcuts',
  'shortcuts.cancelQuery': 'Cancel running query',
  'shortcuts.autocomplete': 'Trigger autocomplete',
  'shortcuts.find': 'Find',
  'shortcuts.replace': 'Find and replace',
  'shortcuts.undo': 'Undo',
  'shortcuts.redo': 'Redo',
  'shortcuts.indent': 'Indent selection',
  'shortcuts.dedent': 'Dedent selection',
  'shortcuts.navigate': 'Navigate elements',
  'shortcuts.close': 'Close dropdown/modal',
  'shortcuts.activate': 'Activate button/link',
  'shortcuts.toggle': 'Toggle checkbox/radio',

  // Common actions
  'action.cancel': 'Cancel',
  'action.confirm': 'Confirm',
  'action.close': 'Close',
  'action.save': 'Save',
  'action.delete': 'Delete',
  'action.edit': 'Edit',
  'action.copy': 'Copy',
  'action.paste': 'Paste',
  'action.clear': 'Clear',

  // Status messages
  'status.ready': 'Ready',
  'status.executing': 'Executing...',
  'status.success': 'Success',
  'status.error': 'Error',
  'status.cancelled': 'Cancelled',
};

/**
 * Type-safe translation keys
 * Use this type to ensure translation keys exist in the dictionary
 */
export type TranslationKey = keyof typeof en;
