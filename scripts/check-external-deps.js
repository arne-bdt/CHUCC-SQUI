/**
 * Check for external dependencies in build output
 *
 * This script scans the dist-standalone directory for any references to external CDN URLs
 * or other external resources that would prevent offline/air-gapped deployment.
 *
 * Exit codes:
 *   0 - No external dependencies found (success)
 *   1 - External dependencies found (failure)
 *   2 - Script error (e.g., dist directory not found)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist-standalone');

// Patterns for common CDN and external resource URLs
const externalPatterns = [
  /https?:\/\/unpkg\.com/,
  /https?:\/\/cdn\.jsdelivr\.net/,
  /https?:\/\/cdnjs\.cloudflare\.com/,
  /https?:\/\/fonts\.googleapis\.com/,
  /https?:\/\/fonts\.gstatic\.com/,
];

// Whitelist patterns that are expected (user-configured endpoints, etc.)
const whitelistPatterns = [
  /prefix\.cc/, // prefix.cc API is configurable and documented
];

/**
 * Check a single file for external dependencies
 * @param {string} filePath - Path to the file to check
 * @returns {Array} Array of violation objects
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  for (const pattern of externalPatterns) {
    const matches = content.match(new RegExp(pattern.source, 'g'));
    if (matches) {
      // Check if matches are whitelisted
      const nonWhitelisted = matches.filter(match => {
        return !whitelistPatterns.some(whitelist => whitelist.test(match));
      });

      if (nonWhitelisted.length > 0) {
        violations.push({
          file: path.relative(distDir, filePath),
          pattern: pattern.source,
          matches: nonWhitelisted
        });
      }
    }
  }

  return violations;
}

/**
 * Recursively check all files in a directory
 * @param {string} dir - Directory to scan
 * @returns {Array} Array of all violations found
 */
function checkDirectory(dir) {
  let violations = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively check subdirectories
        violations = violations.concat(checkDirectory(fullPath));
      } else if (entry.isFile() && /\.(html|css|js)$/.test(entry.name)) {
        // Check relevant file types
        violations = violations.concat(checkFile(fullPath));
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
    throw error;
  }

  return violations;
}

// Main execution
console.log('🔍 Checking for external dependencies in build output...\n');
console.log(`📂 Scanning directory: ${distDir}\n`);

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist-standalone directory not found');
  console.error('   Run "npm run build:standalone" first\n');
  process.exit(2);
}

try {
  const violations = checkDirectory(distDir);

  if (violations.length > 0) {
    console.error('❌ External dependencies found:\n');
    violations.forEach(v => {
      console.error(`  📄 ${v.file}`);
      console.error(`     Pattern: ${v.pattern}`);
      console.error(`     Matches: ${v.matches.join(', ')}\n`);
    });
    console.error('⚠️  These external dependencies must be removed for offline deployment\n');
    process.exit(1);
  } else {
    console.log('✅ No external dependencies found');
    console.log('✅ Build is suitable for offline/air-gapped deployment\n');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Script error:', error.message);
  process.exit(2);
}
