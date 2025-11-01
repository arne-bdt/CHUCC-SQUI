# SQUI Deployment Guide

This document describes how to deploy SQUI in various environments.

## Table of Contents

- [NPM Package](#npm-package)
- [Standalone Application](#standalone-application)
- [GitHub Pages](#github-pages)
- [Docker](#docker)
- [CDN Usage](#cdn-usage)

---

## NPM Package

### Installation

```bash
npm install sparql-query-ui
```

### Usage in Your Application

#### Svelte/SvelteKit

```svelte
<script>
  import { SparqlQueryUI } from 'sparql-query-ui';
</script>

<SparqlQueryUI
  config={{
    endpoint: {
      url: 'https://dbpedia.org/sparql'
    }
  }}
/>
```

#### React

```jsx
import { SparqlQueryUI } from 'sparql-query-ui';

function App() {
  return (
    <SparqlQueryUI
      config={{
        endpoint: {
          url: 'https://dbpedia.org/sparql'
        }
      }}
    />
  );
}
```

#### Vue.js

```vue
<template>
  <SparqlQueryUI :config="config" />
</template>

<script>
import { SparqlQueryUI } from 'sparql-query-ui';

export default {
  components: { SparqlQueryUI },
  data() {
    return {
      config: {
        endpoint: {
          url: 'https://dbpedia.org/sparql'
        }
      }
    };
  }
};
</script>
```

---

## Standalone Application

The standalone build is a fully self-contained HTML application that can be deployed to any static web server.

### Building

```bash
npm run build:standalone
```

This creates a `dist-standalone` directory with:
- `index.html` - Main application page
- `sparql-query-ui.js` - Application JavaScript
- `sparql-query-ui.css` - Application styles
- `sparql-query-ui.umd.cjs` - UMD build
- `README.md` - Standalone documentation

### Local Testing

```bash
# Option 1: Use the preview script
npm run preview:standalone

# Option 2: Use any HTTP server
cd dist-standalone
python -m http.server 8000
# Or: npx http-server
# Or: php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

### URL Parameters

Customize the interface using URL parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `endpoint` | Default SPARQL endpoint URL | `?endpoint=https://dbpedia.org/sparql` |
| `query` | Default query (URL encoded) | `?query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%2010` |
| `theme` | Carbon theme | `?theme=g100` (white, g10, g90, g100) |
| `hideSelector` | Hide endpoint selector | `?hideSelector=true` |
| `disablePersistence` | Disable localStorage | `?disablePersistence=true` |

#### Examples

```
# DBpedia with dark theme
index.html?endpoint=https://dbpedia.org/sparql&theme=g100

# Wikidata with custom query
index.html?endpoint=https://query.wikidata.org/sparql&query=SELECT%20*%20WHERE%20%7B%20%3Fs%20%3Fp%20%3Fo%20%7D%20LIMIT%2010

# Fixed endpoint (no selector)
index.html?endpoint=https://dbpedia.org/sparql&hideSelector=true
```

### Deployment Options

#### Static Web Server

Copy the `dist-standalone` directory contents to your web server:

```bash
# Apache
cp -r dist-standalone/* /var/www/html/squi/

# Nginx
cp -r dist-standalone/* /usr/share/nginx/html/squi/

# Any HTTP server
cp -r dist-standalone/* /path/to/webroot/
```

#### S3 + CloudFront

```bash
aws s3 sync dist-standalone/ s3://your-bucket/squi/
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/squi/*"
```

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd dist-standalone
netlify deploy --prod
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd dist-standalone
vercel --prod
```

---

## GitHub Pages

SQUI includes automatic deployment to GitHub Pages via GitHub Actions.

### Setup

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. **Workflow Configuration**:
   The `.github/workflows/deploy.yml` file is already configured.

3. **Trigger Deployment**:
   ```bash
   git push origin main
   ```

The workflow will:
1. Build the standalone application
2. Deploy to GitHub Pages
3. Make it available at `https://<username>.github.io/<repository>/`

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `dist-standalone` directory:
   ```bash
   echo "squi.yourdomain.com" > dist-standalone/CNAME
   ```

2. Configure DNS:
   ```
   CNAME  squi  <username>.github.io
   ```

3. Update repository settings:
   - Settings → Pages → Custom domain

---

## Docker

### Dockerfile

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:standalone

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist-standalone /usr/share/nginx/html

# Nginx configuration
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '  listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '  server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '  location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '  }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```bash
# Build image
docker build -t squi:latest .

# Run container
docker run -d -p 8080:80 --name squi squi:latest

# Access at http://localhost:8080
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  squi:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

---

## CDN Usage

### Future Enhancement

Once published to npm, SQUI can be used via CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte/css/all.css">
  <script type="module">
    import { SparqlQueryUI } from 'https://unpkg.com/sparql-query-ui';

    new SparqlQueryUI({
      target: document.getElementById('app'),
      props: {
        config: {
          endpoint: { url: 'https://dbpedia.org/sparql' }
        }
      }
    });
  </script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

---

## Production Checklist

Before deploying to production:

- [ ] Run full test suite: `npm test`
- [ ] Run E2E tests: `npm run test:e2e:storybook`
- [ ] Build succeeds: `npm run build`
- [ ] Standalone build succeeds: `npm run build:standalone`
- [ ] Check bundle size (should be <500KB gzipped)
- [ ] Test in target browsers (Chrome, Firefox, Safari, Edge)
- [ ] Configure Content Security Policy (CSP) headers
- [ ] Set appropriate cache headers
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Test with real SPARQL endpoints
- [ ] Monitor performance metrics

---

## Troubleshooting

### CORS Issues

If you encounter CORS errors when querying SPARQL endpoints:

1. **Server-side**: Configure your backend to allow CORS
2. **Client-side**: Use a CORS proxy (development only)
3. **Deployment**: Ensure your server sends appropriate headers

### Bundle Size

To analyze bundle size:

```bash
npm install -D vite-bundle-visualizer
npm run build
```

### Performance Issues

- Enable virtual scrolling for large result sets
- Increase `chunkSize` for better performance
- Reduce `maxRows` limit
- Use result format caching

---

## Support

- 📖 [Documentation](README.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/sparql-query-ui/issues)
- 💬 [Discussions](https://github.com/yourusername/sparql-query-ui/discussions)
