import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { OptimizationStrategy, TimeframeType, UserPreferences, OptimizationResult } from './types';
import { Step1PTO, Step2Timeframe, Step3Strategy, Step4Location } from './components/StepWizard';
import { generateVacationPlan } from './services/vacationService';
import { SEOHead } from './components/SEOHead';
import { PainHero, BurnCalculator, SolutionGrid, BattleTestedMarquee } from './components/LandingVisuals';

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

// --- Solver Terminal ---
const SolverTerminal = ({ timeframe }: { timeframe: TimeframeType }) => {
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        const sequence = [
            "Scanning calendar...",
            "Loading dates...",
            "Adding public holidays...",
            "Finding long weekends...",
            "Connecting dates...",
            "Looking for travel windows...",
            "Extending your breaks...",
            "Calculating best value...",
            "Plan ready!"
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < sequence.length) {
                setLines(prev => [...prev, sequence[stepIndex]]);
                stepIndex++;
            } else {
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#050505] border border-white/10 rounded-xl p-6 font-mono text-xs md:text-sm shadow-2xl relative overflow-hidden">
                <div className="space-y-2 h-[250px] overflow-y-auto font-bold scrollbar-hide">
                    {lines.map((line, i) => (
                        <div key={i} className="text-lime-accent/90 animate-fade-up">{">"} {line}</div>
                    ))}
                    <div className="animate-pulse text-lime-accent">_</div>
                </div>
            </div>
            <p className="mt-8 text-slate-500 text-sm animate-pulse font-medium tracking-wide">Building your perfect schedule...</p>
        </div>
    );
};

const LoadingFallback = () => (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-12 h-12 border-4 border-lime-accent border-t-transparent rounded-full animate-spin"></div>
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

  const scrollWizardIntoView = useCallback(() => {
    const element = wizardRef.current || document.getElementById('wizard-section');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Scroll only when starting the wizard from hero/How it Works
  const scrollToWizard = useCallback(() => {
    if (view === 'how-it-works') {
        setView('landing');
        setTimeout(() => {
             scrollWizardIntoView();
             if (step === 0) setStep(1);
        }, 100);
    } else {
        scrollWizardIntoView();
        if (step === 0) setStep(1);
    }
  }, [scrollWizardIntoView, view, step]);

  const updatePrefs = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNext = useCallback(() => {
      setStep((prev) => prev + 1);
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
        <SEOHead view={view} prefs={prefs} result={result || undefined} country={prefs.country} />

        <nav className="w-full py-3 md:py-6 px-4 md:px-12 flex justify-between items-center z-[60] fixed top-0 left-0 right-0 bg-[#020617]/90 backdrop-blur-sm border-b border-white/5 transition-all duration-300 safe-pt">
            <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={handleReset}>
                <div className="w-8 h-8 bg-lime-accent rounded-xl flex items-center justify-center shadow-lg shadow-lime-accent/20">
                    <div className="w-3 h-3 bg-dark-900 rounded-sm"></div>
                </div>
                <span className="font-display font-bold text-lg md:text-xl text-white">VacationMax</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
                <button onClick={() => setView('how-it-works')} className="text-xs md:text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    How it Works
                </button>
                <button onClick={scrollToWizard} className="px-4 py-2 text-xs md:text-sm font-bold bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95">
                    {step > 0 && view === 'landing' ? 'Resume' : 'Start Plan'}
                </button>
            </div>
        </nav>

        {view === 'how-it-works' && (
            <Suspense fallback={<LoadingFallback />}>
                <HowItWorks onBack={() => setView('landing')} onLaunch={scrollToWizard} />
            </Suspense>
        )}

        {view === 'landing' && (
            <>
                <PainHero onCta={scrollToWizard} />
                <BurnCalculator />
                <SolutionGrid />
                <BattleTestedMarquee />

                <div id="wizard-section" ref={wizardRef} className="w-full bg-[#020617] py-24 px-4 scroll-mt-24 relative z-[55]">
                     <div className="max-w-4xl mx-auto">
                         <div className="text-center mb-12">
                             <h2 className="text-3xl font-display font-bold text-white mb-2">Okay, Let's Fix It.</h2>
                             <p className="text-slate-400">Build your optimized schedule in 60 seconds.</p>
                         </div>

                         <div className="relative z-[60] bg-[#0F1014] border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-2xl min-h-[550px] flex flex-col">
                            {error && (
                                <div className="bg-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm mb-4 border border-red-500/20 text-center">{error}</div>
                            )}

                            {step === 0 && (
                                <div className="text-center space-y-8 animate-fade-up relative z-10 py-10 my-auto">
                                    <div className="w-24 h-24 bg-gradient-to-br from-lime-accent/20 to-transparent rounded-full flex items-center justify-center mx-auto text-4xl border border-lime-accent/20 shadow-[0_0_30px_rgba(132,204,22,0.1)]">✨</div>
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

                <footer className="max-w-7xl mx-auto py-24 text-center text-slate-600 border-t border-white/5 mt-20 relative z-[60]">
                    <p className="text-sm">VacationMax © 2025. Rest harder.</p>
                </footer>
            </>
        )}

        {view === 'results' && result && (
             <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 relative z-[60]">
                {showSuccessMessage && (
                    <div className="max-w-6xl mx-auto mb-6 animate-fade-up">
                        <div className="bg-lime-accent/10 border border-lime-accent/30 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-lime-accent flex items-center justify-center text-dark-900 font-bold">✓</div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Payment Successful</h3>
                                <p className="text-lime-accent text-sm">Your schedule is unlocked!</p>
                            </div>
                            <button onClick={() => setShowSuccessMessage(false)} className="ml-auto p-2 text-slate-400">✕</button>
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
