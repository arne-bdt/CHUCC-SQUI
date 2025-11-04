/**
 * Integration tests for FeatureList component
 */
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import FeatureList from '../../src/lib/components/Capabilities/FeatureList.svelte';
import { ServiceFeature } from '../../src/lib/types/serviceDescription';

describe('FeatureList', () => {
  it('should render features as tags', () => {
    const features = [
      ServiceFeature.DereferencesURIs,
      ServiceFeature.BasicFederatedQuery,
    ];
    render(FeatureList, { props: { features } });

    expect(screen.getByText('URI Dereferencing')).toBeInTheDocument();
    expect(screen.getByText('Federated Query (SERVICE)')).toBeInTheDocument();
  });

  it('should render all feature types with correct labels', () => {
    const features = [
      ServiceFeature.DereferencesURIs,
      ServiceFeature.UnionDefaultGraph,
      ServiceFeature.RequiresDataset,
      ServiceFeature.EmptyGraphs,
      ServiceFeature.BasicFederatedQuery,
    ];
    render(FeatureList, { props: { features } });

    expect(screen.getByText('URI Dereferencing')).toBeInTheDocument();
    expect(screen.getByText('Union Default Graph')).toBeInTheDocument();
    expect(screen.getByText('Requires Dataset')).toBeInTheDocument();
    expect(screen.getByText('Empty Graphs')).toBeInTheDocument();
    expect(screen.getByText('Federated Query (SERVICE)')).toBeInTheDocument();
  });

  it('should show empty state when no features', () => {
    const features: string[] = [];
    render(FeatureList, { props: { features } });

    expect(screen.getByText('No special features reported')).toBeInTheDocument();
  });

  it('should handle single feature', () => {
    const features = [ServiceFeature.UnionDefaultGraph];
    render(FeatureList, { props: { features } });

    expect(screen.getByText('Union Default Graph')).toBeInTheDocument();
  });

  it('should extract feature name from URI', () => {
    const features = ['http://www.w3.org/ns/sparql-service-description#DereferencesURIs'];
    render(FeatureList, { props: { features } });

    expect(screen.getByText('URI Dereferencing')).toBeInTheDocument();
  });
});
