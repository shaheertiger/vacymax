import React, { useState, useEffect } from 'react';
import { UserPreferences, OptimizationStrategy, TimeframeType } from '../types';
import { StepHeader, NavButtons, SelectionCard, DebouncedInput } from './Shared';
import { useHaptics } from '../hooks/useMobileUX';

const TOTAL_STEPS = 4;

// --- CONSTANTS & STATIC DATA ---
const DAILY_VALUE_ESTIMATE = 460;
const EFFICIENCY_MULTIPLIER = 2.8;

const COUNTRIES = [
    { name: "United States", flag: "🇺🇸", code: "US", holidays: 11 },
    { name: "United Kingdom", flag: "🇬🇧", code: "UK", holidays: 8 },
    { name: "Canada", flag: "🇨🇦", code: "CA", holidays: 10 },
    { name: "Australia", flag: "🇦🇺", code: "AU", holidays: 10 },
    { name: "Europe", flag: "🇪🇺", code: "EU", holidays: 12 }, // Added Europe
];

const STRATEGIES = [
    {
        id: OptimizationStrategy.BALANCED,
        title: 'The "CEO" Schedule ✨',
        desc: 'Strategic power moves. Maximum ROI.',
        roi: 'Most Popular',
        color: 'from-rose-500/10 to-peach-500/10',
        tooltip: "The ultimate power move. We identify the highest-value opportunities to create a schedule that balances restoration with ambition."
    },
    {
        id: OptimizationStrategy.LONG_WEEKENDS,
        title: 'The Socialite 🥂',
        desc: 'Maximizing events & weekend trips.',
        roi: 'Stress Free',
        color: 'from-lavender-500/10 to-indigo-500/10',
        tooltip: "Never miss a moment. We optimize your calendar for frequency, ensuring you're always the one with plans."
    },
    {
        id: OptimizationStrategy.EXTENDED,
        title: 'The Jetsetter ✈️',
        desc: 'Long-haul flights & deep exploration.',
        roi: 'Traveler',
        color: 'from-amber-500/10 to-orange-500/10',
        tooltip: "Pack your bags. We prioritize finding the longest continuous blocks of time to facilitate international travel and deep resets."
    },
    {
        id: OptimizationStrategy.MINI_BREAKS,
        title: 'The Wellness Era 🧘‍♀️',
        desc: 'Consistent self-care intervals.',
        roi: 'Healthy',
        color: 'from-emerald-500/10 to-teal-500/10',
        tooltip: "Sustainable living. We structure your year with rhythm and routine, ensuring you never go too long without a recharge."
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
    direction?: 'next' | 'back';
    validationState?: {
        isValid: boolean;
        helperText: string;
    };
}

const LocationSelector = React.memo(({
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
    // Logic handles remapping 'lime' -> rose in visuals inside the component, but we keep props consistent
    const isRose = accentColor === 'lime';
    const activeText = isRose ? 'text-rose-accent' : 'text-lavender-accent';
    const activeBg = isRose ? 'bg-rose-accent' : 'bg-lavender-accent';
    const borderClass = isRose ? 'border-rose-accent/40' : 'border-lavender-accent/40';
    const shadowClass = isRose ? 'shadow-rose-accent/10' : 'shadow-lavender-accent/10';

    return (
        <div className={`${isBuddy ? 'bg-lavender-50/50 border border-lavender-100' : 'bg-white/60 border border-rose-100'} rounded-3xl p-4 md:p-6 transition-all duration-500 shadow-sm hover:shadow-md backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center gap-2 text-xs font-bold ${activeText} uppercase tracking-widest pl-1`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${activeBg}`}></div>
                    {label}
                </div>
                {onCopyMine && (
                    <button
                        onClick={onCopyMine}
                        className="text-[10px] font-bold bg-lavender-50 text-lavender-accent hover:bg-lavender-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-lavender-100"
                    >
                        <span>Same as mine</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mb-6">
                {COUNTRIES.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => onCountryChange(c.name)}
                        className={`relative group flex flex-col items-center justify-center p-3 md:p-3 min-h-[72px] rounded-2xl border transition-all duration-300 active:scale-95 ${countryValue === c.name
                            ? `bg-white ${borderClass} ${shadowClass} shadow-lg scale-[1.02] ring-1 ring-inset ${isRose ? 'ring-rose-50' : 'ring-lavender-50'}`
                            : 'bg-white/40 border-white/60 hover:bg-white/80 hover:border-rose-200'
                            }`}
                    >
                        <span className="text-3xl mb-2 filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{c.flag}</span>
                        <span className={`text-[10px] font-bold text-center ${countryValue === c.name ? 'text-gray-800' : 'text-gray-400'}`}>{c.code}</span>

                        {countryValue === c.name && (
                            <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${activeBg}`}></div>
                        )}
                    </button>
                ))}
            </div>

            <div className={`transition-all duration-500 ${countryValue ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2 pointer-events-none'}`}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    Specific State / Region (Optional)
                </label>
                <DebouncedInput
                    value={regionValue}
                    onChange={onRegionChange}
                    placeholder="e.g. California, Victoria..."
                    isLime={isRose}
                    className="text-sm py-2.5 bg-white"
                />
            </div>
        </div>
    );
});


