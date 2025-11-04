/**
 * Carbon Design System theme for CodeMirror 6
 * Provides themes matching all 4 Carbon themes: white, g10, g90, g100
 *
 * This implementation uses Carbon Design Tokens (CSS variables) for automatic
 * synchronization with the global Carbon theme. When the Carbon theme changes,
 * the editor theme updates automatically without JavaScript intervention.
 */

import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { CarbonTheme } from '../types';

/**
 * Fallback colors for each theme variant
 * Used in SSR or environments where CSS variables are unavailable
 * These match Carbon Design System v11 tokens
 */
const fallbackColors = {
  white: {
    background: '#ffffff',
    foreground: '#161616',
    selection: '#e8daff',
    cursor: '#0f62fe',
    activeLine: '#e0e0e0',
    gutterBackground: '#f4f4f4',
    gutterForeground: '#525252',
    lineNumber: '#8d8d8d',
    keyword: '#0f62fe',
    string: '#198038',
    number: '#da1e28',
    comment: '#525252',
    variable: '#0043ce',
    property: '#0f62fe',
    operator: '#161616',
    link: '#0f62fe',
    atom: '#8a3800',
  },
  g10: {
    background: '#f4f4f4',
    foreground: '#161616',
    selection: '#e8daff',
    cursor: '#0f62fe',
    activeLine: '#e0e0e0',
    gutterBackground: '#ffffff',
    gutterForeground: '#525252',
    lineNumber: '#8d8d8d',
    keyword: '#0f62fe',
    string: '#198038',
    number: '#da1e28',
    comment: '#525252',
    variable: '#0043ce',
    property: '#0f62fe',
    operator: '#161616',
    link: '#0f62fe',
    atom: '#8a3800',
  },
  g90: {
    background: '#262626',
    foreground: '#f4f4f4',
    selection: '#525252',
    cursor: '#8d8d8d',
    activeLine: '#393939',
    gutterBackground: '#393939',
    gutterForeground: '#c6c6c6',
    lineNumber: '#8d8d8d',
    keyword: '#78a9ff',
    string: '#42be65',
    number: '#ff8389',
    comment: '#c6c6c6',
    variable: '#8ab4f8',
    property: '#78a9ff',
    operator: '#f4f4f4',
    link: '#78a9ff',
    atom: '#ff7eb6',
  },
  g100: {
    background: '#161616',
    foreground: '#f4f4f4',
    selection: '#393939',
    cursor: '#8d8d8d',
    activeLine: '#262626',
    gutterBackground: '#262626',
    gutterForeground: '#c6c6c6',
    lineNumber: '#8d8d8d',
    keyword: '#78a9ff',
    string: '#42be65',
    number: '#ff8389',
    comment: '#c6c6c6',
    variable: '#8ab4f8',
    property: '#78a9ff',
    operator: '#f4f4f4',
    link: '#78a9ff',
    atom: '#ff7eb6',
  },
};

/**
 * Create Carbon Design System theme for CodeMirror
 *
 * Uses CSS custom properties (CSS variables) from Carbon Design Tokens for automatic
 * theme synchronization. Falls back to hard-coded colors if CSS variables are unavailable.
 *
 * Mapping Strategy:
 * - Background → --cds-background
 * - Text Primary → --cds-text-primary
 * - Text Secondary → --cds-text-secondary
 * - Keywords/Links → --cds-link-primary
 * - Strings → --cds-support-success
 * - Numbers/Errors → --cds-support-error
 * - Layers → --cds-layer-01, --cds-layer-selected-01
 * - Borders → --cds-border-subtle-01
 *
 * @param themeName - Carbon theme name (white, g10, g90, g100)
 * @returns CodeMirror theme extension
 */
