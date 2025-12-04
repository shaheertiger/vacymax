/**
 * Dynamic Sitemap Generator for Vacymax SPA
 *
 * This script generates a sitemap.xml file for search engine indexing.
 * Run this script during build time or via a cron job to keep it updated.
 *
 * Usage:
 * - During build: Add to package.json: "postbuild": "node scripts/generate-sitemap.js"
 * - Manual: node scripts/generate-sitemap.js
 * - Vercel: Works automatically if added to build script
 */

import fs from 'fs';
import path from 'path';

const APP_URL = 'https://vacymax.com'; // Replace with your actual domain
const OUTPUT_PATH = path.join(process.cwd(), 'dist', 'sitemap.xml');

// Supported countries for vacation planning
const SUPPORTED_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'Brazil',
  'Mexico',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'Austria',
  'Switzerland',
  'Belgium',
  'Ireland',
  'Portugal',
  'Greece',
  'Czech Republic',
  'Hungary',
  'Romania',
  'New Zealand',
  'Singapore',
  'South Korea',
  'India',
  'China',
  'Hong Kong',
  'Taiwan',
  'Thailand',
  'Malaysia',
  'Indonesia',
  'Philippines',
  'Vietnam',
  'South Africa',
  'Israel',
  'United Arab Emirates',
  'Saudi Arabia',
  'Turkey',
  'Russia',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Venezuela',
  'Ecuador'
];

/**
 * Generate a URL entry for the sitemap
 */
function createUrlEntry(loc, lastmod, changefreq = 'monthly', priority = '0.8') {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Generate the complete sitemap.xml
 */
function generateSitemap() {
  const lastmod = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  // Homepage (highest priority)
  sitemap += createUrlEntry(APP_URL, lastmod, 'weekly', '1.0');

  // Static pages
  sitemap += createUrlEntry(`${APP_URL}/how-it-works`, lastmod, 'monthly', '0.9');
  sitemap += createUrlEntry(`${APP_URL}/privacy`, lastmod, 'yearly', '0.3');
  sitemap += createUrlEntry(`${APP_URL}/terms`, lastmod, 'yearly', '0.3');

  // Dynamic country pages (SEO-optimized landing pages)
  SUPPORTED_COUNTRIES.forEach(country => {
    const slug = country.toLowerCase().replace(/\s+/g, '-');

    // Current year country pages (high priority for freshness)
    sitemap += createUrlEntry(
      `${APP_URL}/vacation-planner/${slug}`,
      lastmod,
      'weekly',
      '0.9'
    );

    // 2025 specific pages
    sitemap += createUrlEntry(
      `${APP_URL}/vacation-planner/${slug}/2025`,
      lastmod,
      'monthly',
      '0.8'
    );

    // 2026 planning pages (medium priority)
    sitemap += createUrlEntry(
      `${APP_URL}/vacation-planner/${slug}/2026`,
      lastmod,
      'monthly',
      '0.7'
    );
  });

  // Blog/guides (if you add content marketing)
  // sitemap += createUrlEntry(`${APP_URL}/guides/maximize-pto`, lastmod, 'monthly', '0.7');
  // sitemap += createUrlEntry(`${APP_URL}/guides/long-weekends-2025`, lastmod, 'monthly', '0.7');

  sitemap += '\n</urlset>';

  return sitemap;
}

/**
 * Write sitemap to disk
 */
function writeSitemap() {
  try {
    const sitemapContent = generateSitemap();

    // Ensure dist directory exists
    const distDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Write sitemap.xml
    fs.writeFileSync(OUTPUT_PATH, sitemapContent, 'utf-8');

    console.log('✅ Sitemap generated successfully!');
    console.log(`📍 Location: ${OUTPUT_PATH}`);
    console.log(`📊 Total URLs: ${SUPPORTED_COUNTRIES.length * 3 + 4}`);
    console.log(`🔗 Access at: ${APP_URL}/sitemap.xml`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  writeSitemap();
}

export { generateSitemap, writeSitemap };
