import React, { useState, useRef, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { OptimizationStrategy, TimeframeType, UserPreferences, OptimizationResult } from './types';
import { Step1PTO, Step2Timeframe, Step3Strategy, Step4Location } from './components/StepWizard';
import { generateVacationPlan } from './services/vacationService';
import { SEOHead } from './components/SEOHead';
// Import the new Aggressive PAS Components
import { PainHero, BurnCalculator, SolutionGrid, BattleTestedMarquee, TrustedByStrip } from './components/LandingVisuals';

// Lazy load heavy interactive components
const ResultsView = lazy(() => import('./components/ResultsView').then(module => ({ default: module.ResultsView })));
const HowItWorks = lazy(() => import('./components/HowItWorks').then(module => ({ default: module.HowItWorks })));

const initialPrefs: UserPreferences = {
  ptoDays: 0,
  timeframe: TimeframeType.CALENDAR_2025,
  strategy: OptimizationStrategy.BALANCED,
  country: '',
  region: '',
  hasBuddy: false,
  buddyPtoDays: 0,
  buddyCountry: '',
  buddyRegion: '',
};

type ViewState = 'landing' | 'how-it-works' | 'results';

// --- Solver Terminal Component ---
const SolverTerminal = ({ timeframe }: { timeframe: TimeframeType }) => {
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        const sequence = [
            "Scanning calendar...",
            `Loading ${timeframe === TimeframeType.ROLLING_12 ? 'Upcoming Year' : timeframe.split(' ')[2]} dates...`,
            "Adding public holidays...",
            "Finding long weekends...",
            "Connecting dates...",
            "Looking for travel windows...",
            "Extending your breaks...",
            "Checking for burnout...",
            "Calculating best value...",
            "Plan ready!"
        ];

        let startTime = performance.now();
        let stepIndex = 0;
        let animationFrameId: number;

        const animate = (time: number) => {
            const elapsed = time - startTime;
            if (elapsed > 200 * (stepIndex + 1) && stepIndex < sequence.length) {
                setLines(prev => [...prev, sequence[stepIndex]]);
                stepIndex++;
            }
            if (stepIndex < sequence.length) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [timeframe]);

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#050505] border border-white/10 rounded-xl p-6 font-mono text-xs md:text-sm shadow-2xl relative overflow-hidden transform-gpu">
                <div className="absolute top-0 left-0 w-full h-1 bg-lime-accent animate-shimmer"></div>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-auto text-slate-500">vacation_planner.exe</span>
                </div>
                <div className="space-y-2 h-[250px] overflow-y-auto font-bold scrollbar-hide will-change-transform">
                    {lines.map((line, i) => (
                        <div key={i} className="text-lime-accent/90 animate-fade-up">
                            {">"} {line}
                        </div>
                    ))}
                    <div className="animate-pulse text-lime-accent">_</div>
                </div>
            </div>
            <p className="mt-8 text-slate-500 text-sm animate-pulse font-medium tracking-wide">Building your perfect schedule...</p>
        </div>
    );
};

