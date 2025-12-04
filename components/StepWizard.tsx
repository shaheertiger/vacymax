import React, { useState, useEffect } from 'react';
import { UserPreferences, OptimizationStrategy, TimeframeType } from '../types';
import { StepHeader, NavButtons, SelectionCard, DebouncedInput } from './Shared';

// --- CONSTANTS & STATIC DATA ---
const DAILY_VALUE_ESTIMATE = 460; 
const EFFICIENCY_MULTIPLIER = 2.8;

const COUNTRIES = [
    { name: "United States", flag: "🇺🇸", code: "US", holidays: 11 },
    { name: "United Kingdom", flag: "🇬🇧", code: "UK", holidays: 8 },
    { name: "Canada", flag: "🇨🇦", code: "CA", holidays: 10 },
    { name: "Australia", flag: "🇦🇺", code: "AU", holidays: 10 }
];

const STRATEGIES = [
    { 
        id: OptimizationStrategy.BALANCED, 
        title: 'Balanced Mix', 
        desc: 'A mix of long trips and quick getaways.', 
        roi: 'Most Popular',
        color: 'from-blue-500/20 to-cyan-500/20',
        tooltip: "The Algorithm aims for a healthy mix: 1-2 week-long vacations plus several optimized long weekends. Best efficiency for 10-20 PTO days."
    },
    { 
        id: OptimizationStrategy.LONG_WEEKENDS, 
        title: 'Frequent Breaks', 
        desc: 'Lots of 3-4 day weekends. Avoid burnout.', 
        roi: 'Stress Free',
        color: 'from-purple-500/20 to-pink-500/20',
        tooltip: "Maximizes trip frequency. The engine prioritizes turning 1 PTO day into 3-4 days off multiple times a year. Great for preventing burnout."
    },
    { 
        id: OptimizationStrategy.EXTENDED, 
        title: 'Big Adventures', 
        desc: 'Focus on long, 2+ week trips.', 
        roi: 'Traveler',
        color: 'from-amber-500/20 to-orange-500/20',
        tooltip: "Quality over quantity. We hoard your PTO to build massive 10+ day blocks for international travel, ignoring shorter opportunities."
    },
    { 
        id: OptimizationStrategy.MINI_BREAKS, 
        title: 'Regular Resets', 
        desc: 'A week off every other month.', 
        roi: 'Healthy',
        color: 'from-emerald-500/20 to-teal-500/20',
        tooltip: "Consistency is key. The plan attempts to space your time off evenly throughout the year (e.g., a break every ~60 days)."
    },
];

interface StepProps {
  prefs: UserPreferences;
  updatePrefs: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  onNext: () => void;
  onBack?: () => void;
}

