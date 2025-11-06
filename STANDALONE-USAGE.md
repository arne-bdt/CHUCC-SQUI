# SQUI Standalone Usage Guide

This guide explains how to use SQUI (SPARQL Query UI) as a standalone web component without a build system.

## Quick Start

### 1. Include Required Files

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SPARQL Query UI</title>

  <!-- SQUI CSS -->
  <link rel="stylesheet" href="./dist/sparql-query-ui.css" />

  <style>
    body { margin: 0; padding: 0; }
    #app { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="app"></div>

  <!-- Load SQUI as ES Module -->
  <script type="module">
    import SparqlQueryUI from './dist/sparql-query-ui.js';

    // Initialize SQUI
    const squi = new SparqlQueryUI({
      target: document.getElementById('app'),
      props: {
        endpoint: {
          url: 'https://dbpedia.org/sparql',
          hideSelector: false
        },
        theme: {
          theme: 'white' // 'white' | 'g10' | 'g90' | 'g100'
        },
        features: {
          enableTabs: true,
          enableFilters: true,
          enableDownloads: true,
          enableSharing: false,
          enableHistory: true
        },
        limits: {
          maxRows: 100000,
          chunkSize: 1000,
          timeout: 30000
        }
      }
    });
  </script>
</body>
</html>
```

### 2. Required Files

Copy these files from the build output to your web server:

```
dist/
├── sparql-query-ui.js      # Main library file
├── sparql-query-ui.css     # Styles
├── resultsParser.worker-*.js  # Web Worker for parsing results
└── assets/                 # Font files and other assets
    └── css/
        └── fonts/          # IBM Plex fonts
```

## Configuration Options

### Endpoint Configuration

```javascript
endpoint: {
  url: string,           // SPARQL endpoint URL (required)
  hideSelector: boolean  // Hide endpoint selector UI (optional, default: false)
}
```

**Example:**
```javascript
endpoint: {
  url: 'https://query.wikidata.org/sparql',
  hideSelector: false  // Allow users to change endpoint
}
```

### Theme Configuration

```javascript
theme: {
  theme: 'white' | 'g10' | 'g90' | 'g100'  // Carbon Design System theme
}
```

**Themes:**
- `'white'` - Light theme (default)
- `'g10'` - Light gray theme
- `'g90'` - Dark gray theme
- `'g100'` - Dark theme

### Feature Flags

```javascript
features: {
  enableTabs: boolean,       // Multi-tab query interface (default: true)
  enableFilters: boolean,    // Result filtering (default: true)
  enableDownloads: boolean,  // Download results (default: true)
  enableSharing: boolean,    // Share queries (default: false)
  enableHistory: boolean     // Query history (default: true)
}
```

### Limits Configuration

```javascript
limits: {
  maxRows: number,      // Maximum result rows (default: 100000)
  chunkSize: number,    // Chunk size for streaming (default: 1000)
  timeout: number       // Query timeout in milliseconds (default: 30000)
}
```

## Common Issues

### CORS Errors with `file://` Protocol

**Problem:**
```
Access to script at 'file:///path/to/sparql-query-ui.js' from origin 'null'
has been blocked by CORS policy
```

**Solution:**
ES modules cannot be loaded from `file://` URLs due to browser security policies.
You must serve the files over HTTP/HTTPS.

**Quick Fix:** Use a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using SQUI's built-in demo server
npm run demo  # Serves on http://localhost:3030
```

Then open `http://localhost:8000` in your browser.

### Missing Fonts or Styles

**Problem:** Fonts don't load or UI looks broken.

**Solution:** Ensure the entire `dist/` directory structure is preserved, including:
- `dist/assets/css/fonts/` directory with IBM Plex fonts
- Proper relative paths in CSS files

### TypeError: Cannot read properties of undefined

**Problem:**
```
TypeError: Cannot read properties of undefined (reading 'endpoint')
```

**Solution:** Ensure you're passing the `props` object correctly:

```javascript
// ✅ CORRECT
new SparqlQueryUI({
  target: document.getElementById('app'),
  props: {
    endpoint: { url: 'https://example.com/sparql' }
  }
});

// ❌ WRONG - Missing 'props' wrapper
new SparqlQueryUI({
  target: document.getElementById('app'),
  endpoint: { url: 'https://example.com/sparql' }
});
```

## GitHub Pages Deployment

### 1. Build the Library

```bash
npm run build
```

### 2. Create `index.html` in Project Root

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SPARQL Query UI</title>
  <link rel="stylesheet" href="./dist/sparql-query-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    #app { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import SparqlQueryUI from './dist/sparql-query-ui.js';

    new SparqlQueryUI({
      target: document.getElementById('app'),
      props: {
        endpoint: {
          url: 'https://dbpedia.org/sparql'
        }
      }
    });
  </script>
</body>
</html>
```

### 3. Commit `dist/` Directory

Add `dist/` to your repository:

```bash
git add dist/ index.html
git commit -m "Add built files for GitHub Pages"
git push
```

### 4. Configure GitHub Pages

1. Go to repository Settings → Pages
2. Select branch (e.g., `main`)
3. Select root directory `/`
4. Save

Your site will be available at `https://username.github.io/repository-name/`

## Advanced Usage

### Accessing Component API

```javascript
const squi = new SparqlQueryUI({
  target: document.getElementById('app'),
  props: { /* config */ }
});

// Component is now mounted
console.log('SQUI initialized:', squi);

// Access component methods (if exposed)
// squi.$set({ endpoint: { url: 'new-endpoint' } });

// Destroy component when done
// squi.$destroy();
```

### Multiple Instances

You can create multiple SQUI instances on the same page:

```javascript
const squi1 = new SparqlQueryUI({
  target: document.getElementById('app1'),
  props: {
    endpoint: { url: 'https://dbpedia.org/sparql' },
    instanceId: 'dbpedia-instance'
  }
});

const squi2 = new SparqlQueryUI({
  target: document.getElementById('app2'),
  props: {
    endpoint: { url: 'https://query.wikidata.org/sparql' },
    instanceId: 'wikidata-instance'
  }
});
```

**Important:** Set unique `instanceId` for each instance to prevent localStorage conflicts.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires ES2020 support and ES modules.

## Testing Locally

Use the included demo server:

```bash
# Build the library
npm run build

# Start demo server
npm run demo

# Open http://localhost:3030 in your browser
```

## Troubleshooting

### Check Browser Console

Open DevTools (F12) and check the Console tab for errors.

### Verify File Paths

Ensure all file paths are correct relative to your HTML file:
- `./dist/sparql-query-ui.js`
- `./dist/sparql-query-ui.css`

### Test with Simple Example

Start with the minimal example above and add configuration incrementally.

## Need Help?

- **Documentation:** https://github.com/yourusername/CHUCC-SQUI
- **Issues:** https://github.com/yourusername/CHUCC-SQUI/issues
- **Examples:** See `demo.html` in the repository
