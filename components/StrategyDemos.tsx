import React, { useState, useMemo } from 'react';
import { OptimizationStrategy, VacationBlock, OptimizationResult } from '../types';
import { YearTimeline, EfficiencyGauge, DistributionChart } from './Visualizations';
import { CountUpNumber } from './Celebrations';
import { formatDate } from '../services/utils';

// ============================================================================
// SAMPLE DATA FOR EACH STRATEGY
// ============================================================================

const SAMPLE_PTO = 15; // Using 15 PTO days as the baseline for all demos

// Strategy A: BALANCED - Mix of long trips and quick resets
const BALANCED_BLOCKS: VacationBlock[] = [
  {
    id: 'bal-1',
    startDate: '2025-04-18',
    endDate: '2025-04-27',
    totalDaysOff: 10,
    ptoDaysUsed: 4,
    publicHolidaysUsed: [
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-21', name: 'Easter Monday' }
    ],
    description: 'Spring Revival: Easter Extended',
    efficiencyScore: 2.5,
    monetaryValue: 4600
  },
  {
    id: 'bal-2',
    startDate: '2025-05-24',
    endDate: '2025-05-26',
    totalDaysOff: 3,
    ptoDaysUsed: 0,
    publicHolidaysUsed: [{ date: '2025-05-26', name: 'Memorial Day' }],
    description: 'Memorial Day Weekend',
    efficiencyScore: Infinity,
    monetaryValue: 1380
  },
  {
    id: 'bal-3',
    startDate: '2025-07-03',
    endDate: '2025-07-06',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-07-04', name: 'Independence Day' }],
    description: 'Freedom Week Mini',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'bal-4',
    startDate: '2025-08-30',
    endDate: '2025-09-07',
    totalDaysOff: 9,
    ptoDaysUsed: 4,
    publicHolidaysUsed: [{ date: '2025-09-01', name: 'Labor Day' }],
    description: 'End of Summer Adventure',
    efficiencyScore: 2.25,
    monetaryValue: 4140
  },
  {
    id: 'bal-5',
    startDate: '2025-11-27',
    endDate: '2025-11-30',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-11-27', name: 'Thanksgiving' }],
    description: 'Thanksgiving Escape',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'bal-6',
    startDate: '2025-12-20',
    endDate: '2026-01-01',
    totalDaysOff: 13,
    ptoDaysUsed: 5,
    publicHolidaysUsed: [
      { date: '2025-12-25', name: 'Christmas Day' },
      { date: '2025-12-26', name: 'Day After Christmas' },
      { date: '2026-01-01', name: "New Year's Day" }
    ],
    description: 'Winter Wonderland: Holiday Season',
    efficiencyScore: 2.6,
    monetaryValue: 5980
  }
];