const LocationSelector = ({ 
    label, 
    countryValue, 
    regionValue, 
    onCountryChange, 
    onRegionChange, 
    accentColor = 'lime',
    isBuddy = false,
    onCopyMine
}: { 
    label: string, 
    countryValue: string, 
    regionValue: string, 
    onCountryChange: (val: string) => void, 
    onRegionChange: (val: string) => void,
    accentColor?: 'lime' | 'violet',
    isBuddy?: boolean,
    onCopyMine?: () => void
}) => {
    const isLime = accentColor === 'lime';
    const activeText = isLime ? 'text-lime-accent' : 'text-brand-violet';
    const activeBg = isLime ? 'bg-lime-accent' : 'bg-brand-violet';
    const borderClass = isLime ? 'border-lime-accent' : 'border-brand-violet';
    const shadowClass = isLime ? 'shadow-lime-accent/10' : 'shadow-brand-violet/10';
    
    return (
        <div className={`${isBuddy ? 'bg-brand-violet/5 border border-brand-violet/20' : ''} rounded-2xl p-4 md:p-6 transition-all duration-500`}>
             <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 text-xs font-bold ${activeText} uppercase tracking-widest pl-1`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${activeBg}`}></div>
                    {label}
                </div>
                {onCopyMine && (
                    <button 
                        onClick={onCopyMine}
                        className="text-[10px] font-bold bg-brand-violet/10 text-brand-violet hover:bg-brand-violet/20 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Same as mine
                    </button>
                )}
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[240px] overflow-y-auto pr-2 pb-2">
                {COUNTRIES.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => onCountryChange(c.name)}
                        className={`p-4 md:p-5 rounded-2xl border text-left relative overflow-hidden transition-all duration-300 group active:scale-95 flex-shrink-0 ${
                            countryValue === c.name
                            ? `bg-[#0F1014] ${borderClass} ${shadowClass} shadow-lg`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <span className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">{c.flag}</span>
                            <div>
                                <div className={`font-bold text-lg ${countryValue === c.name ? activeText : 'text-white'}`}>{c.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wide flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${countryValue === c.name ? `${activeBg} animate-pulse` : 'bg-slate-600'}`}></span>
                                    {countryValue === c.name ? 'SELECTED' : `${c.holidays}+ HOLIDAYS`}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            
            <div className={`transition-all duration-500 mt-4 ${countryValue ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
                    State / Region (Optional)
                </label>
                <DebouncedInput 
                    value={regionValue}
                    onChange={onRegionChange}
                    placeholder="e.g. California, Victoria..."
                    isLime={isLime}
                />
            </div>
        </div>
    );
};


// --- STEP COMPONENTS ---

/**
 * Ensures PTO inputs always resolve to a safe, non-negative integer.
 * We sanitize user input before saving into prefs so validation logic
 * can rely on deterministic numeric values.
 */
const normalizePtoValue = (rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return Math.min(parsed, 365); // prevent unrealistic values from skewing calculations
};

export const Step1PTO: React.FC<StepProps> = ({ prefs, updatePrefs, onNext }) => {
  const userDays = prefs.ptoDays;
  const buddyDays = prefs.buddyPtoDays || 0;

  const [localPto, setLocalPto] = useState<string>(userDays.toString());
  const [localBuddyPto, setLocalBuddyPto] = useState<string>(buddyDays.toString());

  useEffect(() => {
    setLocalPto(userDays.toString());
  }, [userDays]);

  useEffect(() => {
    if (prefs.hasBuddy) setLocalBuddyPto(buddyDays.toString());
  }, [buddyDays, prefs.hasBuddy]);

  const handlePtoChange = (valStr: string) => {
    setLocalPto(valStr);
    updatePrefs('ptoDays', normalizePtoValue(valStr));
  };

  const handleBuddyPtoChange = (valStr: string) => {
    setLocalBuddyPto(valStr);
    updatePrefs('buddyPtoDays', normalizePtoValue(valStr));
  };

  const totals = React.useMemo(() => {
    const total = userDays + (prefs.hasBuddy ? buddyDays : 0);
    const safeTotal = Number.isFinite(total) ? total : 0;

    return {
      totalDays: safeTotal,
      valueEstimate: safeTotal * DAILY_VALUE_ESTIMATE,
      potentialDays: Math.round(safeTotal * EFFICIENCY_MULTIPLIER),
    };
  }, [buddyDays, prefs.hasBuddy, userDays]);

  const { totalDays, valueEstimate, potentialDays } = totals;

  const canProceed = totalDays > 0;

  // Guard against navigation even if a disabled state is bypassed (e.g., stale UI state)
  const handleNextClick = () => {
    if (!canProceed) return;
    onNext();
  };

  return (
    <div className="flex flex-col h-full relative pb-32">
      <div className="pt-2">
        <StepHeader 
            stepNumber={1} 
            title="Your PTO Balance"
            subtitle="How many vacation days do you have to use?"
        />
      </div>

      <div className="flex flex-col justify-start w-full mt-2 md:mt-4 overflow-y-auto pb-4 pr-1">
         <div className="flex items-center gap-3 mb-6 bg-white/5 w-max px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors">
             <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Planning for Two?</span>
             <button 
                onClick={() => updatePrefs('hasBuddy', !prefs.hasBuddy)}
                className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${prefs.hasBuddy ? 'bg-brand-violet shadow-[0_0_10px_rgba(124,58,237,0.4)]' : 'bg-slate-700'}`}
             >
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${prefs.hasBuddy ? 'left-5 shadow-sm' : 'left-1'}`}></div>
             </button>
         </div>

         <div className={`grid gap-4 md:gap-8 ${prefs.hasBuddy ? 'grid-cols-1 md:grid-cols-2 relative' : 'grid-cols-1 max-w-2xl'}`}>
             
             {prefs.hasBuddy && (
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0F1014] border border-white/10 z-10 items-center justify-center text-slate-500 text-xs">
                    +
                </div>
             )}

             <div className="relative group w-full bg-lime-accent/5 rounded-2xl p-4 md:p-6 border border-lime-accent/10 focus-within:border-lime-accent focus-within:ring-1 focus-within:ring-lime-accent/50 focus-within:shadow-[0_0_20px_rgba(132,204,22,0.1)] transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-lime-accent text-dark-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">You</span>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">PTO Balance</label>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-lime-accent shadow-[0_0_5px_rgba(132,204,22,0.8)]"></div>
                </div>
                <div className="relative flex items-baseline gap-4 border-b-2 border-slate-700 group-focus-within:border-lime-accent transition-all duration-500 pb-2">
                    <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        max={90}
                        value={localPto}
                        onChange={(e) => handlePtoChange(e.target.value)}
                        className="w-full bg-transparent text-6xl md:text-8xl font-display font-bold text-white focus:outline-none placeholder-slate-800 transition-all tracking-tighter pr-24"
                        placeholder="0"
                    />
                    <span className="text-sm md:text-xl font-bold text-slate-600 absolute right-0 bottom-4 md:bottom-6 tracking-widest uppercase pointer-events-none">Days</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-medium flex items-center gap-1.5 opacity-80">
                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Enter at least one PTO day to continue.</span>
                </div>
             </div>

             {prefs.hasBuddy && (
                 <div className="relative group w-full animate-fade-up bg-brand-violet/5 rounded-2xl p-4 md:p-6 border border-brand-violet/10 focus-within:border-brand-violet focus-within:ring-1 focus-within:ring-brand-violet/50 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-brand-violet text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">Buddy</span>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">PTO Balance</label>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-brand-violet shadow-[0_0_5px_rgba(124,58,237,0.8)]"></div>
                    </div>
                    <div className="relative flex items-baseline gap-4 border-b-2 border-slate-700 group-focus-within:border-brand-violet transition-all duration-500 pb-2">
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={90}
                            value={localBuddyPto}
                            onChange={(e) => handleBuddyPtoChange(e.target.value)}
                            className="w-full bg-transparent text-6xl md:text-8xl font-display font-bold text-white focus:outline-none placeholder-slate-800 transition-all tracking-tighter pr-24"
                            placeholder="0"
                        />
                        <span className="text-sm md:text-xl font-bold text-slate-600 absolute right-0 bottom-4 md:bottom-6 tracking-widest uppercase pointer-events-none">Days</span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium flex items-center gap-1.5 opacity-80">
                        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Enter buddy's available days.</span>
                    </div>
                 </div>
             )}
         </div>

         <div className={`mt-6 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 transform max-w-2xl ${totalDays >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
                 <div className="w-10 h-10 rounded-xl bg-lime-accent/20 flex items-center justify-center text-xl">💵</div>
                 <div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Joint Value</p>
                     <p className="text-2xl font-display font-bold text-white tracking-tight text-glow">
                        ~${valueEstimate.toLocaleString()}
                     </p>
                 </div>
            </div>
            <div className="flex items-center gap-4 bg-lime-accent/10 border border-lime-accent/20 rounded-2xl p-4 shadow-lg shadow-lime-accent/5">
                 <div className="w-10 h-10 rounded-xl bg-lime-accent text-dark-900 flex items-center justify-center text-xl font-bold">🚀</div>
                 <div>
                     <p className="text-[10px] text-lime-accent/80 font-bold uppercase tracking-wider mb-0.5">Potential Days Off</p>
                     <p className="text-2xl font-display font-bold text-white tracking-tight">
                        ~{potentialDays} Days
                     </p>
                 </div>
            </div>
         </div>
      </div>

      <NavButtons onNext={handleNextClick} nextDisabled={!canProceed} nextLabel="Next Step" />
    </div>
  );
};

export const Step2Timeframe: React.FC<StepProps> = ({ prefs, updatePrefs, onNext, onBack }) => {
  const options = [
    { value: TimeframeType.CALENDAR_2025, label: '2025', desc: 'Jan 1 — Dec 31', tag: 'This Year' },
    { value: TimeframeType.CALENDAR_2026, label: '2026', desc: 'Jan 1 — Dec 31', tag: 'Plan Ahead' },
    { value: TimeframeType.ROLLING_12, label: 'Next 12 Months', desc: 'Rolling Calendar', tag: 'Starting Now' },
  ];

  const handleSelection = (val: TimeframeType) => {
      updatePrefs('timeframe', val);
      setTimeout(onNext, 200);
  };

  return (
    <div className="flex flex-col h-full justify-between pb-32 md:pb-24 relative min-h-[60vh] md:min-h-0">
      <StepHeader 
        stepNumber={2} 
        title="Select Year"
        subtitle="Which calendar should we look at?"
      />

      <div className="grid grid-cols-1 gap-3 md:gap-4 max-w-3xl mb-8 overflow-y-auto pr-1">
        {options.map((opt) => (
            <SelectionCard
                key={opt.value}
                selected={prefs.timeframe === opt.value}
                onClick={() => handleSelection(opt.value)}
                title={opt.label}
                desc={opt.desc}
                tag={opt.tag}
            />
        ))}
      </div>

       <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!prefs.timeframe} />
    </div>
  );
};

export const Step3Strategy: React.FC<StepProps> = ({ prefs, updatePrefs, onNext, onBack }) => {
  
  const handleSelection = (id: string) => {
      updatePrefs('strategy', id);
      setTimeout(onNext, 200);
  };

  return (
    <div className="flex flex-col h-full justify-between pb-32 md:pb-24 relative min-h-[60vh] md:min-h-0">
      <StepHeader 
        stepNumber={3} 
        title="Travel Style"
        subtitle="How do you like to spend your time off?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-8 overflow-y-auto pr-1">
        {STRATEGIES.map((strat) => (
            <SelectionCard
                key={strat.id}
                selected={prefs.strategy === strat.id}
                onClick={() => handleSelection(strat.id)}
                title={strat.title}
                desc={strat.desc}
                tag={strat.roi}
                accentColor={strat.id === OptimizationStrategy.LONG_WEEKENDS ? 'violet' : 'lime'}
                tooltipText={strat.tooltip}
            >
                {/* Decorative gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${strat.color} opacity-0 transition-opacity duration-500 ${prefs.strategy === strat.id ? 'opacity-100' : 'group-hover:opacity-20'}`}></div>
            </SelectionCard>
        ))}
      </div>

       <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!prefs.strategy} />
    </div>
  );
};

