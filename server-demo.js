/**
 * Simple HTTP server for serving the standalone demo
 * Runs on http://localhost:3030
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3030;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  // Default to demo.html for root
  let filePath = req.url === '/' ? '/demo.html' : req.url;

  // Remove query params
  filePath = filePath.split('?')[0];

  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  // Construct absolute path
  const absolutePath = join(__dirname, filePath);

  try {
    const data = await readFile(absolutePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*', // Allow CORS for development
    });
    res.end(data);

    console.log(`[${new Date().toISOString()}] 200 ${req.url}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404);
      res.end('404 Not Found');
      console.error(`[${new Date().toISOString()}] 404 ${req.url}`);
    } else {
      res.writeHead(500);
      res.end('500 Internal Server Error');
      console.error(`[${new Date().toISOString()}] 500 ${req.url}:`, error);
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Demo server running at http://localhost:${PORT}/`);
  console.log(`📄 Serving demo.html and dist/ files\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down demo server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
