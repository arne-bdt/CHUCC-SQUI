import type { Meta, StoryObj } from '@storybook/sveltekit';
import SparqlEditor from './SparqlEditor.svelte';

// Define component props interface for TypeScript support
interface SparqlEditorProps {
  initialValue?: string;
  readonly?: boolean;
  placeholder?: string;
  class?: string;
}

/**
 * SPARQL Editor component built on CodeMirror 6.
 * Features syntax highlighting, line numbers, bracket matching, and full SPARQL language support.
 * Integrates with Carbon Design System themes and supports dynamic theme switching.
 */
const meta = {
  title: 'Components/Editor/SparqlEditor',
  component: SparqlEditor,
  tags: ['autodocs'],
  argTypes: {
    initialValue: {
      control: 'text',
      description: 'Initial SPARQL query text to display in the editor',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the editor is read-only',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when editor is empty',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes to apply to the editor container',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Code editor component with full SPARQL syntax highlighting, line numbers, code folding, and bracket matching. Supports all Carbon themes and integrates with the query store.',
      },
    },
  },
} satisfies Meta<SparqlEditorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty editor.
 * Shows the basic editor structure with line numbers and syntax highlighting ready.
 */
export const Default: Story = {
  args: {},
};

/**
 * Editor with a simple SELECT query.
 * Demonstrates basic SPARQL syntax highlighting for keywords, variables, and patterns.
 */
export const WithSimpleQuery: Story = {
  args: {
    initialValue: 'SELECT * WHERE { ?s ?p ?o }',
  },
};

/**
 * Editor with a complete SPARQL query including PREFIX declarations.
 * Shows highlighting for prefixes, IRIs, and query structure.
 */
export const WithPrefixQuery: Story = {
  args: {
    initialValue: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subject ?label
WHERE {
  ?subject rdf:type ?type .
  ?subject rdfs:label ?label .
}
LIMIT 100`,
  },
};

/**
 * Editor with a complex query featuring FILTER, OPTIONAL, and aggregates.
 * Demonstrates advanced SPARQL syntax highlighting including functions and expressions.
 */
export const WithComplexQuery: Story = {
  args: {
    initialValue: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?name (COUNT(?friend) AS ?friendCount)
WHERE {
  ?person foaf:name ?name ;
          foaf:age ?age .

  OPTIONAL {
    ?person foaf:knows ?friend .
    ?friend foaf:name ?friendName .
  }

  FILTER(?age >= 18 && ?age <= 65)
  FILTER(LANG(?name) = "en" || LANG(?name) = "")
}
GROUP BY ?name
HAVING (COUNT(?friend) > 5)
ORDER BY DESC(?friendCount)
LIMIT 50`,
  },
};

/**
 * Editor with a CONSTRUCT query.
 * Shows syntax highlighting for RDF graph construction patterns.
 */
export const WithConstructQuery: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

CONSTRUCT {
  ?person ex:hasRelationship ?friend .
  ?friend ex:hasRelationship ?person .
}
WHERE {
  ?person foaf:knows ?friend .
}`,
  },
};

/**
 * Editor with an ASK query.
 * Demonstrates boolean query syntax highlighting.
 */
export const WithAskQuery: Story = {
  args: {
    initialValue: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex: <http://example.org/>

ASK {
  ?resource rdf:type ex:Person .
  ?resource ex:hasAge ?age .
  FILTER(?age > 21)
}`,
  },
};

/**
 * Editor in read-only mode.
 * Useful for displaying query results or examples without allowing edits.
 */
export const ReadOnly: Story = {
  args: {
    readonly: true,
    initialValue: `SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object .
}
LIMIT 10`,
  },
};

/**
 * Editor with placeholder text.
 * Shows helpful text when the editor is empty, disappears when typing begins.
 */
export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Enter your SPARQL query here...',
  },
};

/**
 * Editor with a query containing comments.
 * Demonstrates comment syntax highlighting with # character.
 */
export const WithComments: Story = {
  args: {
    initialValue: `# This query finds all people and their ages
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?name ?age
WHERE {
  # Match people with names
  ?person foaf:name ?name .

  # Optionally get their age if available
  OPTIONAL {
    ?person foaf:age ?age .
  }
}
# Order by name alphabetically
ORDER BY ?name`,
  },
};

