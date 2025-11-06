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

// Helper function to recursively copy directory
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy all files from dist to dist-standalone
console.log('Copying build files...');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(standaloneDir, file);

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
      console.log(`  ✓ ${file}/ (directory)`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${file}`);
    }
  }
} else {
  console.error('Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Copy Carbon CSS files
console.log('Copying Carbon CSS files...');
const carbonCssDir = path.join(rootDir, 'node_modules/carbon-components-svelte/css');
const carbonCssFiles = ['all.css', 'white.css', 'g10.css', 'g90.css', 'g100.css'];

// Create css directory if it doesn't exist
const cssDir = path.join(standaloneDir, 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

for (const file of carbonCssFiles) {
  const srcPath = path.join(carbonCssDir, file);
  const destPath = path.join(cssDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ css/${file}`);
  } else {
    console.warn(`  ⚠ Warning: ${file} not found in node_modules`);
  }
}

// Create fonts-override.css for offline font support
const fontsOverrideCss = `/**
 * Font Override for Offline/Air-Gapped Deployments
 *
 * This file overrides Carbon Design System's IBM Plex font references
 * to use system fonts instead, eliminating external CDN dependencies.
 *
 * For production deployments that require IBM Plex fonts, download them
 * from https://github.com/IBM/plex and host them locally.
 */

/* Override IBM Plex Sans with system font stack */
@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 400;
  src: local('');
  /* Use system fonts instead */
}

@font-face {
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 600;
  src: local('');
  /* Use system fonts instead */
}

/* Apply system font stack */
body,
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important;
}

/* Override Carbon's font-family declarations */
.bx--body,
.cds--body,
[class*="bx--"],
[class*="cds--"] {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
}
`;

fs.writeFileSync(path.join(cssDir, 'fonts-override.css'), fontsOverrideCss);
console.log('  ✓ css/fonts-override.css (system fonts fallback)');

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

  // Ensure CSS link points to local file (handle both CDN and local references)
  html = html.replace(
    /<link rel="stylesheet" href="https:\/\/unpkg\.com\/carbon-components-svelte@[\d.]+\/css\/all\.css">/,
    '<link rel="stylesheet" href="./css/all.css">'
  );

  // Add fonts-override.css after Carbon CSS
  html = html.replace(
    /(<link rel="stylesheet" href="\.\/css\/all\.css">)/,
    '$1\n  <link rel="stylesheet" href="./css/fonts-override.css">'
  );

  // Also update the comment if present
  html = html.replace(
    /<!-- Carbon Design System Styles -->/,
    '<!-- Carbon Design System Styles (loaded locally for offline support) -->'
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

## Offline/Air-Gapped Deployment

SQUI standalone distribution is completely self-contained:

- ✅ No CDN dependencies
- ✅ No external network requests for static assets
- ✅ Works in isolated/air-gapped environments
- ✅ All styles and scripts bundled locally

Simply copy the entire directory to your server or environment.

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
- \`css/\` - Carbon Design System styles (all.css, white.css, g10.css, g90.css, g100.css)

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