export function createCarbonTheme(themeName: CarbonTheme = 'white'): Extension {
  const fallback = fallbackColors[themeName];
  const isDark = themeName === 'g90' || themeName === 'g100';

  const theme = EditorView.theme(
    {
      '&': {
        backgroundColor: `var(--cds-background, ${fallback.background})`,
        color: `var(--cds-text-primary, ${fallback.foreground})`,
        height: '100%',
      },
      '.cm-content': {
        caretColor: `var(--cds-link-primary, ${fallback.cursor})`,
        fontFamily:
          'var(--cds-code-01-font-family, "IBM Plex Mono"), Menlo, Monaco, Consolas, monospace',
        fontSize: 'var(--cds-code-01-font-size, 0.875rem)',
        lineHeight: 'var(--cds-code-01-line-height, 1.42857)',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: `var(--cds-link-primary, ${fallback.cursor})`,
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: `var(--cds-link-primary, ${fallback.cursor})`,
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: `var(--cds-layer-selected-hover, ${fallback.selection})`,
      },
      '.cm-selectionBackground': {
        backgroundColor: `var(--cds-layer-selected-hover, ${fallback.selection})`,
      },
      '.cm-activeLine': {
        backgroundColor: `var(--cds-layer-selected-01, ${fallback.activeLine})`,
      },
      '.cm-gutters': {
        backgroundColor: `var(--cds-layer-01, ${fallback.gutterBackground})`,
        color: `var(--cds-text-secondary, ${fallback.gutterForeground})`,
        border: 'none',
        borderRight: `1px solid var(--cds-border-subtle-01, ${isDark ? '#393939' : '#e0e0e0'})`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: `var(--cds-layer-selected-01, ${fallback.activeLine})`,
      },
      '.cm-lineNumbers .cm-gutterElement': {
        color: `var(--cds-text-secondary, ${fallback.lineNumber})`,
        padding: '0 8px 0 8px',
        minWidth: '32px',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: `var(--cds-layer-01, ${isDark ? '#393939' : '#e0e0e0'})`,
        border: 'none',
        color: `var(--cds-text-primary, ${fallback.foreground})`,
      },
      '.cm-tooltip': {
        backgroundColor: `var(--cds-layer-01, ${fallback.background})`,
        color: `var(--cds-text-primary, ${fallback.foreground})`,
        border: `1px solid var(--cds-border-subtle-01, ${isDark ? '#525252' : '#e0e0e0'})`,
        boxShadow: 'var(--cds-shadow, 0 2px 6px rgba(0, 0, 0, 0.2))',
      },
      '.cm-tooltip .cm-tooltip-arrow:before': {
        borderTopColor: `var(--cds-border-subtle-01, ${isDark ? '#525252' : '#e0e0e0'})`,
      },
      '.cm-tooltip .cm-tooltip-arrow:after': {
        borderTopColor: `var(--cds-layer-01, ${fallback.background})`,
      },
      // Autocomplete popup styling
      '.cm-tooltip-autocomplete': {
        backgroundColor: `var(--cds-layer-01, ${fallback.background})`,
        border: `1px solid var(--cds-border-subtle-01, ${isDark ? '#525252' : '#e0e0e0'})`,
        boxShadow: 'var(--cds-shadow, 0 2px 6px rgba(0, 0, 0, 0.2))',
        fontFamily:
          'var(--cds-productive-heading-01-font-family, "IBM Plex Sans"), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 'var(--cds-productive-heading-01-font-size, 0.875rem)',
        lineHeight: 'var(--cds-productive-heading-01-line-height, 1.28572)',
        maxHeight: '20rem',
        overflowY: 'auto',
      },
      '.cm-tooltip-autocomplete > ul': {
        margin: 0,
        padding: 0,
        listStyle: 'none',
        minWidth: '300px',
        maxWidth: '600px',
      },
      '.cm-tooltip-autocomplete > ul > li': {
        padding: 'var(--cds-spacing-03, 0.5rem) var(--cds-spacing-04, 0.75rem)',
        cursor: 'pointer',
        borderBottom: `1px solid var(--cds-border-subtle-00, ${isDark ? '#393939' : '#f4f4f4'})`,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--cds-spacing-02, 0.25rem)',
      },
      '.cm-tooltip-autocomplete > ul > li:last-child': {
        borderBottom: 'none',
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: `var(--cds-layer-selected-01, ${fallback.activeLine})`,
      },
      '.cm-tooltip-autocomplete > ul > li:hover': {
        backgroundColor: `var(--cds-layer-hover-01, ${isDark ? '#353535' : '#e8e8e8'})`,
      },
      '.cm-completionLabel': {
        color: `var(--cds-text-primary, ${fallback.foreground})`,
        fontFamily:
          'var(--cds-code-01-font-family, "IBM Plex Mono"), Menlo, Monaco, Consolas, monospace',
        fontSize: 'var(--cds-code-01-font-size, 0.875rem)',
        fontWeight: 500,
      },
      '.cm-completionDetail': {
        color: `var(--cds-text-secondary, ${fallback.comment})`,
        fontSize: 'var(--cds-label-01-font-size, 0.75rem)',
        fontStyle: 'normal',
        marginLeft: 'var(--cds-spacing-03, 0.5rem)',
      },
      '.cm-completionInfo': {
        backgroundColor: `var(--cds-layer-02, ${isDark ? '#353535' : '#f4f4f4'})`,
        border: `1px solid var(--cds-border-subtle-01, ${isDark ? '#525252' : '#e0e0e0'})`,
        borderRadius: 'var(--cds-spacing-02, 0.25rem)',
        padding: 'var(--cds-spacing-03, 0.5rem) var(--cds-spacing-04, 0.75rem)',
        maxWidth: '400px',
        color: `var(--cds-text-primary, ${fallback.foreground})`,
        fontSize: 'var(--cds-body-short-01-font-size, 0.875rem)',
        lineHeight: 'var(--cds-body-short-01-line-height, 1.42857)',
      },
      '.cm-completionIcon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1rem',
        height: '1rem',
        marginRight: 'var(--cds-spacing-03, 0.5rem)',
        opacity: 0.7,
      },
      '.cm-completionIcon-constant': {
        color: `var(--cds-support-info, ${isDark ? '#78a9ff' : '#0f62fe'})`,
      },
      '.cm-completionIcon-property': {
        color: `var(--cds-support-success, ${fallback.string})`,
      },
      '.cm-completionIcon-namespace': {
        color: `var(--cds-support-warning, ${fallback.atom})`,
      },
      '.cm-scroller': {
        fontFamily:
          'var(--cds-code-01-font-family, "IBM Plex Mono"), Menlo, Monaco, Consolas, monospace',
      },
    },
    { dark: isDark }
  );

  // Syntax highlighting using Carbon Design Tokens
  const highlighting = HighlightStyle.define([
    // Keywords (SELECT, WHERE, FILTER, etc.) - use link color for prominence
    {
      tag: t.keyword,
      color: `var(--cds-link-primary, ${fallback.keyword})`,
      fontWeight: 'bold',
    },
    // Strings (URIs, literals) - use success/green color
    {
      tag: [t.string, t.special(t.string)],
      color: `var(--cds-support-success, ${fallback.string})`,
    },
    // Numbers - use error/red color for visibility
    {
      tag: t.number,
      color: `var(--cds-support-error, ${fallback.number})`,
    },
    // Booleans and atoms - use warning/orange color
    {
      tag: t.bool,
      color: `var(--cds-support-warning, ${fallback.atom})`,
    },
    {
      tag: t.null,
      color: `var(--cds-support-warning, ${fallback.atom})`,
    },
    {
      tag: t.atom,
      color: `var(--cds-support-warning, ${fallback.atom})`,
    },
    // Comments - use secondary text color, italic
    {
      tag: t.comment,
      color: `var(--cds-text-secondary, ${fallback.comment})`,
      fontStyle: 'italic',
    },
    // Variables (?s, ?p, ?o) - use link color with less weight
    {
      tag: t.variableName,
      color: `var(--cds-link-primary, ${fallback.variable})`,
    },
    // Property names - use link color
    {
      tag: t.propertyName,
      color: `var(--cds-link-primary, ${fallback.property})`,
    },
    // Operators and punctuation - use primary text color
    {
      tag: t.operator,
      color: `var(--cds-text-primary, ${fallback.operator})`,
    },
    {
      tag: t.punctuation,
      color: `var(--cds-text-primary, ${fallback.operator})`,
    },
    // Links - use link color with underline
    {
      tag: t.link,
      color: `var(--cds-link-primary, ${fallback.link})`,
      textDecoration: 'underline',
    },
    // Meta/special - use link color
    {
      tag: t.meta,
      color: `var(--cds-link-primary, ${fallback.keyword})`,
    },
    // Headings - use link color, bold
    {
      tag: t.heading,
      color: `var(--cds-link-primary, ${fallback.keyword})`,
      fontWeight: 'bold',
    },
    // Emphasis - italic
    {
      tag: t.emphasis,
      fontStyle: 'italic',
    },
    // Strong - bold
    {
      tag: t.strong,
      fontWeight: 'bold',
    },
  ]);

  return [theme, syntaxHighlighting(highlighting)];
}