// Strategy B: LONG_WEEKENDS - Frequent 3-4 day breaks
const LONG_WEEKENDS_BLOCKS: VacationBlock[] = [
  {
    id: 'lw-1',
    startDate: '2025-01-17',
    endDate: '2025-01-20',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-01-20', name: 'MLK Day' }],
    description: 'MLK Day Extended',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-2',
    startDate: '2025-02-14',
    endDate: '2025-02-17',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-02-17', name: "Presidents' Day" }],
    description: "Valentine's + Presidents' Day",
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-3',
    startDate: '2025-04-18',
    endDate: '2025-04-21',
    totalDaysOff: 4,
    ptoDaysUsed: 0,
    publicHolidaysUsed: [
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-21', name: 'Easter Monday' }
    ],
    description: 'Easter Long Weekend',
    efficiencyScore: Infinity,
    monetaryValue: 1840
  },
  {
    id: 'lw-4',
    startDate: '2025-05-23',
    endDate: '2025-05-26',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-05-26', name: 'Memorial Day' }],
    description: 'Memorial Day Getaway',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-5',
    startDate: '2025-06-19',
    endDate: '2025-06-22',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-06-19', name: 'Juneteenth' }],
    description: 'Juneteenth Celebration',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-6',
    startDate: '2025-07-03',
    endDate: '2025-07-06',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-07-04', name: 'Independence Day' }],
    description: 'July 4th Weekend',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-7',
    startDate: '2025-08-29',
    endDate: '2025-09-01',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-09-01', name: 'Labor Day' }],
    description: 'Labor Day Retreat',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-8',
    startDate: '2025-10-10',
    endDate: '2025-10-13',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-10-13', name: 'Columbus Day' }],
    description: 'Fall Colors Weekend',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-9',
    startDate: '2025-11-07',
    endDate: '2025-11-11',
    totalDaysOff: 5,
    ptoDaysUsed: 2,
    publicHolidaysUsed: [{ date: '2025-11-11', name: 'Veterans Day' }],
    description: 'Veterans Day Extended',
    efficiencyScore: 2.5,
    monetaryValue: 2300
  },
  {
    id: 'lw-10',
    startDate: '2025-11-27',
    endDate: '2025-11-30',
    totalDaysOff: 4,
    ptoDaysUsed: 1,
    publicHolidaysUsed: [{ date: '2025-11-27', name: 'Thanksgiving' }],
    description: 'Thanksgiving Mini',
    efficiencyScore: 4.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-11',
    startDate: '2025-12-25',
    endDate: '2025-12-28',
    totalDaysOff: 4,
    ptoDaysUsed: 2,
    publicHolidaysUsed: [{ date: '2025-12-25', name: 'Christmas Day' }],
    description: 'Christmas Weekend',
    efficiencyScore: 2.0,
    monetaryValue: 1840
  },
  {
    id: 'lw-12',
    startDate: '2026-01-01',
    endDate: '2026-01-04',
    totalDaysOff: 4,
    ptoDaysUsed: 2,
    publicHolidaysUsed: [{ date: '2026-01-01', name: "New Year's Day" }],
    description: 'New Year Refresh',
    efficiencyScore: 2.0,
    monetaryValue: 1840
  }
];

// Strategy C: EXTENDED - Long 2+ week adventures
const EXTENDED_BLOCKS: VacationBlock[] = [
  {
    id: 'ext-1',
    startDate: '2025-04-12',
    endDate: '2025-04-27',
    totalDaysOff: 16,
    ptoDaysUsed: 8,
    publicHolidaysUsed: [
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-21', name: 'Easter Monday' }
    ],
    description: 'Spring Eurotrip: 16-Day Adventure',
    efficiencyScore: 2.0,
    monetaryValue: 7360
  },
  {
    id: 'ext-2',
    startDate: '2025-12-20',
    endDate: '2026-01-05',
    totalDaysOff: 17,
    ptoDaysUsed: 7,
    publicHolidaysUsed: [
      { date: '2025-12-25', name: 'Christmas Day' },
      { date: '2025-12-26', name: 'Day After Christmas' },
      { date: '2026-01-01', name: "New Year's Day" }
    ],
    description: 'Winter Wanderlust: Holiday Escape',
    efficiencyScore: 2.43,
    monetaryValue: 7820
  }
];

