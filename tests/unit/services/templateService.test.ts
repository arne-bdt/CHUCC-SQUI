/**
 * Unit tests for Template Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TemplateService,
  defaultTemplates,
  templateService,
} from '../../../src/lib/services/templateService';
import type { TemplateConfig, QueryTemplate } from '../../../src/lib/types';

describe('TemplateService', () => {
  describe('defaultTemplates', () => {
    it('should include default template', () => {
      const defaultTemplate = defaultTemplates.find((t) => t.name === 'default');
      expect(defaultTemplate).toBeDefined();
      expect(defaultTemplate!.query).toContain('SELECT');
      expect(defaultTemplate!.query).toContain('PREFIX');
    });

    it('should include minimal template', () => {
      const minimalTemplate = defaultTemplates.find((t) => t.name === 'minimal');
      expect(minimalTemplate).toBeDefined();
      expect(minimalTemplate!.query).toContain('SELECT');
      expect(minimalTemplate!.query).not.toContain('PREFIX');
    });

    it('should include DESCRIBE template', () => {
      const describeTemplate = defaultTemplates.find((t) => t.name === 'describe');
      expect(describeTemplate).toBeDefined();
      expect(describeTemplate!.query).toContain('DESCRIBE');
    });

    it('should include CONSTRUCT template', () => {
      const constructTemplate = defaultTemplates.find((t) => t.name === 'construct');
      expect(constructTemplate).toBeDefined();
      expect(constructTemplate!.query).toContain('CONSTRUCT');
    });

    it('should include ASK template', () => {
      const askTemplate = defaultTemplates.find((t) => t.name === 'ask');
      expect(askTemplate).toBeDefined();
      expect(askTemplate!.query).toContain('ASK');
    });

    it('should include FOAF template', () => {
      const foafTemplate = defaultTemplates.find((t) => t.name === 'foaf');
      expect(foafTemplate).toBeDefined();
      expect(foafTemplate!.query).toContain('foaf:');
    });

    it('should include Wikidata template', () => {
      const wikidataTemplate = defaultTemplates.find((t) => t.name === 'wikidata');
      expect(wikidataTemplate).toBeDefined();
      expect(wikidataTemplate!.query).toContain('wdt:');
      expect(wikidataTemplate!.query).toContain('wd:');
    });

    it('should include DBpedia template', () => {
      const dbpediaTemplate = defaultTemplates.find((t) => t.name === 'dbpedia');
      expect(dbpediaTemplate).toBeDefined();
      expect(dbpediaTemplate!.query).toContain('dbo:');
    });

    it('should have descriptions for all templates', () => {
      defaultTemplates.forEach((template) => {
        expect(template.description).toBeDefined();
        expect(template.description!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('constructor', () => {
    it('should create instance without config', () => {
      const service = new TemplateService();
      expect(service).toBeInstanceOf(TemplateService);
      expect(service.getDefaultTemplateName()).toBe('default');
    });

    it('should initialize with custom templates', () => {
      const customTemplate: QueryTemplate = {
        name: 'custom',
        description: 'Custom template',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      };
      const config: TemplateConfig = {
        custom: [customTemplate],
      };
      const service = new TemplateService(config);

      const template = service.getTemplate('custom');
      expect(template).toBeDefined();
      expect(template!.name).toBe('custom');
    });

    it('should initialize with custom default template name', () => {
      const config: TemplateConfig = {
        default: 'minimal',
      };
      const service = new TemplateService(config);

      expect(service.getDefaultTemplateName()).toBe('minimal');
      const defaultQuery = service.getDefaultTemplate();
      expect(defaultQuery).toContain('SELECT');
      expect(defaultQuery).not.toContain('PREFIX');
    });
  });

  describe('getAllTemplates', () => {
    it('should return all built-in templates', () => {
      const service = new TemplateService();
      const templates = service.getAllTemplates();

      expect(templates.length).toBeGreaterThanOrEqual(defaultTemplates.length);
      expect(templates).toEqual(expect.arrayContaining(defaultTemplates));
    });

    it('should include custom templates', () => {
      const customTemplate: QueryTemplate = {
        name: 'custom',
        description: 'Custom template',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      };
      const service = new TemplateService({ custom: [customTemplate] });
      const templates = service.getAllTemplates();

      expect(templates).toContainEqual(customTemplate);
      expect(templates.length).toBe(defaultTemplates.length + 1);
    });
  });

  describe('getTemplate', () => {
    it('should return template by name', () => {
      const service = new TemplateService();
      const template = service.getTemplate('default');

      expect(template).toBeDefined();
      expect(template!.name).toBe('default');
    });

    it('should return undefined for unknown template', () => {
      const service = new TemplateService();
      const template = service.getTemplate('unknown');

      expect(template).toBeUndefined();
    });

    it('should find custom templates', () => {
      const customTemplate: QueryTemplate = {
        name: 'custom',
        description: 'Custom template',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      };
      const service = new TemplateService({ custom: [customTemplate] });
      const template = service.getTemplate('custom');

      expect(template).toEqual(customTemplate);
    });
  });

  describe('getDefaultTemplate', () => {
    it('should return default template query', () => {
      const service = new TemplateService();
      const query = service.getDefaultTemplate();

      expect(query).toContain('SELECT');
      expect(query).toContain('PREFIX');
    });

    it('should return configured default template', () => {
      const service = new TemplateService({ default: 'minimal' });
      const query = service.getDefaultTemplate();

      expect(query).toContain('SELECT');
      expect(query).not.toContain('PREFIX');
    });

    it('should fallback to first template if configured name not found', () => {
      const service = new TemplateService({ default: 'nonexistent' });
      const query = service.getDefaultTemplate();

      // Should return first default template as fallback
      expect(query).toBe(defaultTemplates[0].query);
    });
  });

  describe('getTemplateWithPrefixes', () => {
    it('should return template query without modification if no custom prefixes', () => {
      const service = new TemplateService();
      const query = service.getTemplateWithPrefixes('default');

      const defaultTemplate = defaultTemplates.find((t) => t.name === 'default');
      expect(query).toBe(defaultTemplate!.query);
    });

    it('should inject custom prefixes into template', () => {
      const service = new TemplateService();
      const customPrefixes = {
        custom: 'http://example.org/custom/',
      };
      const query = service.getTemplateWithPrefixes('minimal', customPrefixes);

      expect(query).toContain('PREFIX custom: <http://example.org/custom/>');
      expect(query).toContain('SELECT');
    });

    it('should merge custom prefixes with existing prefixes', () => {
      const service = new TemplateService();
      const customPrefixes = {
        custom: 'http://example.org/custom/',
        ex: 'http://example.org/',
      };
      const query = service.getTemplateWithPrefixes('default', customPrefixes);

      expect(query).toContain('PREFIX custom: <http://example.org/custom/>');
      expect(query).toContain('PREFIX ex: <http://example.org/>');
      expect(query).toContain('PREFIX rdf:');
      expect(query).toContain('SELECT');
    });

    it('should allow custom prefixes to override template prefixes', () => {
      const service = new TemplateService();
      const customPrefixes = {
        rdf: 'http://custom-rdf.example/',
      };
      const query = service.getTemplateWithPrefixes('default', customPrefixes);

      expect(query).toContain('PREFIX rdf: <http://custom-rdf.example/>');
    });

    it('should return default template for unknown template name', () => {
      const service = new TemplateService();
      const query = service.getTemplateWithPrefixes('unknown');

      expect(query).toBe(service.getDefaultTemplate());
    });
  });

  describe('addTemplate', () => {
    let service: TemplateService;

    beforeEach(() => {
      service = new TemplateService();
    });

    it('should add new custom template', () => {
      const template: QueryTemplate = {
        name: 'test',
        description: 'Test template',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      };
      service.addTemplate(template);

      const retrieved = service.getTemplate('test');
      expect(retrieved).toEqual(template);
    });

    it('should replace existing custom template with same name', () => {
      const template1: QueryTemplate = {
        name: 'test',
        description: 'First version',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      };
      const template2: QueryTemplate = {
        name: 'test',
        description: 'Second version',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 100',
      };

      service.addTemplate(template1);
      service.addTemplate(template2);

      const retrieved = service.getTemplate('test');
      expect(retrieved).toEqual(template2);
      expect(retrieved!.description).toBe('Second version');
    });
  });

  describe('removeTemplate', () => {
    it('should remove custom template', () => {
      const template: QueryTemplate = {
        name: 'test',
        description: 'Test template',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      };
      const service = new TemplateService({ custom: [template] });

      const removed = service.removeTemplate('test');
      expect(removed).toBe(true);
      expect(service.getTemplate('test')).toBeUndefined();
    });

    it('should return false for non-existent template', () => {
      const service = new TemplateService();
      const removed = service.removeTemplate('nonexistent');
      expect(removed).toBe(false);
    });

    it('should not remove built-in templates', () => {
      const service = new TemplateService();
      const removed = service.removeTemplate('default');

      // Built-in templates are not in customTemplates array, so this returns false
      expect(removed).toBe(false);
      // But built-in template should still exist
      expect(service.getTemplate('default')).toBeDefined();
    });
  });

  describe('getTemplateNames', () => {
    it('should return all template names', () => {
      const service = new TemplateService();
      const names = service.getTemplateNames();

      expect(names).toContain('default');
      expect(names).toContain('minimal');
      expect(names).toContain('describe');
      expect(names).toContain('construct');
      expect(names).toContain('ask');
    });

    it('should include custom template names', () => {
      const template: QueryTemplate = {
        name: 'custom',
        description: 'Custom',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      };
      const service = new TemplateService({ custom: [template] });
      const names = service.getTemplateNames();

      expect(names).toContain('custom');
    });
  });

  describe('setDefaultTemplate', () => {
    it('should change default template', () => {
      const service = new TemplateService();
      service.setDefaultTemplate('minimal');

      expect(service.getDefaultTemplateName()).toBe('minimal');
      const query = service.getDefaultTemplate();
      expect(query).not.toContain('PREFIX');
    });
  });

  describe('getDefaultTemplateName', () => {
    it('should return default template name', () => {
      const service = new TemplateService();
      expect(service.getDefaultTemplateName()).toBe('default');
    });

    it('should return configured default name', () => {
      const service = new TemplateService({ default: 'minimal' });
      expect(service.getDefaultTemplateName()).toBe('minimal');
    });
  });

  describe('generateQuery', () => {
    it('should return template query without variable substitution', () => {
      const service = new TemplateService();
      const query = service.generateQuery('default');

      const defaultTemplate = defaultTemplates.find((t) => t.name === 'default');
      expect(query).toBe(defaultTemplate!.query);
    });

    it('should substitute variables in template', () => {
      const template: QueryTemplate = {
        name: 'parameterized',
        description: 'Template with variables',
        query: 'SELECT * WHERE { ?s ?p {{value}} } LIMIT {{limit}}',
      };
      const service = new TemplateService({ custom: [template] });

      const query = service.generateQuery('parameterized', {
        value: '"test"',
        limit: '50',
      });

      expect(query).toBe('SELECT * WHERE { ?s ?p "test" } LIMIT 50');
    });

    it('should handle multiple occurrences of same variable', () => {
      const template: QueryTemplate = {
        name: 'multi',
        description: 'Multiple variables',
        query: 'SELECT {{var}} WHERE { {{var}} ?p {{var}} }',
      };
      const service = new TemplateService({ custom: [template] });

      const query = service.generateQuery('multi', { var: '?x' });

      expect(query).toBe('SELECT ?x WHERE { ?x ?p ?x }');
    });

    it('should return default template for unknown template name', () => {
      const service = new TemplateService();
      const query = service.generateQuery('unknown');

      expect(query).toBe(service.getDefaultTemplate());
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton templateService instance', () => {
      expect(templateService).toBeInstanceOf(TemplateService);
    });

    it('should be usable without creating new instance', () => {
      const query = templateService.getDefaultTemplate();
      expect(query).toContain('SELECT');
    });
  });

  describe('integration scenarios', () => {
    it('should support complete template workflow', () => {
      const service = new TemplateService();

      // Add custom template
      service.addTemplate({
        name: 'mytemplate',
        description: 'My custom template',
        query: 'PREFIX ex: <http://example.org/>\nSELECT * WHERE { ?s ex:prop ?o }',
      });

      // Get template with additional prefixes
      const query = service.getTemplateWithPrefixes('mytemplate', {
        foaf: 'http://xmlns.com/foaf/0.1/',
      });

      expect(query).toContain('PREFIX ex: <http://example.org/>');
      expect(query).toContain('PREFIX foaf: <http://xmlns.com/foaf/0.1/>');
      expect(query).toContain('SELECT');
    });

    it('should allow configuring custom default template', () => {
      const customTemplate: QueryTemplate = {
        name: 'mydefault',
        description: 'My default',
        query: 'SELECT ?s WHERE { ?s ?p ?o } LIMIT 5',
      };

      const service = new TemplateService({
        custom: [customTemplate],
        default: 'mydefault',
      });

      const query = service.getDefaultTemplate();
      expect(query).toBe(customTemplate.query);
    });
  });
});
