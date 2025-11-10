#!/usr/bin/env node

/**
 * Check for CDN URLs in source code
 *
 * This script enforces the "no CDN dependencies" policy documented in docs/SECURITY.md.
 * It scans source files for CDN URLs (unpkg, jsdelivr, cdnjs, etc.) that would violate
 * the offline/air-gapped deployment requirement.
 *
 * Usage:
 *   node scripts/check-cdn-urls.js
 *
 * Exit codes:
 *   0 - No CDN URLs found
 *   1 - CDN URLs found or script error
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// CDN patterns to detect
const CDN_PATTERNS = [
  /https?:\/\/unpkg\.com/gi,
  /https?:\/\/cdn\.jsdelivr\.net/gi,
  /https?:\/\/cdnjs\.cloudflare\.com/gi,
  /https?:\/\/.*\.jsdelivr\.net/gi,
  /https?:\/\/fonts\.googleapis\.com/gi,
  /https?:\/\/fonts\.gstatic\.com/gi,
];

// Directories to scan
const SCAN_DIRS = ['src', 'tests'];

// Files to exclude from scan
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /dist/,
  /dist-standalone/,
  /\.svelte-kit/,
  /coverage/,
  /storybook-static/,
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.ts', '.svelte', '.html', '.css'];

let foundViolations = false;

/**
 * Check if a path should be excluded
 */
function shouldExclude(path) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * Recursively scan directory for files
 */
function* scanFiles(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    if (shouldExclude(fullPath)) {
      continue;
    }

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      yield* scanFiles(fullPath);
    } else if (stat.isFile() && SCAN_EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
      yield fullPath;
    }
  }
}

/**
 * Check a file for CDN URLs
 */
function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      for (const pattern of CDN_PATTERNS) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          foundViolations = true;
          console.error(`❌ CDN URL found in ${filePath}:${lineNum + 1}`);
          console.error(`   ${line.trim()}`);
          console.error(`   ${match[0]}`);
          console.error();
        }
      }
    });
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Checking for CDN URLs in source code...\n');
  console.log('Policy: All assets must be bundled locally (docs/SECURITY.md)');
  console.log(`Scanning directories: ${SCAN_DIRS.join(', ')}\n`);

  let fileCount = 0;

  for (const dir of SCAN_DIRS) {
    try {
      for (const file of scanFiles(dir)) {
        checkFile(file);
        fileCount++;
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(`⚠️  Directory not found: ${dir}`);
      } else {
        console.error(`Error scanning ${dir}: ${err.message}`);
      }
    }
  }

  console.log(`\nScanned ${fileCount} files`);

  if (foundViolations) {
    console.error('\n❌ CDN URLs detected! Please bundle all assets locally.');
    console.error('See docs/SECURITY.md for policy details.');
    process.exit(1);
  } else {
    console.log('✅ No CDN URLs found - offline deployment compliant');
    process.exit(0);
  }
}

main();