/**
 * Get Carbon theme fallback colors for a specific theme
 * Useful for custom styling or extensions that need hard-coded colors
 *
 * Note: In production, the theme uses CSS variables that automatically
 * sync with the Carbon Design System. These fallback colors are only
 * used when CSS variables are unavailable (e.g., SSR, testing).
 *
 * @param themeName - Carbon theme name
 * @returns Color palette for the theme
 */
export function getCarbonColors(themeName: CarbonTheme = 'white'): {
  background: string;
  foreground: string;
  selection: string;
  cursor: string;
  activeLine: string;
  gutterBackground: string;
  gutterForeground: string;
  lineNumber: string;
  keyword: string;
  string: string;
  number: string;
  comment: string;
  variable: string;
  property: string;
  operator: string;
  link: string;
  atom: string;
} {
  return { ...fallbackColors[themeName] };
}

/**
 * Check if the theme is a dark theme
 * Useful for conditional styling
 *
 * @param themeName - Carbon theme name
 * @returns true if the theme is dark (g90 or g100)
 */
export function isDarkTheme(themeName: CarbonTheme): boolean {
  return themeName === 'g90' || themeName === 'g100';
}

/**
 * Get the recommended contrast color for text on a given theme background
 *
 * @param themeName - Carbon theme name
 * @returns Color suitable for text on the theme background
 */
export function getContrastColor(themeName: CarbonTheme): string {
  return isDarkTheme(themeName) ? '#f4f4f4' : '#161616';
}
