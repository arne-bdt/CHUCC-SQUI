/**
 * Carbon Design System theme for CodeMirror 6
 * Provides themes matching all 4 Carbon themes: white, g10, g90, g100
 */

import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { CarbonTheme } from '../types';

/**
 * Carbon theme colors for each theme variant
 */
const carbonColors = {
  white: {
    background: '#ffffff',
    foreground: '#161616',
    selection: '#e8daff',
    cursor: '#0f62fe',
    activeLine: '#f4f4f4',
    gutterBackground: '#f4f4f4',
    gutterForeground: '#525252',
    lineNumber: '#8d8d8d',
    keyword: '#0f62fe',
    string: '#0e6027',
    number: '#8a3800',
    comment: '#6f6f6f',
    variable: '#002d9c',
    property: '#0043ce',
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
    gutterBackground: '#e0e0e0',
    gutterForeground: '#525252',
    lineNumber: '#8d8d8d',
    keyword: '#0f62fe',
    string: '#0e6027',
    number: '#8a3800',
    comment: '#6f6f6f',
    variable: '#002d9c',
    property: '#0043ce',
    operator: '#161616',
    link: '#0f62fe',
    atom: '#8a3800',
  },
  g90: {
    background: '#262626',
    foreground: '#f4f4f4',
    selection: '#6f6f6f',
    cursor: '#8d8d8d',
    activeLine: '#393939',
    gutterBackground: '#393939',
    gutterForeground: '#c6c6c6',
    lineNumber: '#8d8d8d',
    keyword: '#78a9ff',
    string: '#42be65',
    number: '#ff7eb6',
    comment: '#8d8d8d',
    variable: '#82cfff',
    property: '#4589ff',
    operator: '#f4f4f4',
    link: '#78a9ff',
    atom: '#ff7eb6',
  },
  g100: {
    background: '#161616',
    foreground: '#f4f4f4',
    selection: '#525252',
    cursor: '#8d8d8d',
    activeLine: '#262626',
    gutterBackground: '#262626',
    gutterForeground: '#c6c6c6',
    lineNumber: '#8d8d8d',
    keyword: '#78a9ff',
    string: '#42be65',
    number: '#ff7eb6',
    comment: '#8d8d8d',
    variable: '#82cfff',
    property: '#4589ff',
    operator: '#f4f4f4',
    link: '#78a9ff',
    atom: '#ff7eb6',
  },
};

/**
 * Create Carbon Design System theme for CodeMirror
 *
 * @param themeName - Carbon theme name (white, g10, g90, g100)
 * @returns CodeMirror theme extension
 */
export function createCarbonTheme(themeName: CarbonTheme = 'white'): Extension {
  const colors = carbonColors[themeName];
  const isDark = themeName === 'g90' || themeName === 'g100';

  const theme = EditorView.theme(
    {
      '&': {
        backgroundColor: colors.background,
        color: colors.foreground,
        height: '100%',
      },
      '.cm-content': {
        caretColor: colors.cursor,
        fontFamily: 'IBM Plex Mono, Menlo, Monaco, Consolas, monospace',
        fontSize: '14px',
        lineHeight: '1.6',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: colors.cursor,
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: colors.cursor,
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: colors.selection,
      },
      '.cm-selectionBackground': {
        backgroundColor: colors.selection,
      },
      '.cm-activeLine': {
        backgroundColor: colors.activeLine,
      },
      '.cm-gutters': {
        backgroundColor: colors.gutterBackground,
        color: colors.gutterForeground,
        border: 'none',
        borderRight: `1px solid ${isDark ? '#393939' : '#e0e0e0'}`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: colors.activeLine,
      },
      '.cm-lineNumbers .cm-gutterElement': {
        color: colors.lineNumber,
        padding: '0 8px 0 8px',
        minWidth: '32px',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: isDark ? '#393939' : '#e0e0e0',
        border: 'none',
        color: colors.foreground,
      },
      '.cm-tooltip': {
        backgroundColor: colors.background,
        color: colors.foreground,
        border: `1px solid ${isDark ? '#525252' : '#e0e0e0'}`,
      },
      '.cm-tooltip .cm-tooltip-arrow:before': {
        borderTopColor: isDark ? '#525252' : '#e0e0e0',
      },
      '.cm-tooltip .cm-tooltip-arrow:after': {
        borderTopColor: colors.background,
      },
      '.cm-scroller': {
        fontFamily: 'IBM Plex Mono, Menlo, Monaco, Consolas, monospace',
      },
    },
    { dark: isDark }
  );

  const highlighting = HighlightStyle.define([
    { tag: t.keyword, color: colors.keyword, fontWeight: 'bold' },
    { tag: [t.string, t.special(t.string)], color: colors.string },
    { tag: t.number, color: colors.number },
    { tag: t.bool, color: colors.atom },
    { tag: t.null, color: colors.atom },
    { tag: t.atom, color: colors.atom },
    { tag: t.comment, color: colors.comment, fontStyle: 'italic' },
    { tag: t.variableName, color: colors.variable },
    { tag: t.propertyName, color: colors.property },
    { tag: t.operator, color: colors.operator },
    { tag: t.punctuation, color: colors.operator },
    { tag: t.link, color: colors.link, textDecoration: 'underline' },
    { tag: t.meta, color: colors.keyword },
    { tag: t.heading, color: colors.keyword, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strong, fontWeight: 'bold' },
  ]);

  return [theme, syntaxHighlighting(highlighting)];
}

/**
 * Get Carbon theme colors for a specific theme
 * Useful for custom styling or extensions
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
  return { ...carbonColors[themeName] };
}
