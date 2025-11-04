/**
 * Storybook stories for LanguageSupport component
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import LanguageSupport from './LanguageSupport.svelte';
import { SPARQLLanguage } from '$lib/types/serviceDescription';

const meta = {
  title: 'Components/Capabilities/LanguageSupport',
  component: LanguageSupport,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<LanguageSupport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSupported: Story = {
  args: {
    languages: [
      SPARQLLanguage.SPARQL10Query,
      SPARQLLanguage.SPARQL11Query,
      SPARQLLanguage.SPARQL11Update,
    ],
  },
};

export const OnlySPARQL11Query: Story = {
  args: {
    languages: [SPARQLLanguage.SPARQL11Query],
  },
};

export const QueryOnly: Story = {
  args: {
    languages: [SPARQLLanguage.SPARQL10Query, SPARQLLanguage.SPARQL11Query],
  },
};

export const NoneSupported: Story = {
  args: {
    languages: [],
  },
};
