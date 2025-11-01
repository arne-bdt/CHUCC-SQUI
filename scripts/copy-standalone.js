/**
 * Build script for standalone distribution
 * Copies built files and standalone.html to dist-standalone directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const standaloneDir = path.join(rootDir, 'dist-standalone');

// Create standalone directory
if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
}

// Copy all files from dist to dist-standalone
console.log('Copying build files...');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(standaloneDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ ${file}`);
  }
} else {
  console.error('Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Copy standalone.html
console.log('Copying standalone.html...');
const standaloneHtmlSrc = path.join(rootDir, 'standalone.html');
const standaloneHtmlDest = path.join(standaloneDir, 'index.html');

if (fs.existsSync(standaloneHtmlSrc)) {
  let html = fs.readFileSync(standaloneHtmlSrc, 'utf-8');

  // Update the import path to use relative path
  html = html.replace(
    "await import('./dist/sparql-query-ui.js')",
    "await import('./sparql-query-ui.js')"
  );

  fs.writeFileSync(standaloneHtmlDest, html);
  console.log('  ✓ index.html');
} else {
  console.error('Error: standalone.html not found.');
  process.exit(1);
}

// Create a simple README for standalone
const readmeContent = `# SQUI Standalone Distribution

This is a standalone distribution of SQUI (SPARQL Query UI).

## Usage

### Option 1: Serve with any HTTP server

\`\`\`bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
\`\`\`

Then open http://localhost:8000 in your browser.

### Option 2: Deploy to web server

Copy all files in this directory to your web server.

## URL Parameters

Customize the interface using URL parameters:

- \`?endpoint=<url>\` - Set default SPARQL endpoint
- \`?query=<sparql>\` - Set default query (URL encoded)
- \`?theme=<white|g10|g90|g100>\` - Set Carbon theme
- \`?hideSelector=true\` - Hide endpoint selector
- \`?disablePersistence=true\` - Disable localStorage

### Examples

\`\`\`
# DBpedia with dark theme
index.html?endpoint=https://dbpedia.org/sparql&theme=g100

# Wikidata with custom query
index.html?endpoint=https://query.wikidata.org/sparql&query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%2010

# Fixed endpoint (no selector)
index.html?endpoint=https://dbpedia.org/sparql&hideSelector=true
\`\`\`

## Files

- \`index.html\` - Main HTML file
- \`sparql-query-ui.js\` - Application JavaScript
- \`sparql-query-ui.css\` - Application styles
- \`sparql-query-ui.umd.cjs\` - UMD build (for older browsers)

## Documentation

- GitHub: https://github.com/yourusername/sparql-query-ui
- NPM: https://www.npmjs.com/package/sparql-query-ui

## License

Apache License 2.0
`;

fs.writeFileSync(path.join(standaloneDir, 'README.md'), readmeContent);
console.log('  ✓ README.md');

console.log('\n✓ Standalone build complete!');
console.log(`\nOutput directory: ${standaloneDir}`);
console.log('\nTo preview:');
console.log('  npm run preview:standalone');
console.log('\nOr serve the dist-standalone directory with any HTTP server.');
