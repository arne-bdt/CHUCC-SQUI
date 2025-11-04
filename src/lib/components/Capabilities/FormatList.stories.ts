/**
 * Storybook stories for FormatList component
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import FormatList from './FormatList.svelte';

const meta = {
  title: 'Components/Capabilities/FormatList',
  component: FormatList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<FormatList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommonResultFormats: Story = {
  args: {
    formats: [
      'application/sparql-results+json',
      'application/sparql-results+xml',
      'text/csv',
      'text/tab-separated-values',
    ],
  },
};

export const RDFFormats: Story = {
  args: {
    formats: [
      'text/turtle',
      'application/rdf+xml',
      'application/n-triples',
      'application/n-quads',
      'application/ld+json',
    ],
  },
};

export const MixedFormats: Story = {
  args: {
    formats: [
      'application/sparql-results+json',
      'text/csv',
      'text/turtle',
      'application/rdf+xml',
      'text/html',
    ],
  },
};

export const SingleFormat: Story = {
  args: {
    formats: ['application/sparql-results+json'],
  },
};

export const NoFormats: Story = {
  args: {
    formats: [],
  },
};
