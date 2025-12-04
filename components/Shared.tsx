import React, { useState, useEffect, useRef } from 'react';

export const StepHeader = React.memo(({ stepNumber, title, subtitle }: { stepNumber: number, title: React.ReactNode, subtitle: string }) => (
    <div className="space-y-2 md:space-y-4 mb-4 md:mb-12 animate-fade-up px-1">
        <div className="flex items-center gap-3">
             <span className="w-8 h-[1px] bg-lime-accent"></span>
             <span className="text-lime-accent font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">STEP {stepNumber}</span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1]">
            {title}
        </h2>
        <p className="text-sm md:text-lg text-slate-400 max-w-xl leading-relaxed">{subtitle}</p>
    </div>
));

export const NavButtons = React.memo(({ onNext, onBack, nextDisabled, nextLabel = "Continue", isLoading = false }: { onNext: () => void, onBack?: () => void, nextDisabled?: boolean, nextLabel?: string, isLoading?: boolean }) => (
    // FIX APPLIED HERE: Changed z-50 to z-[100] to fix mobile click issue
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-8 bg-[#0F1014]/80 backdrop-blur-lg border-t border-white/10 md:absolute md:bottom-12 md:left-12 md:right-12 md:p-0 md:bg-transparent md:border-none flex flex-row justify-between items-center gap-4 animate-fade-up transition-all duration-300 safe-pb">
        {onBack ? (
             <button onClick={onBack} disabled={isLoading} className="text-slate-400 hover:text-white px-4 py-3 md:py-2 font-bold transition-colors flex items-center gap-2 text-xs uppercase tracking-widest group rounded-lg bg-white/5 hover:bg-white/10 md:bg-transparent disabled:opacity-50 active:scale-95">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="inline">Back</span>
            </button>
        ) : <div className="hidden md:block" />}
        
        <button
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="flex-1 md:flex-none md:w-auto relative group overflow-hidden px-6 md:px-10 py-4 rounded-xl bg-lime-accent text-dark-900 font-bold font-display text-lg tracking-wide hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:shadow-[0_0_30px_rgba(132,204,22,0.4)] active:scale-95 border border-lime-accent/50"
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
                        <svg className="animate-spin h-5 w-5 text-dark-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Optimizing Plan...</span>
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
));

interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    title: string;
    desc: string;
    tag?: string;
    accentColor?: 'lime' | 'violet';
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
    const isLime = accentColor === 'lime';
    const activeBorder = isLime ? 'border-lime-accent' : 'border-brand-violet';
    const activeBg = 'glass-panel'; // Use global glass class
    const activeText = isLime ? 'text-lime-accent' : 'text-brand-violet';
    const shadow = isLime ? 'shadow-[0_0_30px_rgba(190,242,100,0.15)]' : 'shadow-[0_0_30px_rgba(124,58,237,0.15)]';
    
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <button
            onClick={onClick}
            className={`group relative p-6 rounded-3xl border text-left transition-all duration-300 hover:scale-[1.01] active:scale-95 w-full ${
              selected
                ? `${activeBg} ${activeBorder} ${shadow}`
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
            }`}
        >
             {children}
             <div className="relative z-10">
                 <div className="flex justify-between items-start mb-2">
                     {tag && (
                         <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${selected ? `bg-${isLime ? 'lime-accent' : 'brand-violet'} text-dark-900` : 'bg-white/10 text-slate-400'}`}>
                            {tag}
                         </span>
                     )}
                     
                     <div className="flex items-center gap-2">
                         {tooltipText && (
                             <div 
                                className="relative group/info"
                                onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                             >
                                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-help transition-colors ${selected ? `${activeText} ${isLime ? 'border-lime-accent/50' : 'border-brand-violet/50'}` : 'text-slate-500 border-slate-600 hover:text-white hover:border-white'}`}>
                                     ?
                                 </div>
                                 {showTooltip && (
                                     <div className="absolute bottom-full right-0 mb-3 w-56 bg-dark-900/95 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl z-50 text-left animate-fade-up pointer-events-none">
                                         <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                             {tooltipText}
                                         </p>
                                         <div className="absolute -bottom-1 right-2 w-2 h-2 bg-dark-900 border-r border-b border-white/20 transform rotate-45"></div>
                                     </div>
                                 )}
                             </div>
                         )}
                         {selected && <span className={`${activeText} text-xl`}>●</span>}
                     </div>
                 </div>
                 <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-1">{title}</h3>
                 <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{desc}</p>
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
    debounceMs = 400
}: {
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    className?: string,
    isLime?: boolean,
    debounceMs?: number
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
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-base font-bold text-white outline-none placeholder-slate-600 transition-all shadow-inner focus:bg-black/40 ${isLime ? 'focus:border-lime-accent' : 'focus:border-brand-violet'} ${className}`}
        />
    );
}
