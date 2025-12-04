# SEO Implementation Guide for VacyMax

**Last Updated:** December 4, 2025
**Status:** Production-Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Dynamic Meta Tags](#dynamic-meta-tags)
3. [Social Sharing (Open Graph & Twitter Cards)](#social-sharing)
4. [Sitemap Generation](#sitemap-generation)
5. [Robots.txt Configuration](#robotstxt-configuration)
6. [Structured Data (JSON-LD)](#structured-data)
7. [Vercel Deployment](#vercel-deployment)
8. [Testing Your SEO](#testing-your-seo)
9. [Advanced Optimization](#advanced-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Overview

VacyMax uses **react-helmet-async** for dynamic meta tag management, ensuring that:
- **Search engines** (Google, Bing) can properly index the SPA
- **Social platforms** (Twitter, WhatsApp, LinkedIn) display rich preview cards
- **Country-specific pages** rank for targeted keywords like "How to get 45 days off in Canada in 2025"

### Key Features Implemented

✅ **Dynamic Title Generation**: Titles change based on country, year, and results
✅ **Open Graph Tags**: Rich previews for Facebook, LinkedIn, WhatsApp
✅ **Twitter Cards**: Optimized sharing for Twitter/X
✅ **Structured Data (JSON-LD)**: Rich search results on Google
✅ **Canonical URLs**: Prevent duplicate content penalties
✅ **Sitemap.xml**: Automated sitemap generation for 150+ pages
✅ **Robots.txt**: Search engine crawler configuration

---

## Dynamic Meta Tags

### Implementation

The `SEOHead` component (located at `components/SEOHead.tsx`) dynamically generates meta tags based on the current view state.

**Example Titles Generated:**

| View | Country | Year | Generated Title |
|------|---------|------|-----------------|
| Landing | - | - | VacyMax - Maximize Your Vacation Days with Smart PTO Optimization |
| Wizard | Canada | - | Plan Your Perfect Vacation in Canada - VacyMax |
| Results | USA | 2025 | How to Get 45 Days Off in United States in 2025 - VacyMax |

**Usage in App.tsx:**

```tsx
import { SEOHead } from './components/SEOHead';

function App() {
  return (
    <div>
      <SEOHead
        view={view} // 'landing' | 'wizard' | 'results'
        prefs={prefs}
        result={result}
        country={prefs.country}
      />
      {/* Rest of your app */}
    </div>
  );
}
```

### Configuration

To customize SEO settings, edit `components/SEOHead.tsx`:

```tsx
const APP_NAME = 'VacyMax'; // Change this to your brand name
const APP_URL = 'https://vacymax.com'; // Replace with your domain
const TWITTER_HANDLE = '@vacymax'; // Your Twitter handle
```

---

## Social Sharing (Open Graph & Twitter Cards)

### How Social Sharing Works

When users share their results, the `SEOHead` component generates **engaging social titles** instead of dry SEO titles.

**Example Social Share Preview:**

```
Title: I just unlocked 45 days off using only 15 PTO days! 🌴
Description: VacyMax found me 8 perfect vacation blocks in 2025. Calculate yours for free! 🚀
Image: https://vacymax.com/api/og?days=45&country=Canada&year=2025
```

### Open Graph Tags (Facebook, LinkedIn, WhatsApp)

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="I just unlocked 45 days off using only 15 PTO days! 🌴" />
<meta property="og:description" content="VacyMax found me 8 perfect vacation blocks in 2025..." />
<meta property="og:image" content="https://vacymax.com/api/og?days=45&country=Canada" />
<meta property="og:url" content="https://vacymax.com" />
```

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="I just unlocked 45 days off using only 15 PTO days! 🌴" />
<meta name="twitter:image" content="https://vacymax.com/og-image.png" />
<meta name="twitter:creator" content="@vacymax" />
```

### Creating Dynamic OG Images (Optional)

You can generate **dynamic Open Graph images** using:

1. **Vercel OG Image Generation** (Recommended)
   - Create `/api/og.tsx` using `@vercel/og`
   - Dynamically generate images with results baked in
   - Example: `https://vacymax.com/api/og?days=45&country=Canada&year=2025`

2. **Cloudinary** or **Puppeteer** for server-side screenshots

3. **Static Fallback**: Place `og-image.png` (1200x630px) in `/public` folder

---

## Sitemap Generation

### Why You Need a Sitemap for SPAs

Single-Page Applications (SPAs) don't have traditional multi-page navigation, so search engines need a **sitemap.xml** file to discover all your content.

VacyMax generates a sitemap with:
- **Homepage** (priority: 1.0)
- **Static pages** (/how-it-works, /privacy, /terms)
- **150+ country-specific pages** (/vacation-planner/canada, /vacation-planner/canada/2025)

### Automated Sitemap Generation

**Option 1: Build-Time Generation (Recommended for Vercel)**

Add to `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "postbuild": "node scripts/generate-sitemap.js"
  }
}
```

Every time you run `npm run build`, the sitemap is auto-generated in `dist/sitemap.xml`.

**Option 2: Manual Generation**

```bash
node scripts/generate-sitemap.js
```

**Option 3: Dynamic API Route (Advanced)**

Create `/api/sitemap.xml.js` on Vercel to generate the sitemap on-the-fly.

### Customizing the Sitemap

Edit `scripts/generate-sitemap.js` to add/remove URLs:

```js
const SUPPORTED_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  // Add more countries here
];

// Add custom pages
sitemap += createUrlEntry(`${APP_URL}/guides/maximize-pto`, lastmod, 'monthly', '0.7');
```

---

## Robots.txt Configuration

The `public/robots.txt` file tells search engines which pages to crawl.

**Current Configuration:**

```txt
User-agent: *
Allow: /

Sitemap: https://vacymax.com/sitemap.xml
```

This allows **all search engines** to crawl **all pages** and points them to your sitemap.

### Blocking Specific Bots (Optional)

```txt
# Block aggressive Chinese search engines
User-agent: Baiduspider
Crawl-delay: 10

# Block AI crawlers (ChatGPT, Claude, etc.)
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /
```

---

## Structured Data (JSON-LD)

Structured data helps Google display **rich search results** (star ratings, pricing, etc.).

### What VacyMax Includes

**WebApplication Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "VacyMax",
  "url": "https://vacymax.com",
  "description": "Free vacation optimizer...",
  "applicationCategory": "TravelApplication",
  "offers": {
    "@type": "Offer",
    "price": "4.99",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1247"
  }
}
```

**Article Schema (for Results Pages):**

When users view results, the schema changes to an **Article** type for better indexing.

### Testing Structured Data

Use Google's **Rich Results Test**:
https://search.google.com/test/rich-results

Paste your URL and verify no errors.

---

## Vercel Deployment

### Step 1: Verify vercel.json

Ensure `vercel.json` has proper SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures that direct URL access (e.g., `/vacation-planner/canada`) doesn't 404.

### Step 2: Add Sitemap to Vercel

After running `npm run build`, the sitemap is placed in `dist/sitemap.xml`.

Vercel automatically serves files in `dist/` at the root level:

```
https://vacymax.com/sitemap.xml ✅
```

### Step 3: Submit Sitemap to Google

1. Go to **Google Search Console**: https://search.google.com/search-console
2. Add property: `https://vacymax.com`
3. Navigate to **Sitemaps** → Add sitemap: `https://vacymax.com/sitemap.xml`
4. Submit and monitor indexing status

---

## Testing Your SEO

### 1. **Test Meta Tags**

Use browser DevTools:

```bash
# Open your site
# Right-click → Inspect → <head> tag
# Verify <title>, <meta name="description">, <meta property="og:...">
```

### 2. **Test Social Sharing**

**Facebook Debugger:**
https://developers.facebook.com/tools/debug/

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator

**LinkedIn Post Inspector:**
https://www.linkedin.com/post-inspector/

Paste your URL and verify the preview card looks correct.

### 3. **Test Sitemap**

Visit: `https://vacymax.com/sitemap.xml`

Verify it loads and contains all expected URLs.

### 4. **Test Robots.txt**

Visit: `https://vacymax.com/robots.txt`

### 5. **Test Structured Data**

Use Google's **Rich Results Test**:
https://search.google.com/test/rich-results

---

## Advanced Optimization

### 1. **Dynamic OG Image Generation**

Install Vercel OG:

```bash
npm install @vercel/og
```

Create `/api/og.tsx`:

```tsx
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const days = searchParams.get('days') || '45';
  const country = searchParams.get('country') || 'USA';

  return new ImageResponse(
    (
      <div style={{ background: '#020617', color: 'white', fontSize: 60 }}>
        I unlocked {days} days off in {country}! 🌴
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

Update `SEOHead.tsx`:

```tsx
const ogImage = `${APP_URL}/api/og?days=${result.totalDaysOff}&country=${country}`;
```

### 2. **Prerendering for SPAs (Optional)**

Use **Prerender.io** or **Rendertron** to serve pre-rendered HTML to search engines.

**Why?** While Google can execute JavaScript, other search engines (Bing, DuckDuckGo) may struggle.

### 3. **Add Blog Content**

Create a `/guides` section with articles like:
- "How to Maximize PTO in 2025"
- "Best Long Weekend Strategies for Canada"
- "Turn 15 PTO Days into 45 Days Off"

This drives **organic traffic** and builds backlinks.

### 4. **Schema Breadcrumbs**

Add breadcrumb navigation for better UX and SEO:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vacymax.com" },
    { "@type": "ListItem", "position": 2, "name": "Canada", "item": "https://vacymax.com/vacation-planner/canada" }
  ]
}
```

---

## Troubleshooting

### ❌ **Meta tags not updating when navigating**

**Issue:** React Helmet isn't updating meta tags on client-side navigation.

**Fix:** Ensure `HelmetProvider` wraps the entire app in `index.tsx`:

```tsx
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
```

### ❌ **Social share preview showing old data**

**Issue:** Facebook/Twitter cache old previews.

**Fix:** Manually refresh the cache:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: Wait 7 days or use the card validator

### ❌ **Sitemap not accessible at /sitemap.xml**

**Issue:** Sitemap not in the `dist/` folder.

**Fix:** Run `npm run build` and verify `dist/sitemap.xml` exists. Ensure `postbuild` script runs.

### ❌ **Google Search Console not indexing pages**

**Issue:** Pages are client-side rendered and Google may not execute JavaScript.

**Fix:**
1. Use **Prerendering** (Prerender.io)
2. Verify `vercel.json` has proper rewrites
3. Submit sitemap to Google Search Console
4. Wait 2-4 weeks for indexing

---

## Summary

🎯 **What You've Implemented:**

1. ✅ **Dynamic SEO Meta Tags** - Titles change based on country/year
2. ✅ **Social Sharing Optimization** - Rich previews on Twitter, Facebook, WhatsApp
3. ✅ **Automated Sitemap Generation** - 150+ URLs for Google indexing
4. ✅ **Robots.txt Configuration** - Allow all search engines
5. ✅ **Structured Data (JSON-LD)** - Rich search results
6. ✅ **Vercel Deployment Ready** - SPA routing configured

🚀 **Next Steps:**

1. Deploy to Vercel
2. Submit sitemap to Google Search Console
3. Test social sharing with Facebook Debugger
4. Monitor indexing status over 2-4 weeks
5. Add blog content for organic traffic growth

---

**Questions?** Check the official docs:
- React Helmet Async: https://github.com/staylor/react-helmet-async
- Google Search Console: https://search.google.com/search-console
- Vercel OG: https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation

---

© 2025 VacyMax. Built for maximum organic reach. 🚀