/**
 * Editor with string literals and language tags.
 * Shows highlighting for different types of literal values.
 */
export const WithLiterals: Story = {
  args: {
    initialValue: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?resource ?label ?description
WHERE {
  ?resource rdfs:label "Example"@en .
  ?resource rdfs:comment 'This is a description'@en .
  ?resource ex:value 42 .
  ?resource ex:price 19.99 .
  ?resource ex:scientific 1.23e10 .
}`,
  },
};

/**
 * Editor with UNION and subqueries.
 * Demonstrates nested query structure highlighting.
 */
export const WithUnionQuery: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>

SELECT ?item ?type
WHERE {
  {
    ?item a ex:TypeA .
    BIND(ex:TypeA AS ?type)
  }
  UNION
  {
    ?item a ex:TypeB .
    BIND(ex:TypeB AS ?type)
  }
  UNION
  {
    ?item a ex:TypeC .
    BIND(ex:TypeC AS ?type)
  }
}`,
  },
};

/**
 * White theme (default).
 * Light background with dark text and syntax colors.
 */
export const WhiteTheme: Story = {
  args: {
    initialValue: 'SELECT * WHERE { ?s ?p ?o }',
  },
  parameters: {
    backgrounds: { default: 'white' },
  },
};

/**
 * Gray 10 theme.
 * Light theme with slightly darker background.
 */
export const G10Theme: Story = {
  args: {
    initialValue: 'SELECT * WHERE { ?s ?p ?o }',
  },
  parameters: {
    backgrounds: { default: 'g10' },
  },
};

/**
 * Gray 90 dark theme.
 * Dark background with light text and vibrant syntax colors.
 */
export const G90Theme: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>

SELECT ?name ?value
WHERE {
  ?entity ex:name ?name ;
          ex:value ?value .
  FILTER(?value > 100)
}
ORDER BY DESC(?value)`,
  },
  parameters: {
    backgrounds: { default: 'g90' },
  },
};

/**
 * Gray 100 darkest theme.
 * Maximum contrast dark theme for extended viewing.
 */
export const G100Theme: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>

SELECT ?name ?value
WHERE {
  ?entity ex:name ?name ;
          ex:value ?value .
  FILTER(?value > 100)
}
ORDER BY DESC(?value)`,
  },
  parameters: {
    backgrounds: { default: 'g100' },
  },
};

/**
 * Large query demonstrating editor performance.
 * Shows that the editor handles substantial code blocks smoothly.
 */
export const LargeQuery: Story = {
  args: {
    initialValue: `# Complex analytical query with multiple joins and filters
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <http://example.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?personName ?avgAge ?friendCount ?maxSalary
WHERE {
  # Main person pattern
  ?person rdf:type ex:Person ;
          foaf:name ?personName ;
          ex:birthDate ?birthDate ;
          ex:department ?dept .

  # Calculate age
  BIND(YEAR(NOW()) - YEAR(?birthDate) AS ?age)

  # Get department info
  ?dept rdfs:label ?deptName ;
        ex:budget ?budget .

  # Count friends
  {
    SELECT ?person (COUNT(?friend) AS ?friendCount)
    WHERE {
      ?person foaf:knows ?friend .
      ?friend rdf:type ex:Person .
    }
    GROUP BY ?person
  }

  # Calculate average age in department
  {
    SELECT ?dept (AVG(?deptAge) AS ?avgAge)
    WHERE {
      ?deptPerson ex:department ?dept ;
                  ex:birthDate ?deptBirthDate .
      BIND(YEAR(NOW()) - YEAR(?deptBirthDate) AS ?deptAge)
    }
    GROUP BY ?dept
  }

  # Find max salary in department
  {
    SELECT ?dept (MAX(?salary) AS ?maxSalary)
    WHERE {
      ?employee ex:department ?dept ;
                ex:salary ?salary .
    }
    GROUP BY ?dept
  }

  # Optional contact information
  OPTIONAL {
    ?person foaf:email ?email .
  }

  OPTIONAL {
    ?person foaf:phone ?phone .
  }

  # Apply filters
  FILTER(?age >= 21 && ?age <= 65)
  FILTER(?budget > 100000)
  FILTER(REGEX(?personName, "^[A-Z]", "i"))
  FILTER(LANG(?deptName) = "en")
}
GROUP BY ?personName ?avgAge ?friendCount ?maxSalary
HAVING (?friendCount > 3)
ORDER BY DESC(?maxSalary) ?personName
LIMIT 100
OFFSET 0`,
  },
};

