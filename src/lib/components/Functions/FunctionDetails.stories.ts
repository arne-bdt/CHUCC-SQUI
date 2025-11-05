import type { Meta, StoryObj } from '@storybook/svelte';
import FunctionDetails from './FunctionDetails.svelte';
import type { ExtensionFunction } from '$lib/types';

const meta = {
  title: 'Components/Functions/FunctionDetails',
  component: FunctionDetails,
  tags: ['autodocs'],
  argTypes: {
    func: { control: 'object' },
  },
} satisfies Meta<FunctionDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock function data
const simpleFunction: ExtensionFunction = {
  uri: 'http://jena.apache.org/ARQ/function#now',
  label: 'Current Time',
  comment: 'Returns the current date and time as an xsd:dateTime value',
  returnType: 'xsd:dateTime',
};

const complexFunction: ExtensionFunction = {
  uri: 'http://example.org/geo#distance',
  label: 'Geographic Distance',
  comment:
    'Calculates the great-circle distance between two geographic points using the Haversine formula',
  parameters: [
    {
      name: 'point1',
      type: 'geo:Point',
      description: 'First geographic point (latitude, longitude)',
    },
    {
      name: 'point2',
      type: 'geo:Point',
      description: 'Second geographic point (latitude, longitude)',
    },
  ],
  returnType: 'xsd:double',
  documentationUrl: 'https://example.org/docs/geo/distance',
};

const functionWithExamples: ExtensionFunction = {
  uri: 'http://jena.apache.org/text#query',
  label: 'Full-Text Search',
  comment:
    'Performs full-text search against indexed literals using Lucene query syntax',
  parameters: [
    {
      name: 'property',
      type: 'rdf:Property',
      description: 'The property to search (must be indexed)',
    },
    {
      name: 'query',
      type: 'xsd:string',
      description: 'Lucene query string',
    },
    {
      name: 'limit',
      type: 'xsd:integer',
      optional: true,
      description: 'Maximum number of results (default: 10)',
    },
  ],
  returnType: 'xsd:boolean',
  examples: [
    `PREFIX text: <http://jena.apache.org/text#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?s ?label
WHERE {
  ?s text:query (rdfs:label "sparql") .
  ?s rdfs:label ?label .
}`,
    `PREFIX text: <http://jena.apache.org/text#>

SELECT ?s ?score
WHERE {
  ?s text:query (rdfs:label "semantic web" 5) .
  ?s text:score ?score .
}
ORDER BY DESC(?score)`,
  ],
  documentationUrl: 'https://jena.apache.org/documentation/query/text-query.html',
};

const functionWithOptionalParams: ExtensionFunction = {
  uri: 'http://example.org/string#format',
  label: 'Format String',
  comment: 'Formats a value according to a specified pattern',
  parameters: [
    {
      name: 'value',
      type: 'xsd:string',
      description: 'The value to format',
    },
    {
      name: 'pattern',
      type: 'xsd:string',
      optional: true,
      description: 'Format pattern (default: "%s")',
    },
    {
      name: 'locale',
      type: 'xsd:string',
      optional: true,
      description: 'Locale for formatting (default: system locale)',
    },
  ],
  returnType: 'xsd:string',
};

export const SimpleFunction: Story = {
  args: {
    func: simpleFunction,
  },
};

export const ComplexFunction: Story = {
  args: {
    func: complexFunction,
  },
};

export const FunctionWithExamples: Story = {
  args: {
    func: functionWithExamples,
  },
};

export const FunctionWithOptionalParams: Story = {
  args: {
    func: functionWithOptionalParams,
  },
};

export const MinimalFunction: Story = {
  args: {
    func: {
      uri: 'http://example.org/fn#custom',
    },
  },
};

export const FunctionWithoutDocumentation: Story = {
  args: {
    func: {
      uri: 'http://example.org/math#add',
      label: 'Addition',
      comment: 'Adds two numbers',
      parameters: [
        { name: 'x', type: 'xsd:double' },
        { name: 'y', type: 'xsd:double' },
      ],
      returnType: 'xsd:double',
    },
  },
};