// Strategy D: MINI_BREAKS - Regular week-long resets every ~2 months
const MINI_BREAKS_BLOCKS: VacationBlock[] = [
  {
    id: 'mb-1',
    startDate: '2025-01-18',
    endDate: '2025-01-26',
    totalDaysOff: 9,
    ptoDaysUsed: 4,
    publicHolidaysUsed: [{ date: '2025-01-20', name: 'MLK Day' }],
    description: 'January Reset Week',
    efficiencyScore: 2.25,
    monetaryValue: 4140
  },
  {
    id: 'mb-2',
    startDate: '2025-03-15',
    endDate: '2025-03-23',
    totalDaysOff: 9,
    ptoDaysUsed: 5,
    publicHolidaysUsed: [],
    description: 'March Wellness Week',
    efficiencyScore: 1.8,
    monetaryValue: 4140
  },
  {
    id: 'mb-3',
    startDate: '2025-05-24',
    endDate: '2025-06-01',
    totalDaysOff: 9,
    ptoDaysUsed: 3,
    publicHolidaysUsed: [{ date: '2025-05-26', name: 'Memorial Day' }],
    description: 'Late May Staycation',
    efficiencyScore: 3.0,
    monetaryValue: 4140
  },
  {
    id: 'mb-4',
    startDate: '2025-08-02',
    endDate: '2025-08-10',
    totalDaysOff: 9,
    ptoDaysUsed: 5,
    publicHolidaysUsed: [],
    description: 'August Recharge Week',
    efficiencyScore: 1.8,
    monetaryValue: 4140
  },
  {
    id: 'mb-5',
    startDate: '2025-10-04',
    endDate: '2025-10-12',
    totalDaysOff: 9,
    ptoDaysUsed: 5,
    publicHolidaysUsed: [],
    description: 'October Autumn Break',
    efficiencyScore: 1.8,
    monetaryValue: 4140
  },
  {
    id: 'mb-6',
    startDate: '2025-12-20',
    endDate: '2025-12-28',
    totalDaysOff: 9,
    ptoDaysUsed: 3,
    publicHolidaysUsed: [
      { date: '2025-12-25', name: 'Christmas Day' },
      { date: '2025-12-26', name: 'Day After Christmas' }
    ],
    description: 'Holiday Season Reset',
    efficiencyScore: 3.0,
    monetaryValue: 4140
  }
];

// ============================================================================
// STRATEGY METADATA
// ============================================================================

interface StrategyMeta {
  id: OptimizationStrategy;
  title: string;
  emoji: string;
  tagline: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  philosophy: string;
  idealFor: string[];
  pros: string[];
  cons: string[];
  psychologyWhy: string;
  blocks: VacationBlock[];
  tripCount: number;
  avgTripLength: number;
}

