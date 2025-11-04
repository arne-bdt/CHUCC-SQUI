/**
 * Storybook stories for ExtensionList component
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import ExtensionList from './ExtensionList.svelte';
import type { ExtensionFunction } from '$lib/types/serviceDescription';

const meta = {
  title: 'Components/Capabilities/ExtensionList',
  component: ExtensionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<ExtensionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockExtensions: ExtensionFunction[] = [
  {
    uri: 'http://example.org/functions#customFunction',
    label: 'customFunction',
    comment: 'A custom SPARQL extension function for processing strings',
  },
  {
    uri: 'http://example.org/functions#geoDistance',
    label: 'geoDistance',
    comment: 'Calculate distance between two geographic points in kilometers',
  },
  {
    uri: 'http://example.org/functions#dateFormat',
    label: 'dateFormat',
  },
];

const mockAggregates: ExtensionFunction[] = [
  {
    uri: 'http://example.org/aggregates#median',
    label: 'MEDIAN',
    comment: 'Calculate the median value of a numeric set',
  },
  {
    uri: 'http://example.org/aggregates#mode',
    label: 'MODE',
    comment: 'Find the most frequently occurring value',
  },
];

export const MultipleFunctions: Story = {
  args: {
    items: mockExtensions,
    type: 'function',
  },
};

export const SingleFunction: Story = {
  args: {
    items: [mockExtensions[0]],
    type: 'function',
  },
};

export const FunctionWithoutComment: Story = {
  args: {
    items: [mockExtensions[2]],
    type: 'function',
  },
};

export const MultipleAggregates: Story = {
  args: {
    items: mockAggregates,
    type: 'aggregate',
  },
};

export const NoExtensions: Story = {
  args: {
    items: [],
    type: 'function',
  },
};
