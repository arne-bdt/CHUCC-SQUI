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
    }]
    // Note: CDN detection is handled by scripts/check-cdn-urls.js (run via npm run check:cdn)
    // ESLint's selector syntax doesn't support regex pattern matching in attribute values
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
    }],
    // Prevent accidental use of global store singletons in Svelte components
    // Components should use context stores via getXStore() functions instead
    'no-restricted-imports': ['error', {
      paths: [
        {
          name: '../stores/queryStore',
          importNames: ['queryStore'],
          message: 'Do not import global queryStore singleton in .svelte files. Use getQueryStore() from storeContext instead.'
        },
        {
          name: '../../stores/queryStore',
          importNames: ['queryStore'],
          message: 'Do not import global queryStore singleton in .svelte files. Use getQueryStore() from storeContext instead.'
        },
        {
          name: '../../../stores/queryStore',
          importNames: ['queryStore'],
          message: 'Do not import global queryStore singleton in .svelte files. Use getQueryStore() from storeContext instead.'
        },
        {
          name: '../stores/resultsStore',
          importNames: ['resultsStore'],
          message: 'Do not import global resultsStore singleton in .svelte files. Use getResultsStore() from storeContext instead.'
        },
        {
          name: '../../stores/resultsStore',
          importNames: ['resultsStore'],
          message: 'Do not import global resultsStore singleton in .svelte files. Use getResultsStore() from storeContext instead.'
        },
        {
          name: '../../../stores/resultsStore',
          importNames: ['resultsStore'],
          message: 'Do not import global resultsStore singleton in .svelte files. Use getResultsStore() from storeContext instead.'
        },
        {
          name: '../stores/uiStore',
          importNames: ['uiStore'],
          message: 'Do not import global uiStore singleton in .svelte files. Use getUIStore() from storeContext instead.'
        },
        {
          name: '../../stores/uiStore',
          importNames: ['uiStore'],
          message: 'Do not import global uiStore singleton in .svelte files. Use getUIStore() from storeContext instead.'
        },
        {
          name: '../../../stores/uiStore',
          importNames: ['uiStore'],
          message: 'Do not import global uiStore singleton in .svelte files. Use getUIStore() from storeContext instead.'
        },
        {
          name: '../stores/tabStore',
          importNames: ['tabStore'],
          message: 'Do not import global tabStore singleton in .svelte files. Use getTabStore() from storeContext instead.'
        },
        {
          name: '../../stores/tabStore',
          importNames: ['tabStore'],
          message: 'Do not import global tabStore singleton in .svelte files. Use getTabStore() from storeContext instead.'
        },
        {
          name: '../../../stores/tabStore',
          importNames: ['tabStore'],
          message: 'Do not import global tabStore singleton in .svelte files. Use getTabStore() from storeContext instead.'
        },
        {
          name: '../services/queryExecutionService',
          importNames: ['queryExecutionService'],
          message: 'Do not use queryExecutionService in .svelte files. Use resultsStore.executeQuery() from context instead.'
        },
        {
          name: '../../services/queryExecutionService',
          importNames: ['queryExecutionService'],
          message: 'Do not use queryExecutionService in .svelte files. Use resultsStore.executeQuery() from context instead.'
        },
        {
          name: '../../../services/queryExecutionService',
          importNames: ['queryExecutionService'],
          message: 'Do not use queryExecutionService in .svelte files. Use resultsStore.executeQuery() from context instead.'
        }
      ]
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
