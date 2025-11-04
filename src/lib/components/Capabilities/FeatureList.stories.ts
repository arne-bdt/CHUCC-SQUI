/**
 * Storybook stories for FeatureList component
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import FeatureList from './FeatureList.svelte';
import { ServiceFeature } from '$lib/types/serviceDescription';

const meta = {
  title: 'Components/Capabilities/FeatureList',
  component: FeatureList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<FeatureList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFeatures: Story = {
  args: {
    features: [
      ServiceFeature.DereferencesURIs,
      ServiceFeature.UnionDefaultGraph,
      ServiceFeature.RequiresDataset,
      ServiceFeature.EmptyGraphs,
      ServiceFeature.BasicFederatedQuery,
    ],
  },
};

export const CommonFeatures: Story = {
  args: {
    features: [
      ServiceFeature.DereferencesURIs,
      ServiceFeature.BasicFederatedQuery,
    ],
  },
};

export const SingleFeature: Story = {
  args: {
    features: [ServiceFeature.UnionDefaultGraph],
  },
};

export const NoFeatures: Story = {
  args: {
    features: [],
  },
};