// --- STEP COMPONENTS ---

const normalizePtoValue = (rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return Math.min(parsed, 365);
};

const PRESETS = [10, 15, 20, 25];

export const Step1PTO: React.FC<StepProps> = React.memo(({ prefs, updatePrefs, onNext, direction = 'next', validationState }) => {
    const { trigger } = useHaptics();
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
        const val = normalizePtoValue(valStr);
        updatePrefs('ptoDays', val);

        // Haptic tick every 5 days for tactile feel
        if (val > 0 && val % 5 === 0) {
            trigger('light');
        }
    };

    const handleBuddyPtoChange = (valStr: string) => {
        setLocalBuddyPto(valStr);
        const val = normalizePtoValue(valStr);
        updatePrefs('buddyPtoDays', val);

        if (val > 0 && val % 5 === 0) trigger('light');
    };

    const handlePresetClick = (val: string) => {
        trigger('light');
        handlePtoChange(val);
    };

    const handleToggleClick = () => {
        trigger('medium');
        updatePrefs('hasBuddy', !prefs.hasBuddy);
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
    const isValid = validationState?.isValid ?? totalDays > 0;
    const helperText = validationState?.helperText;

    const handleNextClick = () => {
        if (!isValid) return;
        trigger('success');
        onNext();
    };

    return (
        <div className={`flex flex-col h-full relative pb-32 animate-in fade-in ${direction === 'back' ? 'slide-in-from-left-8' : 'slide-in-from-right-8'} duration-500 will-change-transform`}>
            <div className="pt-2">
                <StepHeader
                    stepNumber={1}
                    totalSteps={TOTAL_STEPS}
                    title="Your Freedom Fund 💸"
                    subtitle="How many days can you invest in yourself this year?"
                />
            </div>

            <div className="flex flex-col justify-start w-full mt-2 md:mt-4 pb-4 pr-1 flex-1">
                {/* Buddy Toggle - Larger touch target */}
                <div className="flex items-center gap-3 mb-4 md:mb-8 bg-white/60 w-max px-4 py-2 md:py-2 rounded-full border border-rose-100 hover:border-rose-200 transition-colors shadow-sm">
                    <span className="text-xs md:text-[10px] font-bold uppercase tracking-wider text-gray-500">Planning with a partner?</span>
                    <button
                        onClick={handleToggleClick}
                        className={`group relative inline-flex h-7 w-12 md:h-5 md:w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-accent focus-visible:ring-offset-2 ${prefs.hasBuddy ? 'bg-rose-accent' : 'bg-gray-300'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 md:h-4 md:w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${prefs.hasBuddy ? 'translate-x-5 md:translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    {prefs.hasBuddy && <span className="text-sm md:text-xs animate-fade-in pl-1">👯‍♀️</span>}
                </div>

                <div className={`grid gap-4 md:gap-8 ${prefs.hasBuddy ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>

                    {/* User Input Card */}
                    <div className="relative group w-full bg-gradient-to-br from-white to-rose-50/30 rounded-3xl p-6 border border-rose-100 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                {prefs.hasBuddy && <span className="bg-rose-accent text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">You</span>}
                                <label className="text-xs font-bold text-rose-300 uppercase tracking-widest">Your Days</label>
                            </div>
                            {/* Quick Select Chips - larger on mobile */}
                            <div className="flex gap-1.5 md:gap-2">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => handlePresetClick(preset.toString())}
                                        className={`text-xs md:text-[10px] font-bold px-3 md:px-2 py-2 md:py-1 min-w-[44px] min-h-[36px] md:min-h-0 md:min-w-0 rounded-xl md:rounded-lg border transition-all active:scale-95 ${userDays === preset ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-white text-gray-400 border-gray-100 hover:border-rose-100'}`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex items-baseline gap-2 mb-6">
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min={0}
                                max={60}
                                value={localPto}
                                onChange={(e) => handlePtoChange(e.target.value)}
                                className="bg-transparent text-5xl md:text-7xl font-display font-bold text-gray-800 focus:outline-none placeholder-gray-200 tracking-tight w-full"
                                placeholder="0"
                            />
                            <span className="text-xl font-bold text-gray-300 absolute right-0 bottom-4 uppercase tracking-widest pointer-events-none">Days</span>

                            {/* Dynamic Encouragement Chip */}
                            {userDays >= 15 && (
                                <div className="absolute -bottom-3 right-0 bg-rose-500 text-white text-[10px] font-bold py-1 px-3 rounded-full animate-bounce shadow-sm whitespace-nowrap pointer-events-none">
                                    Love that for you! 💅
                                </div>
                            )}
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={userDays}
                            onChange={(e) => handlePtoChange(e.target.value)}
                            className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-accent hover:accent-rose-500 touch-pan-x"
                        />
                    </div>

                    {/* Buddy Input Card */}
                    {prefs.hasBuddy && (
                        <div className="relative group w-full bg-gradient-to-br from-white to-lavender-50/30 rounded-3xl p-6 border border-lavender-100 transition-all duration-300 animate-fade-up hover:shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="bg-lavender-accent text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Partner</span>
                                    <label className="text-xs font-bold text-lavender-300 uppercase tracking-widest">Days Available</label>
                                </div>
                            </div>

                            <div className="relative flex items-baseline gap-2 mb-6">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    min={0}
                                    max={60}
                                    value={localBuddyPto}
                                    onChange={(e) => handleBuddyPtoChange(e.target.value)}
                                    className="bg-transparent text-5xl md:text-7xl font-display font-bold text-gray-800 focus:outline-none placeholder-gray-200 tracking-tight w-full"
                                    placeholder="0"
                                    style={{ color: '#4B5563' }} // Force dark text
                                />
                                <span className="text-xl font-bold text-gray-300 absolute right-0 bottom-4 uppercase tracking-widest pointer-events-none">Days</span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="40"
                                value={buddyDays}
                                onChange={(e) => handleBuddyPtoChange(e.target.value)}
                                className="w-full h-2 bg-lavender-100 rounded-lg appearance-none cursor-pointer accent-lavender-accent hover:accent-lavender-500 touch-pan-x"
                            />
                        </div>
                    )}
                </div>

                <div className={`mt-8 transition-all duration-500 transform ${totalDays > 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Your Potential</p>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <div className="bg-white/60 border border-rose-100 rounded-2xl p-4 text-center shadow-sm">
                            <p className="text-2xl font-display font-bold text-gray-800">~${valueEstimate.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Value Recovered</p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-peach-50 border border-rose-100 rounded-2xl p-4 text-center shadow-sm">
                            <p className="text-2xl font-display font-bold text-rose-accent">~{potentialDays} Days</p>
                            <p className="text-[10px] text-rose-400 uppercase tracking-wider">Total Time Off</p>
                        </div>
                    </div>
                </div >
            </div >

            {!isValid && helperText && (
                <p className="text-xs text-rose-500 font-semibold text-center mb-3">{helperText}</p>
            )}

            <NavButtons onNext={handleNextClick} nextDisabled={!isValid} nextLabel="Confirm Balance" />
        </div >
    );
});

// --- STEP 2 ---
export const Step2Timeframe: React.FC<StepProps> = React.memo(({ prefs, updatePrefs, onNext, onBack, direction = 'next', validationState }) => {
    const options = [
        { value: TimeframeType.CALENDAR_2026, label: '2026', desc: 'Plan your next year early', tag: 'Recommended' },
        { value: TimeframeType.CALENDAR_2025, label: '2025', desc: 'Remaining holidays this year', tag: 'Closing Soon' },
        { value: TimeframeType.ROLLING_12, label: 'Next 12 Months', desc: 'Rolling 12-month calendar', tag: 'Flexible' },
    ];

    const handleSelection = (val: TimeframeType) => {
        updatePrefs('timeframe', val);
    };

    return (
        <div className={`flex flex-col h-full justify-between pb-32 md:pb-24 relative animate-in fade-in ${direction === 'back' ? 'slide-in-from-left-8' : 'slide-in-from-right-8'} duration-500 will-change-transform`}>
            <StepHeader
                stepNumber={2}
                totalSteps={TOTAL_STEPS}
                title="Pick Your Timeline 📅"
                subtitle="When are we manifesting this dream life?"
            />

            <div className="grid grid-cols-1 gap-4 max-w-3xl mb-8 pr-1">
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

            {!validationState?.isValid && validationState?.helperText && (
                <p className="text-xs text-rose-500 font-semibold text-center mb-3">{validationState.helperText}</p>
            )}

            <NavButtons onNext={onNext} onBack={onBack} nextLabel="Next" nextDisabled={validationState ? !validationState.isValid : false} />
        </div>
    );
});

export const Step3Strategy: React.FC<StepProps> = React.memo(({ prefs, updatePrefs, onNext, onBack, direction = 'next', validationState }) => {

    const handleSelection = (id: string) => {
        updatePrefs('strategy', id as any);
    };

    return (
        <div className={`flex flex-col h-full justify-between pb-32 md:pb-24 relative animate-in fade-in ${direction === 'back' ? 'slide-in-from-left-8' : 'slide-in-from-right-8'} duration-500 will-change-transform`}>
            <StepHeader
                stepNumber={3}
                totalSteps={TOTAL_STEPS}
                title="Your Energy ⚡"
                subtitle="How do you want to spend your well-deserved breaks?"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-8 pr-1">
                {STRATEGIES.map((strat) => (
                    <SelectionCard
                        key={strat.id}
                        selected={prefs.strategy === strat.id}
                        onClick={() => handleSelection(strat.id)}
                        title={strat.title}
                        desc={strat.desc}
                        tag={strat.roi}
                        accentColor={strat.id === OptimizationStrategy.LONG_WEEKENDS ? 'violet' : 'lime'} // Mapped to Lavender/Rose in component
                        tooltipText={strat.tooltip}
                    >
                        {/* Decorative gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${strat.color} opacity-0 transition-opacity duration-500 rounded-3xl ${prefs.strategy === strat.id ? 'opacity-100' : 'group-hover:opacity-20'}`}></div>
                    </SelectionCard>
                ))}
            </div>

            {!validationState?.isValid && validationState?.helperText && (
                <p className="text-xs text-rose-500 font-semibold text-center mb-3">{validationState.helperText}</p>
            )}

            <NavButtons onNext={onNext} onBack={onBack} nextLabel="Next" nextDisabled={validationState ? !validationState.isValid : false} />
        </div>
    );
});