export const Step4Location: React.FC<StepProps> = ({ prefs, updatePrefs, onNext, onBack }) => {
    
    const nextDisabled = !prefs.country || (prefs.hasBuddy && !prefs.buddyCountry);
    const [generating, setGenerating] = useState(false);
    
    const handleCopyMine = () => {
        updatePrefs('buddyCountry', prefs.country);
        updatePrefs('buddyRegion', prefs.region);
    };

    const handleGenerateClick = () => {
        setGenerating(true);
        // Small delay to let the user see the button reaction before unmounting
        setTimeout(() => {
            onNext();
        }, 600);
    };

    return (
        <div className="flex flex-col h-full justify-between pb-32 md:pb-24 relative min-h-[60vh] md:min-h-0">
             <StepHeader 
                stepNumber={4} 
                title="Your Location"
                subtitle="We need this to load your public holidays."
            />
            
            <div className="space-y-8 max-w-4xl mb-8 relative overflow-y-auto pr-1 pb-4">
                {/* Connecting Line if buddy exists */}
                {prefs.hasBuddy && (
                    <div className="absolute left-6 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-white/10 z-0 hidden md:block"></div>
                )}

                {/* User Location */}
                <div className="relative z-10">
                    <LocationSelector 
                        label="Your Region"
                        countryValue={prefs.country}
                        regionValue={prefs.region}
                        onCountryChange={(v) => updatePrefs('country', v)}
                        onRegionChange={(v) => updatePrefs('region', v)}
                        accentColor="lime"
                    />
                </div>

                {/* Buddy Location */}
                {prefs.hasBuddy && (
                    <div className="animate-fade-up relative z-10">
                        <div className="flex items-center gap-4 mb-2 opacity-50 pl-1">
                            <div className="h-px flex-1 bg-white/10"></div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Matching Holidays With</div>
                            <div className="h-px flex-1 bg-white/10"></div>
                        </div>
                        <LocationSelector 
                            label="Buddy's Region"
                            countryValue={prefs.buddyCountry || ''}
                            regionValue={prefs.buddyRegion || ''}
                            onCountryChange={(v) => updatePrefs('buddyCountry', v)}
                            onRegionChange={(v) => updatePrefs('buddyRegion', v)}
                            accentColor="violet"
                            isBuddy={true}
                            onCopyMine={prefs.country ? handleCopyMine : undefined}
                        />
                    </div>
                )}
            </div>

            <NavButtons 
                onNext={handleGenerateClick} 
                onBack={onBack} 
                nextDisabled={nextDisabled} 
                nextLabel="Generate Plan"
                isLoading={generating}
            />
        </div>
    );
};