/**
 * Editor with custom CSS class.
 * Demonstrates the ability to apply custom styling.
 */
export const WithCustomClass: Story = {
  args: {
    class: 'custom-editor-styling',
    initialValue: 'SELECT * WHERE { ?s ?p ?o }',
  },
};

/**
 * Interactive Theme Switcher
 * Demonstrates automatic synchronization between Carbon Design System theme
 * and CodeMirror editor theme. The editor uses CSS custom properties from
 * Carbon Design Tokens, so theme changes are immediate and automatic.
 *
 * Try switching themes using the theme selector in the toolbar to see the
 * editor colors update in real-time. Light themes (White, Gray 10) use dark
 * text on light backgrounds, while dark themes (Gray 90, Gray 100) use light
 * text on dark backgrounds.
 *
 * Mapping:
 * - White, Gray 10 → dark=false (light mode)
 * - Gray 90, Gray 100 → dark=true (dark mode)
 */
export const InteractiveThemeSwitcher: Story = {
  args: {
    initialValue: `# SPARQL Theme Demo
# Change the theme using the toolbar selector above!
# Notice how the syntax highlighting adapts automatically.

PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?email
WHERE {
  # Find all people
  ?person a foaf:Person ;
          foaf:name ?name .

  # Optional email
  OPTIONAL { ?person foaf:mbox ?email }

  # Filter by name pattern
  FILTER(CONTAINS(LCASE(?name), "john"))
}
ORDER BY ?name
LIMIT 100`,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates the automatic theme synchronization between Carbon Design System and the CodeMirror editor. The editor theme is built using CSS custom properties (CSS variables) that reference Carbon Design Tokens, ensuring perfect color harmony across all 4 Carbon themes without any JavaScript theme switching logic.',
      },
    },
  },
};

/**
 * Graph Name Auto-completion for FROM Clause
 * Demonstrates intelligent graph IRI suggestions when typing in FROM clauses.
 * Type "FROM " to see available graphs from the service description.
 *
 * Features:
 * - Shows both default and named graphs for FROM
 * - Displays metadata (triple count, entailment regime)
 * - Filters as you type
 * - Keyboard navigation (arrow keys, Enter)
 */
export const GraphNameCompletionFROM: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>

SELECT *
FROM `,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type after "FROM " to see graph auto-completion with metadata. The completion shows all available graphs (both default and named) from the service description, including triple counts and entailment regimes.',
      },
    },
    // Ensure this story is recognized by the decorator
    graphCompletion: 'from',
  },
};

/**
 * Graph Name Auto-completion for FROM NAMED Clause
 * Demonstrates graph IRI suggestions specifically for FROM NAMED clauses.
 * Type "FROM NAMED " to see only named graphs.
 *
 * Features:
 * - Shows only named graphs (no default graphs)
 * - Rich metadata display
 * - Context-aware filtering
 */
export const GraphNameCompletionFromNamed: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>

SELECT *
FROM NAMED `,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type after "FROM NAMED " to see only named graph completions. Notice that the default graph is excluded for FROM NAMED clauses, showing only the explicitly named graphs available in the endpoint.',
      },
    },
  },
};

/**
 * Graph Name Completion with Partial Input
 * Demonstrates filtering of graph completions as you type.
 * Start typing a partial graph IRI to see filtered suggestions.
 *
 * Features:
 * - Real-time filtering based on partial input
 * - Works with both full IRIs and partial IRIs
 * - Case-insensitive matching
 */
export const GraphNameCompletionFiltered: Story = {
  args: {
    initialValue: `PREFIX ex: <http://example.org/>

SELECT *
FROM NAMED <http://example.org/graph/p`,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The partial IRI "http://example.org/graph/p" filters the suggestions to show only graphs starting with "p" (people, places, products). This demonstrates the real-time filtering capability of the graph name completion.',
      },
    },
  },
};