export const Step4Location: React.FC<StepProps> = React.memo(({ prefs, updatePrefs, onNext, onBack, direction = 'next', validationState }) => {

    const nextDisabled = validationState ? !validationState.isValid : false;
    const [generating, setGenerating] = useState(false);
    const [loadingText, setLoadingText] = useState("Generate Plan");

    // Reset generating state when component mounts (user navigated back)
    useEffect(() => {
        setGenerating(false);
        setLoadingText("Generate Plan");
    }, []);

    const handleCopyMine = () => {
        updatePrefs('buddyCountry', prefs.country);
        updatePrefs('buddyRegion', prefs.region);
    };

    const handleGenerateClick = () => {
        if (generating || nextDisabled) return; // Prevent multiple clicks

        setGenerating(true);
        setLoadingText("✨ Manifesting...");
        setTimeout(() => setLoadingText("Analysing 14,000+ combos..."), 400);
        setTimeout(() => setLoadingText("Finalizing your dream year..."), 1200);

        setTimeout(() => {
            onNext();
        }, 1800);
    };

    return (
        <div className={`flex flex-col h-full justify-between pb-32 md:pb-24 relative animate-in fade-in ${direction === 'back' ? 'slide-in-from-left-8' : 'slide-in-from-right-8'} duration-500 will-change-transform`}>
            <StepHeader
                stepNumber={4}
                totalSteps={TOTAL_STEPS}
                title="Where's Home Base? 🏡"
                subtitle="We need this to load your local holidays."
            />

            <div className="space-y-4 md:space-y-8 max-w-4xl mb-8 relative pr-1 pb-4">
                {/* Connecting Line if buddy exists */}
                {prefs.hasBuddy && (
                    <div className="absolute left-6 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-rose-200/50 z-0 hidden md:block"></div>
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
                        <div className="flex items-center gap-4 mb-2 opacity-70 pl-1">
                            <div className="h-px flex-1 bg-rose-100"></div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-rose-300">Matching Holidays With</div>
                            <div className="h-px flex-1 bg-rose-100"></div>
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

            {!validationState?.isValid && validationState?.helperText && (
                <p className="text-xs text-rose-500 font-semibold text-center mb-3">{validationState.helperText}</p>
            )}

            <NavButtons
                onNext={handleGenerateClick}
                onBack={generating ? undefined : onBack}
                nextDisabled={nextDisabled || generating}
                nextLabel={generating ? loadingText : "Reveal My Dream Schedule"}
                isLoading={generating}
            />
        </div>
    );
});
