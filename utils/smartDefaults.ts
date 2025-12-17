import { OptimizationStrategy, TimeframeType, UserPreferences } from '../types';

// Country detection from browser locale
export const detectCountryFromLocale = (): string => {
  if (typeof navigator === 'undefined') return 'United States';

  // Try to get language/region from navigator
  const language = navigator.language || (navigator as any).userLanguage;

  // Map common locale codes to country names
  const localeMap: Record<string, string> = {
    'en-US': 'United States',
    'en-GB': 'United Kingdom',
    'en-CA': 'Canada',
    'en-AU': 'Australia',
    'en-NZ': 'Australia', // Default NZ to AU
    'fr-CA': 'Canada',
    // European countries default to Europe option
    'de': 'Europe',
    'fr-FR': 'Europe',
    'es': 'Europe',
    'it': 'Europe',
    'pt': 'Europe',
    'nl': 'Europe',
    'pl': 'Europe',
    'sv': 'Europe',
    'da': 'Europe',
    'fi': 'Europe',
    'no': 'Europe',
  };

  // Try exact match first
  if (localeMap[language]) {
    return localeMap[language];
  }

  // Try country code only (e.g., 'en-US' -> 'en')
  const countryCode = language.split('-')[1];
  if (countryCode) {
    switch (countryCode.toUpperCase()) {
      case 'US':
        return 'United States';
      case 'GB':
      case 'UK':
        return 'United Kingdom';
      case 'CA':
        return 'Canada';
      case 'AU':
        return 'Australia';
      default:
        // European country codes
        if (['DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'PL', 'SE', 'DK', 'FI', 'NO', 'BE', 'AT', 'CH', 'IE', 'GR'].includes(countryCode.toUpperCase())) {
          return 'Europe';
        }
    }
  }

  // Default to United States if can't detect
  return 'United States';
};

// Get recommended year (2026 for most users, 2025 only if it's still early 2025)
export const getRecommendedYear = (): TimeframeType => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // If we're in 2025 and before April, suggest 2025 still
  if (currentYear === 2025 && currentMonth < 3) {
    return TimeframeType.CALENDAR_2025;
  }

  // Otherwise default to 2026
  return TimeframeType.CALENDAR_2026;
};

// Get recommended PTO days based on country
export const getRecommendedPTODays = (country: string): number => {
  // US typically has 10-15 days
  // Europe has more (20-25+)
  // UK/CA/AU around 20-25
  const ptoByCountry: Record<string, number> = {
    'United States': 15,
    'United Kingdom': 20,
    'Canada': 15,
    'Australia': 20,
    'Europe': 25,
  };

  return ptoByCountry[country] || 15;
};

// Create initial preferences with smart defaults
export const createSmartDefaults = (): UserPreferences => {
  const detectedCountry = detectCountryFromLocale();
  const recommendedYear = getRecommendedYear();
  const recommendedPTO = getRecommendedPTODays(detectedCountry);

  return {
    ptoDays: recommendedPTO,
    timeframe: recommendedYear,
    strategy: OptimizationStrategy.BALANCED, // Most popular
    country: detectedCountry,
    region: '',
    hasBuddy: false,
    buddyPtoDays: 0,
    buddyCountry: '',
    buddyRegion: '',
  };
};

// Check if a field is using the default value
export const isDefaultValue = (field: keyof UserPreferences, value: any, defaults: UserPreferences): boolean => {
  return value === defaults[field];
};