// Loading skeleton
const LoadingFallback = () => (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-lime-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-mono animate-pulse">Loading Module...</p>
        </div>
    </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [step, setStep] = useState<number>(0); 
  const [prefs, setPrefs] = useState<UserPreferences>(initialPrefs);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const wizardRef = useRef<HTMLDivElement>(null);

  const scrollToWizard = useCallback(() => {
    if (view === 'how-it-works') {
        setView('landing');
        requestAnimationFrame(() => {
             const element = document.getElementById('wizard-section');
             element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
             if(step === 0) setStep(1);
        });
    } else {
        const element = document.getElementById('wizard-section');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if(step === 0) setStep(1);
    }
  }, [view, step]);

  const updatePrefs = useCallback((key: keyof UserPreferences, value: any) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNext = useCallback(() => {
      setStep((prev) => prev + 1);
      if (window.innerWidth < 768) {
          wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }, []);

  const handleBack = useCallback(() => setStep((prev) => prev - 1), []);

  const handleGenerate = useCallback(async () => {
    setStep(5);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = await generateVacationPlan(prefs);
      setResult(data);
      setStep(6);
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError("We couldn't generate a plan. Please check your inputs.");
      setStep(4);
    }
  }, [prefs]);

  const handlePaymentSuccess = useCallback(() => {
      setIsLocked(false);
      setShowSuccessMessage(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setShowSuccessMessage(false), 8000);
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setPrefs(initialPrefs);
    setResult(null);
    setIsLocked(true);
    setShowSuccessMessage(false);
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col text-slate-200 pb-12 overflow-x-hidden">
        {/* Dynamic SEO Meta Tags */}
        <SEOHead
          view={view}
          prefs={prefs}
          result={result || undefined}
          country={prefs.country}
        />

        {/* Navigation */}
        <nav className="w-full py-3 md:py-6 px-4 md:px-12 flex justify-between items-center z-50 fixed top-0 left-0 right-0 bg-[#020617]/90 backdrop-blur-sm border-b border-white/5 transition-all duration-300 safe-pt">
            <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={handleReset}>
                <div className="w-8 h-8 bg-lime-accent rounded-xl flex items-center justify-center shadow-lg shadow-lime-accent/20 group-hover:shadow-lime-accent/40 transition-shadow">
                    <div className="w-3 h-3 bg-dark-900 rounded-sm"></div>
                </div>
                <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-lime-accent transition-colors">VacationMax</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
                <button 
                    onClick={() => setView('how-it-works')} 
                    className={`text-xs md:text-sm font-medium transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${view === 'how-it-works' ? 'bg-white/10 text-lime-accent' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                    How it Works
                </button>
                <button 
                    onClick={scrollToWizard} 
                    className="px-4 md:px-5 py-2 text-xs md:text-sm font-bold bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/5 active:scale-95 whitespace-nowrap"
                >
                    {step > 0 && view === 'landing' ? 'Resume' : 'Start Plan'}
                </button>
            </div>
        </nav>

        {view === 'how-it-works' && (
            <Suspense fallback={<LoadingFallback />}>
                <HowItWorks onBack={() => setView('landing')} onLaunch={scrollToWizard} />
            </Suspense>
        )}

        {/* --- PAS LANDING PAGE ARCHITECTURE --- */}
        {view === 'landing' && (
            <>
                {/* 1. THE PAIN: Wake Up Call */}
                <PainHero onCta={scrollToWizard} />

                {/* 2. THE AGITATION: Burn Calculator */}
                <BurnCalculator />

                {/* 3. THE SOLUTION: Feature Grid (Teal Transition) */}
                <SolutionGrid />

                {/* 4. SOCIAL PROOF: Marquee */}
                <BattleTestedMarquee />

                {/* THE WIZARD (The Actual Product) */}
                <div id="wizard-section" ref={wizardRef} className="w-full bg-[#020617] py-24 px-4 scroll-mt-24">
                     <div className="max-w-4xl mx-auto">
                         <div className="text-center mb-12">
                             <h2 className="text-3xl font-display font-bold text-white mb-2">Okay, Let's Fix It.</h2>
                             <p className="text-slate-400">Build your optimized schedule in 60 seconds.</p>
                         </div>

                         <div className="relative bg-[#0F1014] border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-2xl min-h-[550px] flex flex-col overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none hidden md:block" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                            {error && (
                                <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm mb-4 border border-red-500/20 z-20">
                                    {error}
                                </div>
                            )}

                            {step === 0 && (
                                <div className="text-center space-y-8 animate-fade-up relative z-10 py-10 my-auto">
                                    <div className="w-24 h-24 bg-gradient-to-br from-lime-accent/20 to-transparent rounded-full flex items-center justify-center mx-auto text-4xl border border-lime-accent/20 shadow-[0_0_30px_rgba(132,204,22,0.1)]">
                                        ✨
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-display font-bold text-white mb-2">Ready to plan?</h3>
                                        <p className="text-slate-400 max-w-xs mx-auto">Tell us how many days off you have, and we'll do the rest.</p>
                                    </div>
                                    <button onClick={() => setStep(1)} className="w-full py-5 bg-white/5 border border-white/10 hover:border-lime-accent/50 text-white text-lg font-bold rounded-xl transition-all hover:bg-white/10 hover:shadow-lg flex items-center justify-center gap-2 group">
                                        Let's Get Started
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>
                            )}

                            {step === 1 && <Step1PTO prefs={prefs} updatePrefs={updatePrefs} onNext={handleNext} />}
                            {step === 2 && <Step2Timeframe prefs={prefs} updatePrefs={updatePrefs} onNext={handleNext} onBack={handleBack} />}
                            {step === 3 && <Step3Strategy prefs={prefs} updatePrefs={updatePrefs} onNext={handleNext} onBack={handleBack} />}
                            {step === 4 && <Step4Location prefs={prefs} updatePrefs={updatePrefs} onNext={handleGenerate} onBack={handleBack} />}
                            {step === 5 && <SolverTerminal timeframe={prefs.timeframe} />}
                         </div>
                     </div>
                </div>

                <footer className="max-w-7xl mx-auto py-24 text-center text-slate-600 border-t border-white/5 mt-20">
                    <p className="text-sm">VacationMax © 2025. Rest harder.</p>
                </footer>
            </>
        )}

        {view === 'results' && result && (
             <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 relative">
                {showSuccessMessage && (
                    <div className="max-w-6xl mx-auto mb-6 animate-fade-up">
                        <div className="bg-lime-accent/10 border border-lime-accent/30 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-lime-accent/5 animate-pulse pointer-events-none"></div>
                            <div className="w-10 h-10 rounded-full bg-lime-accent flex items-center justify-center text-dark-900 font-bold shadow-lg shadow-lime-accent/20 z-10">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-white text-lg leading-tight">Payment Successful</h3>
                                <p className="text-lime-accent text-sm font-medium">Your full schedule is now unlocked. Enjoy your time off!</p>
                            </div>
                            <button onClick={() => setShowSuccessMessage(false)} className="ml-auto p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors z-10">✕</button>
                        </div>
                    </div>
                )}

                <Suspense fallback={<LoadingFallback />}>
                    <ResultsView 
                        result={result} 
                        onReset={handleReset} 
                        isLocked={isLocked}
                        onUnlock={handlePaymentSuccess}
                        userCountry={prefs.country}
                        prefs={prefs}
                    />
                </Suspense>
             </main>
        )}
    </div>
  );
};

export default App;