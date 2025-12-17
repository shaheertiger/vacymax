import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { OptimizationResult, UserPreferences } from '../types';
import { PaymentModal, getRegionalPrice } from './PaymentModal';
import { formatDate, formatCurrency, generateGoogleCalendarLink, downloadICS } from '../services/utils';
import { HolidayTooltip, EfficiencyGauge, DistributionChart, YearTimeline } from './Visualizations';
import { CountUpNumber } from './Celebrations';
import { ShareableGraphic } from './ShareableGraphic';

// Social Share Component
const SocialShare: React.FC<{ totalDaysOff: number; ptoUsed: number; multiplier: number }> = ({ totalDaysOff, ptoUsed, multiplier }) => {
    const [showCopied, setShowCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const shareText = `I just optimized my PTO and turned ${ptoUsed} days into ${totalDaysOff} days off (${multiplier > 1 ? `+${((multiplier - 1) * 100).toFixed(0)}%` : 'infinite'} efficiency)! Plan your perfect year at`;
    const shareUrl = 'https://doublemyholidays.com';

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const handleFacebookShare = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const handleLinkedInShare = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs bg-white hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg text-gray-500 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white border border-rose-100 rounded-xl shadow-xl p-3 z-50 min-w-[200px] animate-fade-up">
                        <p className="text-xs text-gray-500 mb-3 font-medium">Share your results</p>
                        <div className="space-y-2">
                            <button
                                onClick={handleTwitterShare}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="text-sm text-gray-700">Share on X</span>
                            </button>
                            <button
                                onClick={handleFacebookShare}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-sm text-gray-700">Share on Facebook</span>
                            </button>
                            <button
                                onClick={handleLinkedInShare}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                <span className="text-sm text-gray-700">Share on LinkedIn</span>
                            </button>
                            <hr className="border-gray-100" />
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-700">
                                    {showCopied ? 'Copied!' : 'Copy link'}
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface ResultsViewProps {
    result: OptimizationResult;
    onReset: () => void;
    onUnlock: () => void;
    onUnlockStart?: () => void;
    onUnlockFailure?: (message?: string) => void;
    isLocked: boolean;
    shouldPromptUnlock?: boolean;
    onUnlockPromptHandled?: () => void;
    lockNotice?: string | null;
    userCountry?: string;
    prefs: UserPreferences;
    onSavePlan?: (name?: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
    result,
    onReset,
    onUnlock,
    onUnlockStart,
    onUnlockFailure,
    isLocked,
    shouldPromptUnlock,
    onUnlockPromptHandled,
    lockNotice,
    userCountry,
    prefs,
    onSavePlan
}) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareGraphic, setShowShareGraphic] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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

    useEffect(() => {
        const handleResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const efficiencyLabel = isInfiniteEfficiency ? 'Infinite efficiency' : `+${((multiplier - 1) * 100).toFixed(0)}%`;

    const handleUnlockClick = useCallback(() => {
        onUnlockStart?.();
        setShowPaymentModal(true);
    }, [onUnlockStart]);

    const handleClosePaymentModal = useCallback(() => {
        setShowPaymentModal(false);
        if (isLocked) {
            onUnlockFailure?.();
        }
    }, [isLocked, onUnlockFailure]);
    const handlePaymentSuccess = useCallback(() => {
        setShowPaymentModal(false);
        onUnlock();
    }, [onUnlock]);

    useEffect(() => {
        if (shouldPromptUnlock && isLocked) {
            onUnlockStart?.();
            setShowPaymentModal(true);
            onUnlockPromptHandled?.();
        }
    }, [isLocked, onUnlockPromptHandled, onUnlockStart, shouldPromptUnlock]);

    const handleSavePlan = useCallback(() => {
        if (!onSavePlan || isSaved || isLocked) {
            return;
        }

        onSavePlan();
        setIsSaved(true);
    }, [onSavePlan, isSaved, isLocked]);

    if (!result.vacationBlocks || result.vacationBlocks.length === 0) {
        return (
            <div className="max-w-4xl mx-auto pt-12 text-center animate-enter">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                    🔍
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No optimal blocks found</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {result.summary || 'Try adjusting your preferences to find more opportunities.'}
                </p>
                <button onClick={onReset} className="px-6 py-3 bg-gradient-to-r from-rose-accent to-peach-accent hover:shadow-lg text-white rounded-xl font-bold transition-all active:scale-95 shadow-md">
                    Try Different Settings
                </button>
            </div>
        )
    }

    const mobilePrimaryLabel = isLocked ? 'Unlock full plan' : isSaved ? 'Saved to device' : 'Save plan';

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

            {lockNotice && (
                <div className="max-w-6xl mx-auto w-full">
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm shadow-sm flex items-start gap-3">
                        <span className="mt-0.5">🔒</span>
                        <div className="space-y-1">
                            <p className="font-semibold">{lockNotice}</p>
                            <button
                                onClick={handleUnlockClick}
                                className="inline-flex items-center gap-2 text-xs font-bold text-rose-accent hover:text-rose-600"
                            >
                                Unlock now
                                <span aria-hidden>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShareGraphic && (
                <ShareableGraphic
                    result={result}
                    onClose={() => setShowShareGraphic(false)}
                />
            )}

            {/* Mobile bottom action rail for iPhone-friendly reachability */}
            {isMobile && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-[85] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pointer-events-none">
                    <div className="max-w-xl mx-auto bg-white/95 border border-rose-100 shadow-[0_18px_32px_rgba(0,0,0,0.1)] rounded-[20px] px-4 py-3 flex items-center gap-3 backdrop-blur-xl pointer-events-auto">
                        <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-accent flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-accent animate-pulse"></span>
                                {isLocked ? `Unlock ${hiddenCount} trips` : 'Keep handy'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 truncate">{result.planName || 'Optimal Schedule'}</p>
                            <p className="text-[11px] text-gray-500 truncate">{result.totalDaysOff} days off • {efficiencyLabel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={isLocked ? handleUnlockClick : handleSavePlan}
                                className={`px-3 py-2 rounded-xl text-[13px] font-semibold shadow-md active:scale-95 transition-all ${isLocked ? 'bg-gradient-to-r from-rose-accent to-peach-accent text-white' : 'bg-rose-50 text-rose-accent border border-rose-100'}`}
                            >
                                {mobilePrimaryLabel}
                            </button>
                            <button
                                onClick={() => setShowShareGraphic(true)}
                                className="p-2 rounded-xl text-[12px] font-semibold bg-white text-gray-600 border border-rose-100 shadow-sm active:scale-95"
                                aria-label="Share plan"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h10" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Hero Snapshot */}
            {isMobile && (
                <div className="md:hidden -mt-2 animate-enter">
                    <div className="bg-gradient-to-br from-white via-rose-50 to-lavender-50 rounded-[28px] p-4 border border-rose-100 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-accent">Your result</p>
                                <h2 className="text-2xl font-display font-bold text-gray-800 leading-tight">{result.planName || 'Optimal Schedule'}</h2>
                                <p className="text-sm text-gray-500">{viewMode === 'joint' && hasBuddy ? 'Shared calendar ready for two' : 'Personalized recharge plan'}</p>
                            </div>
                            <div className="bg-white border border-rose-100 text-rose-accent rounded-2xl px-3 py-2 text-center shadow-sm">
                                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">Days Off</div>
                                <div className="text-xl font-display font-extrabold">{result.totalDaysOff}</div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {[
                                { label: efficiencyLabel, accent: 'bg-rose-100', dot: 'bg-rose-accent' },
                                { label: `${formatCurrency(result.totalValueRecovered)} saved`, accent: 'bg-lavender-100', dot: 'bg-lavender-accent' },
                            ].map((chip) => (
                                <span key={chip.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-gray-700 border text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${chip.accent}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${chip.dot}`}></span>
                                    {chip.label}
                                </span>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            {viewMode === 'joint' && hasBuddy ? 'Built for two — together mode' : 'Solo focus — me time first'}
                        </p>

                        {hasBuddy && (
                            <div className="mt-4">
                                <div className="inline-flex bg-white/80 border border-rose-100 rounded-full p-1 shadow-inner">
                                    <button
                                        onClick={() => setViewMode('joint')}
                                        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full transition-all duration-300 ${viewMode === 'joint' ? 'bg-rose-100 text-rose-600 shadow' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Together
                                    </button>
                                    <button
                                        onClick={() => setViewMode('solo')}
                                        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full transition-all duration-300 ${viewMode === 'solo' ? 'bg-rose-100 text-rose-600 shadow' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Me Time
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                        <div className="flex gap-2 flex-wrap justify-end">
                        <SocialShare
                            totalDaysOff={result.totalDaysOff}
                            ptoUsed={result.totalPtoUsed}
                            multiplier={multiplier}
                        />
                        <button
                            onClick={() => setShowShareGraphic(true)}
                            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-rose-accent to-peach-accent text-white px-3 py-1.5 rounded-lg transition-all hover:shadow-md hover:scale-105 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Create Graphic
                        </button>
                        {onSavePlan && (
                            <button
                                onClick={handleSavePlan}
                                disabled={isSaved || isLocked}
                                className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-all shadow-sm ${
                                    isSaved
                                        ? 'bg-green-50 border-green-200 text-green-600'
                                        : isLocked
                                            ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white hover:bg-lavender-50 border-lavender-100 text-lavender-accent hover:scale-105 active:scale-95'
                                }`}
                            >
                                {isSaved ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        Save Plan
                                    </>
                                )}
                            </button>
                        )}
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
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-accent border border-rose-100 md:hidden">
                                            {block.ptoDaysUsed}d you
                                            {viewMode === 'joint' && hasBuddy && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    {(block.buddyPtoDaysUsed ?? 0)}d partner
                                                </>
                                            )}
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
