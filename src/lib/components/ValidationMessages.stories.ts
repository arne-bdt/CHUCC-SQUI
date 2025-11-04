/**
 * Storybook stories for ValidationMessages component
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import ValidationMessages from './ValidationMessages.svelte';
import type { ValidationIssue } from '$lib/editor/utils/queryValidation';

const meta = {
  title: 'Components/ValidationMessages',
  component: ValidationMessages,
  tags: ['autodocs'],
  argTypes: {
    diagnostics: {
      control: 'object',
      description: 'Array of validation issues to display',
    },
    hideCloseButton: {
      control: 'boolean',
      description: 'Hide the close button on notifications',
    },
  },
} satisfies Meta<ValidationMessages>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with no validation issues
 */
export const Empty: Story = {
  args: {
    diagnostics: [],
    hideCloseButton: false,
  },
};

/**
 * Single warning about SPARQL 1.1 feature on 1.0 endpoint
 */
export const SingleWarning: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'warning',
        message: 'BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Multiple warnings about compatibility issues
 */
export const MultipleWarnings: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'warning',
        message: 'BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
      {
        from: 50,
        to: 60,
        severity: 'warning',
        message: 'Endpoint does not support URI dereferencing in FROM clauses',
      },
      {
        from: 100,
        to: 110,
        severity: 'warning',
        message: 'SERVICE keyword is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-federated-query/',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Single info message about unknown graph
 */
export const SingleInfo: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 50,
        severity: 'info',
        message: 'Graph <http://example.org/unknown> not in endpoint\'s named graphs list',
        actionLabel: 'See available graphs',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Multiple info messages
 */
export const MultipleInfos: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 50,
        severity: 'info',
        message: 'Graph <http://example.org/graph1> not in endpoint\'s named graphs list',
        actionLabel: 'See available graphs',
      },
      {
        from: 100,
        to: 150,
        severity: 'info',
        message: 'Custom function <http://example.org/custom#myFunc> not listed in endpoint capabilities',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Single error message (rare, but possible)
 */
export const SingleError: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'error',
        message: 'Query syntax error: unexpected token at position 42',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Multiple errors
 */
export const MultipleErrors: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'error',
        message: 'Query syntax error: unexpected token at position 42',
      },
      {
        from: 50,
        to: 60,
        severity: 'error',
        message: 'Undefined prefix "ex:" used without declaration',
      },
      {
        from: 100,
        to: 110,
        severity: 'error',
        message: 'Invalid IRI syntax in FROM clause',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Mixed severity levels - realistic scenario
 */
export const MixedSeverity: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'error',
        message: 'Query syntax error: unexpected token "SELECTT" - did you mean "SELECT"?',
      },
      {
        from: 50,
        to: 60,
        severity: 'warning',
        message: 'BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
      {
        from: 100,
        to: 110,
        severity: 'warning',
        message: 'Endpoint does not support federated queries (SERVICE keyword)',
      },
      {
        from: 150,
        to: 200,
        severity: 'info',
        message: 'Graph <http://example.org/myGraph> not in endpoint\'s named graphs list',
        actionLabel: 'See available graphs',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * SPARQL 1.0 endpoint compatibility warnings
 */
export const SPARQL10EndpointWarnings: Story = {
  args: {
    diagnostics: [
      {
        from: 45,
        to: 49,
        severity: 'warning',
        message: 'BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
      {
        from: 120,
        to: 125,
        severity: 'warning',
        message: 'MINUS is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
      {
        from: 180,
        to: 186,
        severity: 'warning',
        message: 'VALUES is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
      {
        from: 220,
        to: 228,
        severity: 'warning',
        message: 'CONTAINS function is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Feature support warnings
 */
export const FeatureSupportWarnings: Story = {
  args: {
    diagnostics: [
      {
        from: 10,
        to: 45,
        severity: 'warning',
        message: 'Endpoint does not support URI dereferencing in FROM clauses',
      },
      {
        from: 100,
        to: 107,
        severity: 'warning',
        message: 'Endpoint does not support federated queries (SERVICE keyword)',
      },
      {
        from: 0,
        to: 0,
        severity: 'warning',
        message: 'Endpoint requires dataset specification (FROM or FROM NAMED clause)',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * Long messages to test layout
 */
export const LongMessages: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'warning',
        message:
          'This is a very long warning message that explains in detail why this particular SPARQL feature is not supported by the current endpoint and what the user should consider doing as an alternative approach to achieve their desired query results.',
        actionLabel: 'Read full documentation',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
      {
        from: 50,
        to: 100,
        severity: 'info',
        message:
          'The graph IRI <http://example.org/very/long/graph/name/that/might/wrap/to/multiple/lines> is not in the endpoint\'s named graphs list. Consider using one of the available graphs instead.',
        actionLabel: 'See available graphs',
      },
    ] as ValidationIssue[],
    hideCloseButton: true,
  },
};

/**
 * With close button enabled
 */
export const WithCloseButton: Story = {
  args: {
    diagnostics: [
      {
        from: 0,
        to: 10,
        severity: 'warning',
        message: 'BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        actionLabel: 'Learn more',
        actionUrl: 'https://www.w3.org/TR/sparql11-query/',
      },
    ] as ValidationIssue[],
    hideCloseButton: false,
  },
};
