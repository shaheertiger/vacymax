export enum OptimizationStrategy {
  BALANCED = 'Balanced Mix',
  LONG_WEEKENDS = 'Long Weekends',
  MINI_BREAKS = 'Mini Breaks',
  WEEK_LONG = 'Week-long Breaks',
  EXTENDED = 'Extended Vacations',
}

export enum TimeframeType {
  CALENDAR_2025 = 'Calendar Year 2025',
  CALENDAR_2026 = 'Calendar Year 2026',
  ROLLING_12 = 'Next 12 Months',
}

export interface UserPreferences {
  ptoDays: number;
  timeframe: TimeframeType;
  strategy: OptimizationStrategy;
  country: string;
  region: string;
  // Travel Buddy Fields
  hasBuddy?: boolean;
  buddyPtoDays?: number;
  buddyCountry?: string;
  buddyRegion?: string;
}

export interface HolidayInfo {
  date: string;
  name: string;
}

export interface VacationBlock {
  id: string;
  startDate: string;
  endDate: string;
  totalDaysOff: number;
  ptoDaysUsed: number;
  buddyPtoDaysUsed?: number; // Cost for buddy
  publicHolidaysUsed: HolidayInfo[]; // Rich object for tooltips
  description: string;
  efficiencyScore: number; // e.g., 2.5 (means 2.5 days off per 1 PTO day)
  monetaryValue: number; // The dollar value of this break
}

export interface OptimizationResult {
  planName: string;
  targetYear: number; // Explicit year for context
  timelineStartDate: string; // ISO date string for correct timeline rendering
  totalPtoUsed: number;
  totalPtoUsedBuddy?: number;
  totalDaysOff: number;
  totalFreeDays: number; // Weekend + Holiday days gained
  totalValueRecovered: number; // Total dollar value
  vacationBlocks: VacationBlock[];
  summary: string;
}

// Data Layer Types
export type HolidaySet = string[]; // "YYYY-MM-DD:Holiday Name"

export interface CountryData {
  federal: Record<string, HolidaySet>;
  regions?: Record<string, Record<string, HolidaySet>>;
  regionAliases?: Record<string, string>; // Maps "vic" -> "Victoria"
}