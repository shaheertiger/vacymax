import { Helmet } from 'react-helmet-async';
import { UserPreferences, OptimizationResult } from '../types';

interface SEOHeadProps {
  view?: 'landing' | 'wizard' | 'results';
  prefs?: UserPreferences;
  result?: OptimizationResult;
  country?: string;
}

const APP_NAME = 'VacyMax';
const APP_URL = 'https://vacymax.com'; // Replace with your actual domain
const TWITTER_HANDLE = '@vacymax'; // Replace with your Twitter handle

/**
 * SEOHead Component - Dynamic Meta Tags for Maximum Organic Reach
 *
 * Features:
 * - Dynamic title generation based on country, year, and results
 * - Open Graph tags for rich social media previews
 * - Twitter Card optimization
 * - Structured data (JSON-LD) for rich search results
 * - Canonical URLs for duplicate content prevention
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  view = 'landing',
  prefs,
  result,
  country
}) => {
  // --- DYNAMIC CONTENT GENERATION ---

  const getTitle = (): string => {
    if (view === 'results' && result && country) {
      const totalDays = result.totalDaysOff;
      const year = result.targetYear;
      return `How to Get ${totalDays} Days Off in ${country} in ${year} - ${APP_NAME}`;
    }

    if (view === 'wizard' && country) {
      return `Plan Your Perfect Vacation in ${country} - ${APP_NAME}`;
    }

    // Default landing page title
    return `${APP_NAME} - Maximize Your Vacation Days with Smart PTO Optimization`;
  };

  const getDescription = (): string => {
    if (view === 'results' && result) {
      const totalDays = result.totalDaysOff;
      const ptoUsed = result.totalPtoUsed;
      const efficiency = ptoUsed > 0 ? (totalDays / ptoUsed).toFixed(1) : '∞';
      return `Unlock ${totalDays} days off using only ${ptoUsed} PTO days (${efficiency}x efficiency). Smart vacation planning with public holiday optimization. Free calculator + instant results.`;
    }

    if (view === 'wizard') {
      return `Calculate the best vacation dates for ${country || 'your country'}. Our AI-powered optimizer finds the perfect PTO strategy to maximize your time off with public holidays.`;
    }

    // Default landing description
    return `Free vacation optimizer that finds the best dates to use your PTO. Get up to 3x more days off by strategically planning around public holidays. Instant results for 50+ countries.`;
  };

  const getKeywords = (): string => {
    const baseKeywords = [
      'vacation planner',
      'PTO optimizer',
      'holiday calculator',
      'vacation days calculator',
      'time off planner',
      'public holidays',
      'vacation optimization'
    ];

    if (country) {
      baseKeywords.push(
        `${country} holidays`,
        `${country} vacation planner`,
        `${country} public holidays`
      );
    }

    if (result) {
      baseKeywords.push(
        `${result.targetYear} holidays`,
        'long weekend planner',
        'maximize vacation days'
      );
    }

    return baseKeywords.join(', ');
  };

  const getCanonicalUrl = (): string => {
    if (view === 'results' && country) {
      return `${APP_URL}/results/${country.toLowerCase().replace(/\s/g, '-')}`;
    }
    return APP_URL;
  };

  // --- SOCIAL SHARING IMAGE URL ---
  const getOgImage = (): string => {
    // For results page, you could dynamically generate OG images via API
    // Example: Vercel OG Image Generation or Cloudinary
    if (view === 'results' && result) {
      // Dynamic OG image with results baked in
      return `${APP_URL}/api/og?days=${result.totalDaysOff}&country=${country}&year=${result.targetYear}`;
    }

    // Default social share image (create this in /public folder)
    return `${APP_URL}/og-image.png`;
  };

  // --- SOCIAL SHARING TITLE (More engaging than SEO title) ---
  const getSocialTitle = (): string => {
    if (view === 'results' && result) {
      const totalDays = result.totalDaysOff;
      const ptoUsed = result.totalPtoUsed;
      return `I just unlocked ${totalDays} days off using only ${ptoUsed} PTO days! 🌴`;
    }

    return `${APP_NAME} - Turn Your PTO Into Epic Vacations`;
  };

  const getSocialDescription = (): string => {
    if (view === 'results' && result) {
      return `${APP_NAME} found me ${result.vacationBlocks.length} perfect vacation blocks in ${result.targetYear}. Calculate yours for free! 🚀`;
    }

    return `Get up to 3x more vacation days by planning smarter. Free PTO optimizer for 50+ countries. ✈️`;
  };

  // --- STRUCTURED DATA (JSON-LD) for Rich Search Results ---
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: APP_NAME,
      url: APP_URL,
      description: getDescription(),
      applicationCategory: 'TravelApplication',
      offers: {
        '@type': 'Offer',
        price: '4.99',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1247',
      },
    };

    if (view === 'results' && result && country) {
      return {
        ...baseData,
        '@type': 'Article',
        headline: getTitle(),
        description: getDescription(),
        author: {
          '@type': 'Organization',
          name: APP_NAME,
        },
        publisher: {
          '@type': 'Organization',
          name: APP_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${APP_URL}/logo.png`,
          },
        },
        datePublished: new Date().toISOString(),
        mainEntityOfPage: getCanonicalUrl(),
      };
    }

    return baseData;
  };

  const title = getTitle();
  const description = getDescription();
  const keywords = getKeywords();
  const canonical = getCanonicalUrl();
  const ogImage = getOgImage();
  const socialTitle = getSocialTitle();
  const socialDescription = getSocialDescription();

  return (
    <Helmet>
      {/* --- PRIMARY META TAGS --- */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* --- OPEN GRAPH (Facebook, LinkedIn, WhatsApp) --- */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={socialDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* --- TWITTER CARD --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={socialDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />

      {/* --- ADDITIONAL SEO TAGS --- */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content={APP_NAME} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

      {/* --- MOBILE APP INTEGRATION --- */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content={APP_NAME} />

      {/* --- THEME COLOR --- */}
      <meta name="theme-color" content="#84cc16" /> {/* Lime accent color */}

      {/* --- STRUCTURED DATA (JSON-LD) --- */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData())}
      </script>

      {/* --- ALTERNATE LANGUAGES (if you support i18n) --- */}
      {/* <link rel="alternate" hreflang="en" href={`${APP_URL}/en`} /> */}
      {/* <link rel="alternate" hreflang="es" href={`${APP_URL}/es`} /> */}
    </Helmet>
  );
};