const STRATEGY_META: Record<string, StrategyMeta> = {
  ['The "CEO" Schedule']: {
    id: 'The "CEO" Schedule' as OptimizationStrategy,
    title: 'The Balance',
    emoji: '✨',
    tagline: 'A mix of long trips and quick reset breaks',
    color: 'rose',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-peach-500',
    textColor: 'text-rose-accent',
    borderColor: 'border-rose-200',
    bgColor: 'bg-rose-50',
    philosophy: "Life isn't one-size-fits-all, and neither should your time off be. The Balanced approach recognizes that you need BOTH extended adventures to truly decompress AND regular short breaks to prevent burnout. It's the goldilocks zone of vacation planning.",
    idealFor: [
      'First-time optimizers who want variety',
      'People with flexible travel preferences',
      'Those who want "a little bit of everything"',
      'Anyone with 10-25 PTO days'
    ],
    pros: [
      'Most versatile - adapts to different energy levels',
      'Prevents the "vacation hangover" of only having one big trip',
      'Multiple recovery points throughout the year',
      'Maximizes holiday leverage for both short and long breaks',
      'Lower risk - if one trip falls through, you have others'
    ],
    cons: [
      'May feel like "jack of all trades, master of none"',
      'Requires more planning throughout the year',
      'Not ideal for very distant international travel',
      'Can feel fragmented if you prefer routine'
    ],
    psychologyWhy: "Research shows that anticipation of a vacation provides nearly as much happiness as the vacation itself. With 5-6 breaks spread throughout the year, you always have something to look forward to. The mix of lengths also aligns with how our brains process rest: we need both micro-recovery (long weekends) and macro-recovery (week+ breaks) to maintain peak performance.",
    blocks: BALANCED_BLOCKS,
    tripCount: 6,
    avgTripLength: 7.2
  },
  ['The Socialite']: {
    id: 'The Socialite' as OptimizationStrategy,
    title: 'Frequent Bliss',
    emoji: '🥂',
    tagline: 'Lots of 3-4 day weekends. No burnout ever.',
    color: 'lavender',
    gradientFrom: 'from-lavender-500',
    gradientTo: 'to-indigo-500',
    textColor: 'text-lavender-accent',
    borderColor: 'border-lavender-200',
    bgColor: 'bg-lavender-50',
    philosophy: "Why wait all year for one big vacation when you can have a mini-escape almost every month? This strategy maximizes frequency over duration, turning every public holiday into an opportunity. You'll never go more than a few weeks without a break.",
    idealFor: [
      'High-stress professionals who need regular decompression',
      'People who get restless on long vacations',
      'Those who prefer exploring nearby destinations',
      'Anyone who hates the "post-vacation pile-up" at work'
    ],
    pros: [
      'Never more than 3-4 weeks until your next break',
      'Minimal work disruption - easier to hand off responsibilities',
      'Perfect for road trips and regional exploration',
      'Highest trip frequency = most anticipation moments',
      'Easier on the wallet - shorter trips cost less'
    ],
    cons: [
      'No time for truly distant destinations (Asia, Europe)',
      'Can feel repetitive if you run out of nearby places',
      'Travel days eat into short trips significantly',
      'May not feel like "real" vacations to some'
    ],
    psychologyWhy: "The frequency strategy is backed by the psychological concept of 'hedonic adaptation' - we quickly get used to good things. Instead of one 2-week high that fades, you get 10-12 smaller highs that reset your happiness baseline regularly. Studies show that more frequent, shorter breaks lead to higher sustained wellbeing than infrequent long ones.",
    blocks: LONG_WEEKENDS_BLOCKS,
    tripCount: 12,
    avgTripLength: 4.1
  },
  ['The Jetsetter']: {
    id: 'The Jetsetter' as OptimizationStrategy,
    title: 'Wanderlust',
    emoji: '✈️',
    tagline: 'Focus on long, 2+ week adventures',
    color: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    philosophy: "Go big or go home. This strategy hoards your PTO like treasure, waiting for the perfect moment to cash in on massive 2+ week adventures. If your bucket list includes Bali, Japan, or a European grand tour, this is how you make it happen.",
    idealFor: [
      'International travel enthusiasts',
      'Those with bucket-list destinations far away',
      'People who need full immersion to truly relax',
      'Digital nomad aspirants testing the waters'
    ],
    pros: [
      'Enough time for distant, exotic destinations',
      'True immersion - experience places like a local',
      'Only 1-2 major planning efforts per year',
      'Maximum bang for flight costs (one long-haul vs. many short)',
      'Deep reset - truly disconnect from work'
    ],
    cons: [
      'Long gaps between vacations can lead to burnout',
      'Work handoff is more complex for 2+ weeks',
      'Higher stakes - if the trip has issues, no backups',
      'More expensive per trip (even if efficient overall)'
    ],
    psychologyWhy: "The extended vacation strategy taps into the power of 'psychological distance' - being truly far away (both physically and mentally) from your daily life allows for perspective shifts that short breaks can't provide. Many people report their biggest life insights and decisions came during extended travel. It's not just rest; it's transformation.",
    blocks: EXTENDED_BLOCKS,
    tripCount: 2,
    avgTripLength: 16.5
  },
  ['The Wellness Era']: {
    id: 'The Wellness Era' as OptimizationStrategy,
    title: 'Regular Resets',
    emoji: '🧘‍♀️',
    tagline: 'A week off every other month',
    color: 'emerald',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50',
    philosophy: "Consistency is key. Instead of feast-or-famine vacation patterns, this strategy spaces your time off evenly throughout the year. Think of it as a 'maintenance schedule' for your mental health - a week off every 8-10 weeks keeps you operating at peak performance.",
    idealFor: [
      'Wellness-focused individuals',
      'People who value routine and predictability',
      'Those recovering from burnout',
      'Parents who need regular family time',
      'Anyone building healthy work-life habits'
    ],
    pros: [
      'Consistent rhythm - your body learns when to expect rest',
      'Never more than 8-10 weeks until a full week off',
      'Long enough to actually unwind (7-9 days)',
      'Predictable for planning personal projects',
      'Sustainable long-term approach'
    ],
    cons: [
      'Less flexibility to combine with holidays',
      'May not maximize efficiency metrics',
      'Some weeks may feel "forced" if not needed',
      'Doesn\'t account for peak work periods'
    ],
    psychologyWhy: "This strategy is rooted in the science of circadian and ultradian rhythms - our bodies operate on natural cycles. Just as we need daily sleep, we also benefit from longer rest cycles. The 8-10 week interval mirrors the natural 'energy quarter' many productivity experts recommend. It's proactive mental health maintenance, not reactive crisis management.",
    blocks: MINI_BREAKS_BLOCKS,
    tripCount: 6,
    avgTripLength: 9
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateStats = (blocks: VacationBlock[]) => {
  const totalDaysOff = blocks.reduce((sum, b) => sum + b.totalDaysOff, 0);
  const totalPtoUsed = blocks.reduce((sum, b) => sum + b.ptoDaysUsed, 0);
  const totalValue = blocks.reduce((sum, b) => sum + b.monetaryValue, 0);
  const freeDays = totalDaysOff - totalPtoUsed;
  const multiplier = totalPtoUsed > 0 ? totalDaysOff / totalPtoUsed : Infinity;

  return { totalDaysOff, totalPtoUsed, totalValue, freeDays, multiplier };
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface StrategyDemoProps {
  strategy: OptimizationStrategy;
  onBack: () => void;
  onSelect?: (strategy: OptimizationStrategy) => void;
}

const ProConCard: React.FC<{ items: string[], type: 'pro' | 'con' }> = ({ items, type }) => {
  const isPro = type === 'pro';
  return (
    <div className={`rounded-2xl p-6 ${isPro ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
      <h4 className={`font-bold text-sm uppercase tracking-widest mb-4 ${isPro ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPro ? '+ Advantages' : '- Trade-offs'}
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${isPro ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {isPro ? '✓' : '!'}
            </span>
            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const IdealForSection: React.FC<{ items: string[], bgColor: string, textColor: string }> = ({ items, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-2xl p-6 border border-white/50`}>
    <h4 className={`font-bold text-sm uppercase tracking-widest mb-4 ${textColor}`}>
      Perfect For
    </h4>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
          <span className={`${textColor}`}>→</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const TripCard: React.FC<{ block: VacationBlock, index: number, textColor: string }> = ({ block, index, textColor }) => (
  <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg group">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-400 uppercase tracking-wider">
          Trip {index + 1}
        </span>
        {block.efficiencyScore >= 3 && (
          <span className={`text-[10px] font-bold ${textColor} bg-white border px-2 py-0.5 rounded uppercase tracking-wider`}>
            High ROI
          </span>
        )}
      </div>
      <div className="text-right">
        <span className={`text-lg font-bold ${textColor}`}>{block.totalDaysOff}d</span>
        <span className="text-xs text-gray-400 block">off</span>
      </div>
    </div>

    <h5 className="font-bold text-gray-800 mb-1">{block.description}</h5>
    <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
      Approx. Duration: {block.totalDaysOff} Days
    </p>

    <div className="flex flex-wrap gap-2 mb-3">
      {block.publicHolidaysUsed.map((h, i) => (
        <span key={i} className="text-[10px] bg-lavender-50 text-lavender-600 border border-lavender-100 px-2 py-1 rounded font-medium">
          Public Holiday
        </span>
      ))}
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
      <div>
        <span className="text-gray-400">PTO Cost: </span>
        <span className={`font-bold ${block.ptoDaysUsed === 0 ? textColor : 'text-gray-700'}`}>
          {block.ptoDaysUsed === 0 ? 'FREE' : `${block.ptoDaysUsed} days`}
        </span>
      </div>
      <div className="text-right">
        <span className="text-gray-400">Value: </span>
        <span className="font-bold text-gray-700">${block.monetaryValue.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

export const StrategyDemo: React.FC<StrategyDemoProps> = ({ strategy, onBack, onSelect }) => {
  const meta = STRATEGY_META[strategy];
  const stats = useMemo(() => calculateStats(meta.blocks), [meta.blocks]);

  // Create a mock OptimizationResult for the YearTimeline
  const mockResult: OptimizationResult = {
    planName: meta.title,
    targetYear: 2025,
    timelineStartDate: '2025-01-01',
    totalPtoUsed: stats.totalPtoUsed,
    totalDaysOff: stats.totalDaysOff,
    totalFreeDays: stats.freeDays,
    totalValueRecovered: stats.totalValue,
    vacationBlocks: meta.blocks,
    summary: ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-100 via-light-200 to-light-300 pt-20 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Demos
          </button>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${meta.bgColor} ${meta.textColor} text-xs font-bold uppercase tracking-widest mb-4`}>
            <span className="text-lg">{meta.emoji}</span>
            Strategy Demo
          </div>

          <h1 className={`text-4xl md:text-5xl font-display font-bold mb-3 bg-gradient-to-r ${meta.gradientFrom} ${meta.gradientTo} bg-clip-text text-transparent`}>
            {meta.title} {meta.emoji}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">{meta.tagline}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border ${meta.borderColor} shadow-sm`}>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Days Off</p>
            <p className="text-4xl font-display font-bold text-gray-800">
              <CountUpNumber end={stats.totalDaysOff} duration={1000} />
            </p>
            <p className={`text-sm ${meta.textColor} font-medium mt-1`}>
              from {stats.totalPtoUsed} PTO days
            </p>
          </div>

          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border ${meta.borderColor} shadow-sm`}>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Efficiency</p>
            <p className={`text-4xl font-display font-bold ${meta.textColor}`}>
              {stats.multiplier === Infinity ? '∞' : `${stats.multiplier.toFixed(1)}x`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              multiplier on your PTO
            </p>
          </div>

          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border ${meta.borderColor} shadow-sm`}>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Trip Pattern</p>
            <p className="text-4xl font-display font-bold text-gray-800">
              {meta.tripCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              trips, avg {meta.avgTripLength} days each
            </p>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="mb-12">
          <YearTimeline
            blocks={meta.blocks}
            isLocked={false}
            timelineStartDate="2025-01-01"
            targetYear={2025}
            hideDates={true}
          />
        </div>

        {/* Philosophy Section */}
        <div className={`${meta.bgColor} rounded-3xl p-8 mb-12 border ${meta.borderColor}`}>
          <h3 className={`text-xl font-bold ${meta.textColor} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">{meta.emoji}</span>
            The Philosophy
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">{meta.philosophy}</p>
        </div>

        {/* Trip Breakdown */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Your Year at a Glance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meta.blocks.map((block, i) => (
              <TripCard
                key={block.id}
                block={block}
                index={i}
                textColor={meta.textColor}
              />
            ))}
          </div>
        </div>

        {/* Pros/Cons & Ideal For */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <ProConCard items={meta.pros} type="pro" />
          <ProConCard items={meta.cons} type="con" />
          <IdealForSection items={meta.idealFor} bgColor={meta.bgColor} textColor={meta.textColor} />
        </div>

        {/* Psychology Deep Dive */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            The Psychology: Why This Works
          </h3>
          <p className="text-gray-700 leading-relaxed">{meta.psychologyWhy}</p>
        </div>

        {/* Visual Comparison Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <EfficiencyGauge multiplier={stats.multiplier} isInfinite={stats.multiplier === Infinity} />
          <DistributionChart pto={stats.totalPtoUsed} free={stats.freeDays} />
        </div>

        {/* CTA */}
        {onSelect && (
          <div className="text-center">
            <button
              onClick={() => onSelect(strategy)}
              className={`px-8 py-4 bg-gradient-to-r ${meta.gradientFrom} ${meta.gradientTo} text-white font-bold text-lg rounded-2xl hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-3`}
            >
              Choose This Strategy
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DEMO INDEX PAGE
// ============================================================================

interface DemoIndexProps {
  onSelectDemo: (strategy: OptimizationStrategy) => void;
  onBack: () => void;
}

export const DemoIndex: React.FC<DemoIndexProps> = ({ onSelectDemo, onBack }) => {
  const strategies = [
    'The "CEO" Schedule' as OptimizationStrategy,
    'The Socialite' as OptimizationStrategy,
    'The Jetsetter' as OptimizationStrategy,
    'The Wellness Era' as OptimizationStrategy
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-100 via-light-200 to-light-300 pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-accent text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-accent animate-pulse"></span>
            Interactive Demos
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-rose-accent via-lavender-accent to-peach-accent bg-clip-text text-transparent mb-4">
            Explore Our 4 Strategies
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See exactly how each optimization approach works with realistic sample data.
            Click any card to dive deep into the strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strategyKey) => {
            const meta = STRATEGY_META[strategyKey];
            const stats = calculateStats(meta.blocks);

            return (
              <button
                key={strategyKey}
                onClick={() => onSelectDemo(strategyKey)}
                className={`group text-left bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 ${meta.borderColor} hover:border-opacity-100 border-opacity-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${meta.bgColor} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                    {meta.emoji}
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${meta.textColor}`}>{stats.totalDaysOff}</span>
                    <span className="text-xs text-gray-400 block uppercase">Days Off</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                  {meta.title} {meta.emoji}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{meta.tagline}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-[10px] font-bold ${meta.bgColor} ${meta.textColor} px-2 py-1 rounded-full uppercase tracking-wider`}>
                    {meta.tripCount} trips/year
                  </span>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider">
                    ~{meta.avgTripLength}d avg
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-wider">
                    {stats.multiplier === Infinity ? '∞' : `${stats.multiplier.toFixed(1)}x`} efficiency
                  </span>
                </div>

                <div className={`flex items-center gap-2 ${meta.textColor} text-sm font-bold group-hover:gap-3 transition-all`}>
                  <span>Explore Demo</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm overflow-x-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Comparison</h3>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs uppercase tracking-widest text-gray-400 font-bold">Strategy</th>
                <th className="text-center py-3 px-2 text-xs uppercase tracking-widest text-gray-400 font-bold">Trips</th>
                <th className="text-center py-3 px-2 text-xs uppercase tracking-widest text-gray-400 font-bold">Avg Length</th>
                <th className="text-center py-3 px-2 text-xs uppercase tracking-widest text-gray-400 font-bold">Total Days</th>
                <th className="text-center py-3 px-2 text-xs uppercase tracking-widest text-gray-400 font-bold">PTO Used</th>
                <th className="text-center py-3 px-2 text-xs uppercase tracking-widest text-gray-400 font-bold">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategyKey) => {
                const meta = STRATEGY_META[strategyKey];
                const stats = calculateStats(meta.blocks);

                return (
                  <tr key={strategyKey} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.emoji}</span>
                        <span className="font-bold text-gray-800">{meta.title}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2 text-gray-700 font-medium">{meta.tripCount}</td>
                    <td className="text-center py-4 px-2 text-gray-700 font-medium">{meta.avgTripLength}d</td>
                    <td className="text-center py-4 px-2">
                      <span className={`font-bold ${meta.textColor}`}>{stats.totalDaysOff}</span>
                    </td>
                    <td className="text-center py-4 px-2 text-gray-700 font-medium">{stats.totalPtoUsed}</td>
                    <td className="text-center py-4 px-2">
                      <span className="font-bold text-emerald-600">
                        {stats.multiplier === Infinity ? '∞' : `${stats.multiplier.toFixed(1)}x`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Ready to create your own optimized plan?</p>
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gradient-to-r from-rose-accent to-lavender-accent text-white font-bold text-lg rounded-2xl hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-3"
          >
            Start Planning Now
            <span className="text-xl">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DEMO PAGE (with routing)
// ============================================================================

interface StrategyDemosPageProps {
  onBack: () => void;
  onSelectStrategy?: (strategy: OptimizationStrategy) => void;
}

export const StrategyDemosPage: React.FC<StrategyDemosPageProps> = ({ onBack, onSelectStrategy }) => {
  const [selectedDemo, setSelectedDemo] = useState<OptimizationStrategy | null>(null);

  if (selectedDemo) {
    return (
      <StrategyDemo
        strategy={selectedDemo}
        onBack={() => setSelectedDemo(null)}
        onSelect={onSelectStrategy}
      />
    );
  }

  return (
    <DemoIndex
      onSelectDemo={setSelectedDemo}
      onBack={onBack}
    />
  );
};

export default StrategyDemosPage;
