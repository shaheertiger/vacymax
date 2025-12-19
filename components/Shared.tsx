import React, { useState, useEffect, useRef } from 'react';

export const StepHeader = React.memo(({ stepNumber, totalSteps, title, subtitle }: { stepNumber: number, totalSteps: number, title: React.ReactNode, subtitle: string }) => (
    <div className="space-y-1.5 sm:space-y-2 md:space-y-4 mb-3 sm:mb-4 md:mb-10 animate-fade-up px-0.5 sm:px-1">
        <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-4 sm:w-6 md:w-8 h-[1px] bg-rose-accent"></span>
            <span className="text-rose-accent text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.12em] sm:tracking-[0.2em] uppercase">Step {stepNumber}/{totalSteps}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 h-1 sm:h-1.5 md:h-2 rounded-full bg-rose-100 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-rose-accent to-peach-accent transition-all duration-500"
                    style={{ width: `${Math.min((stepNumber / totalSteps) * 100, 100)}%` }}
                />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-rose-300 min-w-[32px] sm:min-w-[46px] text-right">{Math.round((stepNumber / totalSteps) * 100)}%</span>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-gray-800 tracking-tight leading-[1.1]">
                {title}
            </h2>
            <p className="text-[11px] sm:text-sm md:text-base text-gray-500 max-w-xl leading-relaxed">{subtitle}</p>
        </div>
    </div>
));

export const NavButtons = React.memo(({ onNext, onBack, nextDisabled, nextLabel = "Continue", isLoading = false, stepLabel }: { onNext: () => void, onBack?: () => void, nextDisabled?: boolean, nextLabel?: string | null, isLoading?: boolean, stepLabel?: string }) => (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 pb-5 bg-white/95 backdrop-blur-xl border-t-2 border-rose-100 md:sticky md:bottom-6 md:left-12 md:right-12 md:p-0 md:bg-transparent md:border-none flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 animate-fade-up transition-all duration-300 safe-pb shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-none">
        {/* Mobile: Step label on its own row */}
        {stepLabel && (
            <div className="md:hidden flex justify-center pb-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-accent text-xs font-bold tracking-wide shadow-sm border border-rose-100">
                    {stepLabel}
                </span>
            </div>
        )}

        {/* Buttons row */}
        <div className="flex flex-row justify-between items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 md:flex-none md:justify-start">
                {onBack ? (
                    <button onClick={onBack} disabled={isLoading} className="text-gray-500 hover:text-rose-accent px-4 py-3 md:px-4 md:py-2 font-bold transition-colors flex items-center gap-2 text-sm md:text-xs uppercase tracking-widest group rounded-xl md:rounded-lg bg-white hover:bg-rose-50 md:bg-transparent disabled:opacity-50 active:scale-95 min-h-[52px] shadow-md md:shadow-none border border-rose-200 md:border-rose-100 md:border-none whitespace-nowrap">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="inline">Back</span>
                    </button>
                ) : <div className="hidden md:block" />}
            </div>

            <button
                onClick={onNext}
                disabled={nextDisabled || isLoading}
                className="flex-1 md:flex-none md:w-auto relative group overflow-hidden px-5 md:px-10 py-3.5 md:py-4 rounded-xl bg-gradient-to-r from-rose-accent to-peach-accent text-white font-bold font-display text-base md:text-lg tracking-wide hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_30px_rgba(244,63,94,0.4)] active:scale-95 border border-white/20 min-h-[52px] md:min-h-[56px]"
            >
            {isLoading && (
                <div
                    className="absolute inset-0 bg-white/30 z-0"
                    style={{
                        width: '0%',
                        animation: 'fillWidth 1.5s ease-out forwards'
                    }}
                />
            )}
            <style>{`
                @keyframes fillWidth {
                    0% { width: 0% }
                    100% { width: 100% }
                }
            `}</style>

            <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Optimizing...</span>
                    </>
                ) : (
                    <>
                        {nextLabel}
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </>
                )}
            </span>
            </button>
        </div>
    </div>
));

interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    title: string;
    desc: string;
    tag?: string;
    accentColor?: 'lime' | 'violet'; // Keeping prop names for compatibility but mapping to rose/lavender
    tooltipText?: string;
    children?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
    selected,
    onClick,
    title,
    desc,
    tag,
    accentColor = 'lime',
    tooltipText,
    children
}) => {
    // Mapping old props to new colors
    // lime -> rose
    // violet -> lavender
    const isRose = accentColor === 'lime';
    const isLavender = accentColor === 'violet';

    const activeBorder = isRose ? 'border-rose-accent' : 'border-lavender-accent';
    const activeBg = 'bg-white shadow-xl';
    const activeText = isRose ? 'text-rose-accent' : 'text-lavender-accent';
    const tagBg = isRose ? 'bg-rose-100 text-rose-600' : 'bg-lavender-100 text-lavender-600';

    // Softer shadows
    const shadow = selected
        ? (isRose ? 'shadow-[0_10px_40px_-10px_rgba(244,63,94,0.3)]' : 'shadow-[0_10px_40px_-10px_rgba(167,139,250,0.3)]')
        : 'hover:shadow-lg';

    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipClickedOpen, setTooltipClickedOpen] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(hasTouch);
    }, []);

    const closeTooltip = () => {
        setShowTooltip(false);
        setTooltipClickedOpen(false);
    };

    const openTooltip = () => {
        setShowTooltip(true);
        setTooltipClickedOpen(true);
    };

    const handleTooltipClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showTooltip && tooltipClickedOpen) {
            closeTooltip();
        } else {
            openTooltip();
        }
    };

    const handleTooltipTouch = (e: React.TouchEvent) => {
        if (!isTouchDevice) return;
        e.stopPropagation();
        e.preventDefault();

        if (showTooltip && tooltipClickedOpen) {
            closeTooltip();
        } else {
            openTooltip();
        }
    };

    const handleTooltipMouseEnter = () => {
        if (isTouchDevice || !tooltipClickedOpen) {
            setShowTooltip(true);
        }
    };

    const handleTooltipMouseLeave = () => {
        // Only close on mouse leave if not opened via click
        if (!isTouchDevice && !tooltipClickedOpen) {
            setShowTooltip(false);
        }
    };

    return (
        <button
            onClick={onClick}
            className={`group relative p-3.5 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl border text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] active:bg-rose-50 w-full min-h-[80px] sm:min-h-[88px] ${selected
                ? `${activeBg} ${activeBorder} ${shadow} ring-1 ring-inset ${isRose ? 'ring-rose-100' : 'ring-lavender-100'}`
                : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/80 hover:border-rose-200'
                }`}
        >
            {/* Added decorative background glow for selected state */}
            {selected && (
                <div className={`absolute inset-0 rounded-3xl opacity-20 pointer-events-none ${isRose ? 'bg-gradient-to-br from-rose-50 to-peach-50' : 'bg-gradient-to-br from-lavender-50 to-indigo-50'}`} />
            )}

            {children}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    {tag && (
                        <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${selected ? tagBg : 'bg-gray-100 text-gray-500'}`}>
                            {tag}
                        </span>
                    )}

                    <div className="flex items-center gap-2">
                        {tooltipText && (
                            <div
                                className={`relative group/info ${showTooltip ? 'z-[200]' : 'z-10'}`}
                                onClick={handleTooltipClick}
                                onTouchStart={handleTooltipTouch}
                                onMouseEnter={handleTooltipMouseEnter}
                                onMouseLeave={handleTooltipMouseLeave}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-help transition-colors ${selected ? `${activeText} border-current` : 'text-gray-400 border-gray-300 hover:text-rose-400 hover:border-rose-400'}`}>
                                    ?
                                </div>
                                {showTooltip && (
                                    <>
                                        {/* Backdrop for mobile to close tooltip on outside click */}
                                        <div
                                            className="fixed inset-0 z-[199] md:hidden"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowTooltip(false);
                                                setTooltipClickedOpen(false);
                                            }}
                                        />
                                        {/* Tooltip: below on mobile (top-full), above on desktop (md:bottom-full) */}
                                        <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-auto md:top-auto bottom-auto md:bottom-full mt-2 md:mt-0 md:mb-3 w-auto md:w-[260px] max-w-[92vw] bg-white border border-rose-100 p-4 rounded-xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] z-[200] text-left animate-fade-up"
                                            style={{
                                                // On mobile, position near the button but centered
                                                ...(typeof window !== 'undefined' && window.innerWidth < 768 ? {} : {})
                                            }}
                                        >
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                {tooltipText}
                                            </p>
                                            {/* Arrow pointing up on mobile, down on desktop */}
                                            <div className="hidden md:block absolute -bottom-1 right-3 w-2 h-2 bg-white border-r border-b border-rose-100 transform rotate-45"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {selected && <span className={`${activeText} text-xl animate-pulse`}>✨</span>}
                    </div>
                </div>
                <h3 className={`text-base sm:text-xl md:text-2xl font-display font-bold mb-1 ${selected ? 'text-gray-900 ' + (isRose ? 'group-hover:text-rose-accent' : 'group-hover:text-lavender-accent') : 'text-gray-700'}`}>{title}</h3>
                <p className={`text-[11px] sm:text-xs md:text-sm leading-relaxed ${selected ? 'text-gray-600' : 'text-gray-500'}`}>{desc}</p>
            </div>
        </button>
    );
};

export const DebouncedInput = ({
    value,
    onChange,
    placeholder,
    className,
    isLime = true,
    debounceMs = 400,
    type = "text",
    pattern,
    inputMode
}: {
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    className?: string,
    isLime?: boolean,
    debounceMs?: number,
    type?: string,
    pattern?: string,
    inputMode?: "search" | "text" | "none" | "tel" | "url" | "email" | "numeric" | "decimal"
}) => {
    const [localValue, setLocalValue] = useState(value);

    // Use ref to always have current onChange
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Safe: always uses current callback
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChangeRef.current(localValue);  // ← Always current
            }
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [localValue, value, debounceMs]);

    return (
        <input
            type={type}
            pattern={pattern}
            inputMode={inputMode}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white border border-rose-100 rounded-2xl py-3 px-4 text-base font-bold text-gray-800 outline-none placeholder-gray-400 transition-all shadow-sm focus:shadow-md focus:bg-white ${isLime ? 'focus:border-rose-accent' : 'focus:border-lavender-accent'} ${className}`}
        />
    );
}
