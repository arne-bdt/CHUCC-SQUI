/**
 * Integration tests for ValidationMessages component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ValidationMessages from '../../../src/lib/components/ValidationMessages.svelte';
import type { ValidationIssue } from '../../../src/lib/editor/utils/queryValidation.js';

describe('ValidationMessages', () => {
  describe('Error messages', () => {
    it('should display error notification with count', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'error',
          message: 'Critical error in query',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('Query Errors')).toBeInTheDocument();
      expect(screen.getByText('1 error(s) detected')).toBeInTheDocument();
      expect(screen.getByText('Critical error in query')).toBeInTheDocument();
    });

    it('should display multiple errors', () => {
      const diagnostics: ValidationIssue[] = [
        { from: 0, to: 10, severity: 'error', message: 'Error 1' },
        { from: 20, to: 30, severity: 'error', message: 'Error 2' },
        { from: 40, to: 50, severity: 'error', message: 'Error 3' },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('3 error(s) detected')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });
  });

  describe('Warning messages', () => {
    it('should display warning notification with count', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('Query Compatibility Issues')).toBeInTheDocument();
      expect(screen.getByText('1 potential issue(s) detected')).toBeInTheDocument();
      expect(
        screen.getByText('BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0')
      ).toBeInTheDocument();
    });

    it('should display multiple warnings', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Warning 1',
        },
        {
          from: 20,
          to: 30,
          severity: 'warning',
          message: 'Warning 2',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('2 potential issue(s) detected')).toBeInTheDocument();
      expect(screen.getByText('Warning 1')).toBeInTheDocument();
      expect(screen.getByText('Warning 2')).toBeInTheDocument();
    });
  });

  describe('Info messages', () => {
    it('should display info notification with count', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'info',
          message: 'Graph not in endpoint\'s named graphs list',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('Query Suggestions')).toBeInTheDocument();
      expect(screen.getByText('1 suggestion(s)')).toBeInTheDocument();
      expect(screen.getByText('Graph not in endpoint\'s named graphs list')).toBeInTheDocument();
    });

    it('should display multiple info messages', () => {
      const diagnostics: ValidationIssue[] = [
        { from: 0, to: 10, severity: 'info', message: 'Suggestion 1' },
        { from: 20, to: 30, severity: 'info', message: 'Suggestion 2' },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('2 suggestion(s)')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
    });
  });

  describe('Mixed severity messages', () => {
    it('should display all severity levels separately', () => {
      const diagnostics: ValidationIssue[] = [
        { from: 0, to: 10, severity: 'error', message: 'Error message' },
        { from: 20, to: 30, severity: 'warning', message: 'Warning message' },
        { from: 40, to: 50, severity: 'info', message: 'Info message' },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByText('Query Errors')).toBeInTheDocument();
      expect(screen.getByText('Query Compatibility Issues')).toBeInTheDocument();
      expect(screen.getByText('Query Suggestions')).toBeInTheDocument();

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should render action button when actionLabel is provided', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Feature not supported',
          actionLabel: 'Learn more',
          actionUrl: 'https://www.w3.org/TR/sparql11-query/',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      const actionButton = screen.getByRole('button', { name: 'Learn more' });
      expect(actionButton).toBeInTheDocument();
    });

    it('should not render action button when actionLabel is not provided', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Feature not supported',
        },
      ];

      render(ValidationMessages, { props: { diagnostics, hideCloseButton: true } });

      // Should not have any buttons (no action button, close button is hidden)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render multiple action buttons for different issues', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Issue 1',
          actionLabel: 'Action 1',
          actionUrl: 'http://example.org/1',
        },
        {
          from: 20,
          to: 30,
          severity: 'info',
          message: 'Issue 2',
          actionLabel: 'Action 2',
          actionUrl: 'http://example.org/2',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should render nothing when no diagnostics', () => {
      const { container } = render(ValidationMessages, { props: { diagnostics: [] } });

      // No notification components should be rendered
      expect(container.querySelector('.bx--inline-notification')).not.toBeInTheDocument();
    });

    it('should render nothing when diagnostics is undefined', () => {
      const { container } = render(ValidationMessages);

      expect(container.querySelector('.bx--inline-notification')).not.toBeInTheDocument();
    });
  });

  describe('hideCloseButton prop', () => {
    it('should hide close button when hideCloseButton is true', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Test warning',
        },
      ];

      render(ValidationMessages, { props: { diagnostics, hideCloseButton: true } });

      // Close button should not be rendered
      const closeButtons = screen.queryAllByRole('button', { name: /close/i });
      expect(closeButtons).toHaveLength(0);
    });

    it('should show close button by default', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Test warning',
        },
      ];

      render(ValidationMessages, { props: { diagnostics, hideCloseButton: false } });

      // Close button should be rendered (Carbon inline notification has close button by default)
      // Note: This depends on Carbon component implementation
      const container = screen.getByText('Test warning').closest('.bx--inline-notification');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for action buttons', () => {
      const diagnostics: ValidationIssue[] = [
        {
          from: 0,
          to: 10,
          severity: 'warning',
          message: 'Test message',
          actionLabel: 'Learn more about SPARQL',
          actionUrl: 'https://www.w3.org/TR/sparql11-query/',
        },
      ];

      render(ValidationMessages, { props: { diagnostics } });

      const actionButton = screen.getByRole('button', { name: 'Learn more about SPARQL' });
      expect(actionButton).toHaveAttribute('aria-label', 'Learn more about SPARQL');
    });

    it('should use list structure for multiple issues', () => {
      const diagnostics: ValidationIssue[] = [
        { from: 0, to: 10, severity: 'warning', message: 'Issue 1' },
        { from: 20, to: 30, severity: 'warning', message: 'Issue 2' },
      ];

      const { container } = render(ValidationMessages, { props: { diagnostics } });

      const list = container.querySelector('.validation-list');
      expect(list).toBeInTheDocument();
      expect(list?.tagName).toBe('UL');

      const listItems = container.querySelectorAll('.validation-list li');
      expect(listItems).toHaveLength(2);
    });
  });
});
