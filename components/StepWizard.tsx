import React, { useState, useEffect } from 'react';
import { UserPreferences, OptimizationStrategy, TimeframeType } from '../types';
import { StepHeader, NavButtons, SelectionCard, DebouncedInput } from './Shared';
import { useHaptics } from '../hooks/useMobileUX';

const TOTAL_STEPS = 2; // Consolidated from 4 to 2 steps

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
        id: 'The "CEO" Schedule' as OptimizationStrategy,
        title: 'The "CEO" Schedule ✨',
        desc: 'Mix long trips with long weekends. Perfect balance of adventure and recovery.',
        fullDesc: 'The ultimate power move. We identify the highest-value opportunities to create a schedule that balances restoration with ambition. Ideal for busy leaders.',
        roi: 'Most Popular',
        color: 'from-rose-500/10 to-peach-500/10',
    },
    {
        id: 'The Socialite' as OptimizationStrategy,
        title: 'The Socialite 🥂',
        desc: 'Maximize events and weekend getaways. More frequent, shorter breaks.',
        fullDesc: "Never miss a moment. We optimize your calendar for frequency, ensuring you're always the one with plans. Great for event lovers and frequent travelers.",
        roi: 'Stress Free',
        color: 'from-lavender-500/10 to-indigo-500/10',
    },
    {
        id: 'The Jetsetter' as OptimizationStrategy,
        title: 'The Jetsetter ✈️',
        desc: 'Prioritize longer trips for international travel and deep resets.',
        fullDesc: "Pack your bags. We find the longest continuous blocks of time to facilitate international travel and complete disconnection. Perfect for travelers.",
        roi: 'Traveler',
        color: 'from-amber-500/10 to-orange-500/10',
    },
    {
        id: 'The Wellness Era' as OptimizationStrategy,
        title: 'The Wellness Era 🧘‍♀️',
        desc: 'Regular mini-breaks for consistent self-care and recharge.',
        fullDesc: "Sustainable living. We structure your year with rhythm and routine, ensuring you never go too long without a recharge. Best for mental health focus.",
        roi: 'Healthy',
        color: 'from-emerald-500/10 to-teal-500/10',
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

// New consolidated Step 1: Essentials (Country + PTO + Year)
export const Step1PTO: React.FC<StepProps> = React.memo(({ prefs, updatePrefs, onNext, direction = 'next', validationState }) => {
    const { trigger } = useHaptics();
    const userDays = prefs.ptoDays;

    const [localPto, setLocalPto] = useState<string>(userDays.toString());

    useEffect(() => {
        setLocalPto(userDays.toString());
    }, [userDays]);

    const handlePtoChange = (valStr: string) => {
        setLocalPto(valStr);
        const val = normalizePtoValue(valStr);
        updatePrefs('ptoDays', val);

        if (val > 0 && val % 5 === 0) {
            trigger('light');
        }
    };

    const handlePresetClick = (val: string) => {
        trigger('light');
        handlePtoChange(val);
    };

    const handleCountryChange = (country: string) => {
        trigger('light');
        updatePrefs('country', country);
    };

    const handleYearChange = (year: TimeframeType) => {
        trigger('light');
        updatePrefs('timeframe', year);
    };

    const totals = React.useMemo(() => {
        const safeTotal = Number.isFinite(userDays) ? userDays : 0;

        return {
            totalDays: safeTotal,
            valueEstimate: safeTotal * DAILY_VALUE_ESTIMATE,
            potentialDays: Math.round(safeTotal * EFFICIENCY_MULTIPLIER),
        };
    }, [userDays]);

    const { totalDays, valueEstimate, potentialDays } = totals;

    // Validation: need PTO days and country
    const isValid = totalDays > 0 && Boolean(prefs.country);
    const helperText = !totalDays ? 'Add at least 1 PTO day' : !prefs.country ? 'Select your country' : '';

    const handleNextClick = () => {
        if (!isValid) return;
        trigger('success');
        onNext();
    };

    const yearOptions = [
        { value: 'Calendar Year 2025' as TimeframeType, label: '2025', tag: 'Closing' },
        { value: 'Calendar Year 2026' as TimeframeType, label: '2026', tag: 'Recommended' },
        { value: 'Next 12 Months' as TimeframeType, label: 'Next 12mo', tag: 'Flexible' },
    ];

    return (
        <div className={`flex flex-col h-full relative pb-32 animate-in fade-in ${direction === 'back' ? 'slide-in-from-left-8' : 'slide-in-from-right-8'} duration-500 will-change-transform`}>
            <div className="pt-2">
                <StepHeader
                    stepNumber={1}
                    totalSteps={TOTAL_STEPS}
                    title="Your Dream Year Starts Here ✨"
                    subtitle="Tell us the essentials to create your perfect schedule"
                />
            </div>

            <div className="flex flex-col justify-start w-full mt-2 md:mt-4 pb-4 pr-1 flex-1 space-y-6">

                {/* Country Selection - Moved to top */}
                <div className="bg-white/80 rounded-3xl p-4 md:p-6 border border-rose-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-accent"></div>
                        <label className="text-xs font-bold text-rose-accent uppercase tracking-widest">Where's Home? 🏡</label>
                        {prefs.country && (
                            <span className="ml-auto text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                                Auto-detected
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                        {COUNTRIES.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => handleCountryChange(c.name)}
                                className={`relative group flex flex-col items-center justify-center p-3 min-h-[72px] rounded-2xl border transition-all duration-300 active:scale-95 ${prefs.country === c.name
                                    ? 'bg-white border-rose-accent shadow-lg scale-[1.02] ring-1 ring-inset ring-rose-50'
                                    : 'bg-white/40 border-white/60 hover:bg-white/80 hover:border-rose-200'
                                }`}
                            >
                                <span className="text-3xl mb-2 filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{c.flag}</span>
                                <span className={`text-[10px] font-bold text-center ${prefs.country === c.name ? 'text-gray-800' : 'text-gray-400'}`}>{c.code}</span>
                                {prefs.country === c.name && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-accent"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PTO Days Input */}
                <div className="bg-gradient-to-br from-white to-rose-50/30 rounded-3xl p-4 md:p-6 border border-rose-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-accent"></div>
                            <label className="text-xs font-bold text-rose-accent uppercase tracking-widest">PTO Days 💸</label>
                        </div>
                        <div className="flex gap-1.5 md:gap-2">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => handlePresetClick(preset.toString())}
                                    className={`text-xs font-bold px-3 py-1.5 min-w-[44px] min-h-[32px] rounded-lg border transition-all active:scale-95 ${userDays === preset ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-white text-gray-400 border-gray-100 hover:border-rose-100'}`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex items-baseline gap-2 mb-4">
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={60}
                            value={localPto}
                            onChange={(e) => handlePtoChange(e.target.value)}
                            className="bg-transparent text-5xl md:text-6xl font-display font-bold text-gray-800 focus:outline-none placeholder-gray-200 tracking-tight w-full"
                            placeholder="15"
                        />
                        <span className="text-lg font-bold text-gray-300 absolute right-0 bottom-3 uppercase tracking-widest pointer-events-none">Days</span>
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

                {/* Year Selection - Compact pills */}
                <div className="bg-white/80 rounded-3xl p-4 md:p-6 border border-rose-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-accent"></div>
                        <label className="text-xs font-bold text-rose-accent uppercase tracking-widest">Timeline 📅</label>
                        {prefs.timeframe === ('Calendar Year 2026' as TimeframeType) && (
                            <span className="ml-auto text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                                Recommended
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {yearOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleYearChange(opt.value)}
                                className={`relative p-3 md:p-4 rounded-2xl border text-center transition-all duration-300 active:scale-95 min-h-[72px] flex flex-col items-center justify-center ${prefs.timeframe === opt.value
                                    ? 'bg-white border-rose-accent shadow-lg ring-1 ring-inset ring-rose-50'
                                    : 'bg-white/40 border-white/60 hover:bg-white/80 hover:border-rose-200'
                                }`}
                            >
                                <span className={`text-xs font-bold mb-1 uppercase ${prefs.timeframe === opt.value ? 'text-rose-600 bg-rose-50' : 'text-gray-400 bg-gray-100'} px-2 py-0.5 rounded`}>
                                    {opt.tag}
                                </span>
                                <span className={`text-lg md:text-xl font-display font-bold ${prefs.timeframe === opt.value ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {opt.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Potential Summary */}
                {totalDays > 0 && prefs.country && (
                    <div className="animate-fade-up">
                        <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Your Potential</p>
                        <div className="bg-gradient-to-br from-rose-50 to-peach-50 border border-rose-100 rounded-2xl p-4 text-center shadow-sm">
                            <p className="text-3xl font-display font-bold text-rose-accent">~{potentialDays} Days Off</p>
                            <p className="text-xs text-gray-500 mt-1">with {totalDays} PTO days in {prefs.country}</p>
                        </div>
                    </div>
                )}
            </div>

            {!isValid && helperText && (
                <p className="text-xs text-rose-500 font-semibold text-center mb-3">{helperText}</p>
            )}

            <NavButtons onNext={handleNextClick} nextDisabled={!isValid} nextLabel="Choose Your Style →" />
        </div>
    );
});

// --- STEP 2 ---
export const Step2Timeframe: React.FC<StepProps> = React.memo(({ prefs, updatePrefs, onNext, onBack, direction = 'next', validationState }) => {
    const options = [
        { value: 'Calendar Year 2026' as TimeframeType, label: '2026', desc: 'Plan your next year early', tag: 'Recommended' },
        { value: 'Calendar Year 2025' as TimeframeType, label: '2025', desc: 'Remaining holidays this year', tag: 'Closing Soon' },
        { value: 'Next 12 Months' as TimeframeType, label: 'Next 12 Months', desc: 'Rolling 12-month calendar', tag: 'Flexible' },
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
                        accentColor={strat.id === ('The Socialite' as OptimizationStrategy) ? 'violet' : 'lime'} // Mapped to Lavender/Rose in component
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
        onNext();
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
