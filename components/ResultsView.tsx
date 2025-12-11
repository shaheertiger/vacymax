import React, { useState, useMemo, useCallback } from 'react';
import { OptimizationResult, UserPreferences } from '../types';
import { PaymentModal, getRegionalPrice } from './PaymentModal';
import { formatDate, formatCurrency, generateGoogleCalendarLink, downloadICS } from '../services/utils';
import { HolidayTooltip, EfficiencyGauge, DistributionChart, YearTimeline } from './Visualizations';
import { CountUpNumber } from './Celebrations';

interface ResultsViewProps {
    result: OptimizationResult;
    onReset: () => void;
    onUnlock: () => void;
    isLocked: boolean;
    userCountry?: string;
    prefs: UserPreferences;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset, onUnlock, isLocked, userCountry, prefs }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // NEW: View Mode Toggle (Joint vs Solo)
    const hasBuddy = result.totalPtoUsedBuddy !== undefined;
    const [viewMode, setViewMode] = useState<'joint' | 'solo'>('joint');

    // Memoize expensive calculations to prevent recalculation on every render
    const visibleBlocks = useMemo(() =>
        isLocked ? result.vacationBlocks.slice(0, 1) : result.vacationBlocks,
        [isLocked, result.vacationBlocks]
    );

    const hiddenBlocks = useMemo(() =>
        result.vacationBlocks.slice(1),
        [result.vacationBlocks]
    );

    const hiddenCount = hiddenBlocks.length;

    const hiddenValue = useMemo(() =>
        hiddenBlocks.reduce((acc, b) => acc + b.monetaryValue, 0),
        [hiddenBlocks]
    );

    const bestHiddenBlock = useMemo(() =>
        hiddenBlocks.reduce((prev, current) => {
            return (prev.totalDaysOff > current.totalDaysOff) ? prev : current;
        }, hiddenBlocks[0] || null),
        [hiddenBlocks]
    );

    const price = useMemo(() => getRegionalPrice(userCountry), [userCountry]);

    // --- DYNAMIC STATS CALCULATION (MEMOIZED) ---
    const stats = useMemo(() => {
        let displayedPtoUsed = result.totalPtoUsed;
        let displayedFreeDays = result.totalFreeDays;
        let multiplier = 0;
        let isInfiniteEfficiency = false;

        if (viewMode === 'solo' || !hasBuddy) {
            displayedPtoUsed = result.totalPtoUsed;
            displayedFreeDays = result.totalFreeDays;
            if (displayedPtoUsed === 0 && result.totalDaysOff > 0) {
                isInfiniteEfficiency = true;
            } else if (displayedPtoUsed > 0) {
                multiplier = result.totalDaysOff / displayedPtoUsed;
            }
        } else {
            const combinedPto = result.totalPtoUsed + (result.totalPtoUsedBuddy || 0);
            const combinedGain = result.totalDaysOff * 2;
            displayedPtoUsed = combinedPto;
            displayedFreeDays = combinedGain - combinedPto;
            if (combinedPto === 0 && combinedGain > 0) {
                isInfiniteEfficiency = true;
            } else if (combinedPto > 0) {
                multiplier = combinedGain / combinedPto;
            }
        }

        return {
            displayedPtoUsed,
            displayedFreeDays,
            multiplier,
            isInfiniteEfficiency,
            planStats: {
                totalDays: result.totalDaysOff,
                efficiency: multiplier,
                ptoUsed: result.totalPtoUsed
            }
        };
    }, [viewMode, hasBuddy, result.totalPtoUsed, result.totalPtoUsedBuddy, result.totalDaysOff, result.totalFreeDays]);

    const { displayedPtoUsed, displayedFreeDays, multiplier, isInfiniteEfficiency, planStats } = stats;

    const handleUnlockClick = useCallback(() => setShowPaymentModal(true), []);
    const handleClosePaymentModal = useCallback(() => setShowPaymentModal(false), []);
    const handlePaymentSuccess = useCallback(() => {
        setShowPaymentModal(false);
        onUnlock();
    }, [onUnlock]);

    if (!result.vacationBlocks || result.vacationBlocks.length === 0) {
        return (
            <div className="max-w-4xl mx-auto pt-12 text-center animate-enter">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No optimal blocks found.</h2>
                <p className="text-gray-500 mb-8">Try adjusting your preferences to find more opportunities.</p>
                <button onClick={onReset} className="px-6 py-3 bg-white border border-rose-100 hover:bg-rose-50 rounded-lg text-rose-accent font-bold transition-all active:scale-95 shadow-sm">Start Over</button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32">

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={handleClosePaymentModal}
                onSuccess={handlePaymentSuccess}
                savedValue={hiddenValue}
                userCountry={userCountry}
                prefs={prefs}
                planStats={planStats}
            />

            {/* Header Cards with Staggered Entrance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                {/* Main Stat Card - Glassmorphism */}
                <div className="lg:col-span-7 md:col-span-2 bg-gradient-to-br from-white to-rose-50/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group animate-enter shadow-sm border border-rose-100">
                    {/* Animated Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-rose-200/30 transition-colors duration-700"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-accent text-[10px] font-bold uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-accent animate-pulse"></span>
                                    {result.planName || "Optimal Schedule"}
                                </div>

                                {/* Interactive Toggle */}
                                {hasBuddy && (
                                    <div className="flex bg-white/60 border border-rose-100 rounded-full p-1 backdrop-blur-md">
                                        <button
                                            onClick={() => setViewMode('joint')}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full transition-all duration-300 ${viewMode === 'joint' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Together
                                        </button>
                                        <button
                                            onClick={() => setViewMode('solo')}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full transition-all duration-300 ${viewMode === 'solo' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Me Time
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-800 mb-2 tracking-tight">
                                <CountUpNumber
                                    end={result.totalDaysOff}
                                    duration={1500}
                                    className="inline-block"
                                /> Days Off
                            </h2>

                            <div className="text-gray-500 text-sm md:text-base min-h-[48px]">
                                {viewMode === 'joint' && hasBuddy ? (
                                    <>Joint wellness plan using <strong className="text-gray-700">{result.totalPtoUsed}</strong> of your days and <strong className="text-gray-700">{result.totalPtoUsedBuddy ?? 0}</strong> partner days.</>
                                ) : (
                                    <>Viewing your personal refresh time: <strong className="text-gray-700">{result.totalPtoUsed} PTO days</strong> used.</>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-rose-50 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Value Recovered</p>
                                <p className="text-2xl font-bold text-gray-800 tracking-tight">
                                    <CountUpNumber
                                        end={result.totalValueRecovered}
                                        duration={2000}
                                        prefix="$"
                                        className="inline-block"
                                    />
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">
                                    {viewMode === 'joint' ? 'Joint Efficiency' : 'Your Efficiency'}
                                </p>
                                <p className="text-2xl font-bold text-rose-accent tracking-tight">
                                    {isInfiniteEfficiency ? '∞' : `+${((multiplier - 1) * 100).toFixed(0)}%`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub Stats - Staggered Entry */}
                <div className="lg:col-span-3 md:col-span-1 animate-enter delay-100">
                    <EfficiencyGauge multiplier={multiplier} isJoint={viewMode === 'joint'} isInfinite={isInfiniteEfficiency} />
                </div>
                <div className="lg:col-span-2 md:col-span-1 animate-enter delay-200">
                    <DistributionChart pto={displayedPtoUsed} free={displayedFreeDays} />
                </div>
            </div>

            <div className="animate-enter delay-300">
                <YearTimeline
                    blocks={visibleBlocks}
                    isLocked={isLocked}
                    timelineStartDate={result.timelineStartDate}
                    targetYear={result.targetYear}
                    viewMode={viewMode}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 animate-enter delay-400">
                    <h3 className="text-xl font-bold text-gray-800">Your Wellness Schedule</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => downloadICS(visibleBlocks)}
                            className="text-xs bg-white hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg text-gray-500 transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            Download .ICS
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {visibleBlocks.map((block, i) => (
                        <div
                            key={block.id}
                            className="bg-white/70 backdrop-blur-sm border border-rose-100 rounded-2xl p-5 md:p-6 transition-all duration-300 group relative overflow-hidden animate-enter hover:shadow-md"
                            style={{ animationDelay: `${500 + (i * 100)}ms` }} // Staggered list items
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-bold bg-white border border-rose-50 px-2 py-0.5 rounded text-gray-400 uppercase tracking-wider shadow-sm">
                                            Trip {i + 1}
                                        </span>
                                        {block.efficiencyScore > 3 && (
                                            <span className="text-[10px] font-bold bg-rose-50 text-rose-accent border border-rose-100 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                ★ Optimal
                                            </span>
                                        )}
                                        {/* View Mode Logic for Tags */}
                                        {viewMode === 'joint' && hasBuddy && (block.buddyPtoDaysUsed ?? 0) === 0 && block.ptoDaysUsed === 0 && (
                                            <span className="text-[10px] font-bold bg-lavender-50 text-lavender-accent border border-lavender-100 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                ♥ Free for Both
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800 tracking-tight">{block.description}</h4>
                                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <span className="flex items-center gap-1.5">
                                            📅 {formatDate(block.startDate)} — {formatDate(block.endDate)}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                                            ⏱ {block.totalDaysOff} Days Off
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-t md:border-t-0 border-rose-50 pt-4 md:pt-0">
                                    <div className="text-right hidden md:block">
                                        <div className="text-xs text-gray-400 uppercase tracking-widest">Pto Cost</div>
                                        <div className="font-bold text-gray-700 text-sm">
                                            You: <span className={block.ptoDaysUsed === 0 ? "text-rose-accent" : ""}>{block.ptoDaysUsed}d</span>
                                            {viewMode === 'joint' && hasBuddy && (
                                                <span className="ml-2 text-gray-400">| Partner: <span className={(block.buddyPtoDaysUsed ?? 0) === 0 ? "text-lavender-accent" : ""}>{block.buddyPtoDaysUsed ?? 0}d</span></span>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={generateGoogleCalendarLink(block)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-accent text-xs font-bold rounded-lg border border-rose-100 transition-all active:scale-95 whitespace-nowrap shadow-sm"
                                    >
                                        Add to Calendar
                                    </a>
                                </div>
                            </div>

                            {block.publicHolidaysUsed.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {block.publicHolidaysUsed.map((h, hi) => (
                                        <HolidayTooltip key={hi} holiday={h} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isLocked && hiddenCount > 0 && (
                <div className="relative mt-8 group cursor-pointer animate-enter delay-500" onClick={handleUnlockClick}>
                    {/* Premium Gradient Border Animation */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-rose-accent via-peach-accent to-rose-accent rounded-[25px] opacity-75 blur-sm group-hover:opacity-100 transition-opacity animate-shimmer bg-[length:200%_100%]"></div>

                    <div className="absolute inset-0 z-10 backdrop-blur-xl bg-white/90 flex items-center justify-center rounded-3xl border border-rose-100">
                        <div className="text-center p-6 md:p-8 max-w-lg mx-auto relative w-full">

                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-accent to-peach-accent text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_4px_10px_rgba(244,63,94,0.3)] z-20 whitespace-nowrap transform group-hover:-translate-y-1 transition-transform">
                                Your Best Life Awaits: Unlock {formatCurrency(hiddenValue)} Value
                            </div>

                            <div className="w-16 h-16 bg-rose-50 text-rose-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100 relative mt-2 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2 leading-tight">
                                {bestHiddenBlock
                                    ? `Unlock your ${bestHiddenBlock.totalDaysOff}-Day ${bestHiddenBlock.description.split(':')[0]} Reset`
                                    : `Reveal ${hiddenCount} More Trips`
                                }
                            </h3>

                            <p className="text-gray-500 mb-8 leading-relaxed text-sm md:text-base">
                                See exactly when to book to get <strong className="text-rose-500">{hiddenCount} more holidays</strong> worth <strong>{formatCurrency(hiddenValue)}</strong>.
                            </p>

                            <button className="w-full py-4 bg-gradient-to-r from-rose-accent to-peach-accent text-white font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)]">
                                <span>Unlock Full Schedule</span>
                                <span className="text-rose-100 font-medium line-through decoration-rose-200/50">$49</span>
                                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-sm">
                                    {price.symbol}{price.amount.toFixed(2)}
                                </span>
                            </button>
                            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 opacity-60">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    <svg className="w-3 h-3 text-rose-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Secure Stripe Checkout</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    <svg className="w-3 h-3 text-rose-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">100% Happiness Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder Card Blur */}
                    <div className="opacity-30 pointer-events-none select-none blur-sm" aria-hidden="true">
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white border border-rose-100 rounded-2xl p-6 h-32 flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-3 w-48 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center pt-8 pb-4 animate-enter delay-500">
                <button onClick={onReset} className="text-gray-400 hover:text-rose-accent text-sm font-bold transition-colors underline decoration-gray-200 hover:decoration-rose-200 underline-offset-4">
                    Start Over
                </button>
            </div>
        </div>
    );
};
