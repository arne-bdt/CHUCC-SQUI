/**
 * Query Template Service
 * Provides default SPARQL query templates and manages custom templates
 */

import type { QueryTemplate, TemplateConfig } from '../types';
import { prefixService } from './prefixService';

/**
 * Built-in query templates
 */
export const defaultTemplates: QueryTemplate[] = [
  {
    name: 'default',
    description: 'Default SELECT query with common prefixes',
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object
}
LIMIT 10`,
  },
  {
    name: 'minimal',
    description: 'Minimal SELECT query without prefixes',
    query: `SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object
}
LIMIT 10`,
  },
  {
    name: 'describe',
    description: 'DESCRIBE query template',
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

DESCRIBE ?resource
WHERE {
  ?resource a ?type
}
LIMIT 10`,
  },
  {
    name: 'construct',
    description: 'CONSTRUCT query template',
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

CONSTRUCT {
  ?subject rdfs:label ?label
}
WHERE {
  ?subject rdfs:label ?label
}
LIMIT 10`,
  },
  {
    name: 'ask',
    description: 'ASK query template',
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

ASK {
  ?subject rdfs:label ?label
}`,
  },
  {
    name: 'foaf',
    description: 'FOAF Person query template',
    query: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?person ?name ?email
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name .
  OPTIONAL { ?person foaf:mbox ?email }
}
LIMIT 10`,
  },
  {
    name: 'wikidata',
    description: 'Wikidata query template',
    query: `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?item ?itemLabel
WHERE {
  ?item wdt:P31 wd:Q5 .  # instance of human
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
}
LIMIT 10`,
  },
  {
    name: 'dbpedia',
    description: 'DBpedia query template',
    query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?resource ?label ?abstract
WHERE {
  ?resource a dbo:Person ;
            rdfs:label ?label ;
            dbo:abstract ?abstract .
  FILTER(LANG(?label) = "en")
  FILTER(LANG(?abstract) = "en")
}
LIMIT 10`,
  },
];

/**
 * Template Service
 * Manages query templates and provides template retrieval functionality
 */
export class TemplateService {
  private customTemplates: QueryTemplate[] = [];
  private defaultTemplateName: string = 'default';

  /**
   * Create a new TemplateService instance
   * @param config - Optional template configuration
   */
  constructor(config?: TemplateConfig) {
    if (config?.custom) {
      this.customTemplates = [...config.custom];
    }
    if (config?.default) {
      this.defaultTemplateName = config.default;
    }
  }

  /**
   * Get all available templates (built-in + custom)
   * @returns Array of all templates
   */
  getAllTemplates(): QueryTemplate[] {
    return [...defaultTemplates, ...this.customTemplates];
  }

  /**
   * Get a template by name
   * @param name - Template name
   * @returns Template or undefined if not found
   */
  getTemplate(name: string): QueryTemplate | undefined {
    return this.getAllTemplates().find((t) => t.name === name);
  }

  /**
   * Get the default template
   * @returns Default template query text
   */
  getDefaultTemplate(): string {
    const template = this.getTemplate(this.defaultTemplateName);
    if (template) {
      return template.query;
    }
    // Fallback to first default template if configured name not found
    return defaultTemplates[0].query;
  }

  /**
   * Get template query with custom prefixes injected
   * @param templateName - Name of the template to use
   * @param customPrefixes - Additional prefixes to inject
   * @returns Template query with prefixes
   */
  getTemplateWithPrefixes(
    templateName: string,
    customPrefixes?: Record<string, string>
  ): string {
    const template = this.getTemplate(templateName);
    if (!template) {
      return this.getDefaultTemplate();
    }

    if (!customPrefixes || Object.keys(customPrefixes).length === 0) {
      return template.query;
    }

    // Parse existing prefixes from template
    const existingPrefixes = prefixService.parsePrefixesFromQuery(template.query);

    // Merge with custom prefixes (custom prefixes take precedence)
    const mergedPrefixes = { ...existingPrefixes, ...customPrefixes };

    // Generate new PREFIX declarations
    const newPrefixDeclarations = prefixService.generatePrefixDeclarations(mergedPrefixes);

    // Remove old PREFIX declarations from template
    const queryWithoutPrefixes = template.query.replace(/PREFIX\s+\w+:\s*<[^>]+>\s*/gi, '');

    // Combine new prefixes with query
    return `${newPrefixDeclarations}\n\n${queryWithoutPrefixes.trim()}`;
  }

  /**
   * Add a custom template
   * @param template - Template to add
   */
  addTemplate(template: QueryTemplate): void {
    // Check if template with this name already exists
    const existingIndex = this.customTemplates.findIndex((t) => t.name === template.name);
    if (existingIndex >= 0) {
      // Replace existing template
      this.customTemplates[existingIndex] = template;
    } else {
      // Add new template
      this.customTemplates.push(template);
    }
  }

  /**
   * Remove a custom template
   * @param name - Name of template to remove
   * @returns True if template was removed, false if not found
   */
  removeTemplate(name: string): boolean {
    const index = this.customTemplates.findIndex((t) => t.name === name);
    if (index >= 0) {
      this.customTemplates.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get list of template names
   * @returns Array of template names
   */
  getTemplateNames(): string[] {
    return this.getAllTemplates().map((t) => t.name);
  }

  /**
   * Set the default template name
   * @param name - Name of template to use as default
   */
  setDefaultTemplate(name: string): void {
    this.defaultTemplateName = name;
  }

  /**
   * Get the current default template name
   * @returns Default template name
   */
  getDefaultTemplateName(): string {
    return this.defaultTemplateName;
  }

  /**
   * Generate a query from template with variable substitution
   * @param templateName - Name of template to use
   * @param variables - Variables to substitute in template
   * @returns Query with variables substituted
   */
  generateQuery(templateName: string, variables?: Record<string, string>): string {
    let query = this.getTemplate(templateName)?.query || this.getDefaultTemplate();

    if (variables) {
      // Simple variable substitution: {{varName}} -> value
      Object.entries(variables).forEach(([key, value]) => {
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        query = query.replace(pattern, value);
      });
    }

    return query;
  }
}

/**
 * Singleton instance for global use
 */
export const templateService = new TemplateService();
