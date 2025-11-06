// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [js.configs.recommended, {
  files: ['**/*.{js,mjs,cjs,ts}'],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.node
    },
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
      extraFileExtensions: ['.svelte']
    }
  },
  plugins: {
    '@typescript-eslint': tsPlugin
  },
  rules: {
    ...tsPlugin.configs.recommended.rules,
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    // Prevent CDN usage - all assets must be bundled locally for offline support
    'no-restricted-syntax': ['error', {
      selector: 'Literal[value=/https?:\\/\\/(unpkg|cdn|jsdelivr|cdnjs|fonts\\.googleapis|fonts\\.gstatic)/]',
      message: 'CDN URLs are not allowed. All assets must be bundled locally for offline/air-gapped deployment support.'
    }]
  }
}, {
  files: ['**/*.svelte'],
  languageOptions: {
    parser: svelteParser,
    parserOptions: {
      parser: tsParser,
      project: './tsconfig.json',
      extraFileExtensions: ['.svelte']
    },
    globals: {
      ...globals.browser,
      ...globals.es2021
    }
  },
  plugins: {
    svelte: sveltePlugin
  },
  rules: {
    ...sveltePlugin.configs.recommended.rules,
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
}, {
  ignores: [
    'dist/',
    'build/',
    'node_modules/',
    '.svelte-kit/',
    'coverage/',
    '*.config.js',
    '*.config.ts'
  ]
}, ...storybook.configs["flat/recommended"]];
