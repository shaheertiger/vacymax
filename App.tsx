import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { OptimizationStrategy, TimeframeType, UserPreferences, OptimizationResult } from './types';
import { Step1PTO, Step2Timeframe, Step3Strategy, Step4Location } from './components/StepWizard';
import { generateVacationPlan } from './services/vacationService';
import { SEOHead } from './components/SEOHead';
import { PainHero, BurnCalculator, SolutionGrid, BattleTestedMarquee } from './components/LandingVisuals';
import { TrustSection } from './components/TrustSection';
import { supabaseHelpers } from './services/supabase';
// Eagerly load the results view to remove chunk-fetch failures when users finish the wizard.
import { ResultsView } from './components/ResultsView';

// Lazy load content pages
const AboutPage = lazy(() => import('./components/ContentPages').then(module => ({ default: module.AboutPage })));
const AlgorithmPage = lazy(() => import('./components/ContentPages').then(module => ({ default: module.AlgorithmPage })));
const PrivacyPage = lazy(() => import('./components/ContentPages').then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./components/ContentPages').then(module => ({ default: module.TermsPage })));
const RegionPage = lazy(() => import('./components/ContentPages').then(module => ({ default: module.RegionPage })));

const lazyWithRetry = <T extends { default: React.ComponentType<any> }>(importer: () => Promise<T>) =>
  lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      const message = typeof error === 'object' && error !== null ? (error as Error).message : String(error);
      const failedChunk = message.includes('Failed to fetch dynamically imported module');

      if (failedChunk && typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const hasRefreshed = sessionStorage.getItem('vmx-chunk-reload');
        if (!hasRefreshed) {
          sessionStorage.setItem('vmx-chunk-reload', '1');
          window.location.reload();
        }
      }

      throw error;
    }
  });

// Lazy load heavy components with retry guard for chunk load failures
const HowItWorks = lazyWithRetry(() => import('./components/HowItWorks').then((module) => ({ default: module.HowItWorks })));

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

type ViewState = 'landing' | 'how-it-works' | 'results' | 'about' | 'algorithm' | 'privacy' | 'terms' | 'region-us' | 'region-uk' | 'region-ca' | 'region-au';

// --- Solver Terminal ---
const SolverTerminal = ({ timeframe }: { timeframe: TimeframeType }) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const sequence = [
      'Scanning calendar...',
      'Loading dates...',
      'Adding public holidays...',
      'Finding long weekends...',
      'Connecting dates...',
      'Looking for travel windows...',
      'Extending your breaks...',
      'Calculating best value...',
      'Plan ready!'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < sequence.length) {
        setLines((prev) => [...prev, sequence[stepIndex]]);
        stepIndex += 1;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel rounded-xl p-6 font-mono text-xs md:text-sm relative overflow-hidden transform-gpu">
        <div className="absolute top-0 left-0 w-full h-1 bg-lime-accent animate-shimmer"></div>
        <div className="space-y-2 h-[250px] overflow-y-auto font-bold scrollbar-hide will-change-transform">
          {lines.map((line, i) => (
            <div key={i} className="text-lime-accent/90 animate-fade-up">{">"} {line}</div>
          ))}
          <div className="animate-pulse text-lime-accent">_</div>
        </div>
      </div>
      <p className="mt-8 text-slate-500 text-sm animate-pulse font-medium tracking-wide">
        Building your perfect schedule for {timeframe}...
      </p>
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

  const isWizardTopInView = useCallback(() => {
    const node = wizardRef.current;
    if (!node) return false;

    const rect = node.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Treat the wizard as visible when its top is within a comfortable viewport buffer.
    return rect.top > -120 && rect.top < viewportHeight * 0.6;
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

  // FIX: Type-safe update
  const updatePrefs = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNext = useCallback(() => {
    setStep((prev) => prev + 1);
    // Auto-scroll on mobile (with header offset)
    if (window.innerWidth < 768) {
      if (!isWizardTopInView()) {
        // Offset by 100px to account for fixed header and some padding
        const offsetPosition = (wizardRef.current?.offsetTop || 0) - 100;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [isWizardTopInView]);

  const handleBack = useCallback(() => setStep((prev) => prev - 1), []);

  const handleGenerate = useCallback(async () => {
    setStep(5);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const data = await generateVacationPlan(prefs);
      setResult(data);

      // Track plan generation in Supabase
      supabaseHelpers.logPlanGeneration({
        ptoUsed: data.totalPtoUsed,
        totalDaysOff: data.totalDaysOff,
        monetaryValue: data.totalValueRecovered,
        region: prefs.region || prefs.country,
        strategy: prefs.strategy,
      }).catch(err => console.error('Failed to log plan:', err));

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

  // Track session on app load
  useEffect(() => {
    supabaseHelpers.trackSession({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    }).catch(err => console.error('Failed to track session:', err));
  }, []);

  // Handle payment success from Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      // Payment successful - unlock the plan
      setIsLocked(false);
      setShowSuccessMessage(true);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Hide success message after 10 seconds
      setTimeout(() => setShowSuccessMessage(false), 10000);
    } else if (paymentStatus === 'cancelled') {
      // Payment was cancelled
      console.log('Payment was cancelled by user');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleFooterLink = useCallback((e: React.MouseEvent, viewName: ViewState) => {
    e.preventDefault();
    setView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStart = useCallback(() => {
    setStep(1);
    const element = document.getElementById('wizard-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col text-slate-200 pb-12 overflow-x-hidden">
      <SEOHead view={view} prefs={prefs} result={result || undefined} country={prefs.country} />

      {/* Navigation */}
      <nav className="w-full py-3 md:py-6 px-3 md:px-12 flex justify-between items-center z-[60] fixed top-0 left-0 right-0 bg-[#020617]/90 backdrop-blur-sm border-b border-white/5 transition-all duration-300 safe-pt">
        <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={handleReset}>
          <div className="w-8 h-8 bg-lime-accent rounded-xl flex items-center justify-center shadow-lg shadow-lime-accent/20">
            <div className="w-3 h-3 bg-dark-900 rounded-sm"></div>
          </div>
          <span className="font-display font-bold text-base md:text-xl text-white">VacationMax</span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={() => setView('how-it-works')}
            className="text-xs md:text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block" // Hidden on mobile for space
          >
            How it Works
          </button>

          {/* New Reset Button */}
          {step > 0 && (
            <button
              onClick={handleReset}
              className="text-xs md:text-sm font-medium text-slate-500 hover:text-white transition-colors"
            >
              Restart
            </button>
          )}

          <button
            onClick={scrollToWizard}
            className="px-4 py-2 text-xs md:text-sm font-bold bg-lime-accent hover:bg-lime-accent/90 text-black rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(190,242,100,0.3)]"
          >
            {step > 0 && view === 'landing' ? 'Resume Plan' : 'Start Plan'}
          </button>
        </div>
      </nav>

      {view === 'how-it-works' && (
        <Suspense fallback={<LoadingFallback />}>
          <HowItWorks onBack={() => setView('landing')} onLaunch={scrollToWizard} />
        </Suspense>
      )}

      <Suspense fallback={<LoadingFallback />}>
        {view === 'about' && <AboutPage onBack={() => setView('landing')} />}
        {view === 'algorithm' && <AlgorithmPage onBack={() => setView('landing')} />}
        {view === 'privacy' && <PrivacyPage onBack={() => setView('landing')} />}
        {view === 'terms' && <TermsPage onBack={() => setView('landing')} />}
        {view === 'region-us' && <RegionPage region="United States" onBack={() => setView('landing')} />}
        {view === 'region-uk' && <RegionPage region="United Kingdom" onBack={() => setView('landing')} />}
        {view === 'region-ca' && <RegionPage region="Canada" onBack={() => setView('landing')} />}
        {view === 'region-au' && <RegionPage region="Australia" onBack={() => setView('landing')} />}
      </Suspense>

      {view === 'landing' && (
        <>
          <PainHero onCta={scrollToWizard} />
          <BurnCalculator />
          <SolutionGrid />
          <TrustSection />

          {/* THE WIZARD */}
          <div id="wizard-section" ref={wizardRef} className="w-full bg-[#020617] py-24 px-4 scroll-mt-24 relative z-[55]">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold text-white mb-2">Okay, Let's Fix It.</h2>
                <p className="text-slate-400">Build your optimized schedule in 60 seconds.</p>
              </div>

              {/* FIX: Removed 'overflow-hidden' and 'backdrop-blur' to fix mobile sticky buttons */}
              {/* FIX: Added z-[60] to ensure it sits ABOVE the bg-noise layer */}
              <div className="relative z-[60] glass-panel rounded-[2rem] p-6 md:p-12 min-h-[600px] flex flex-col">
                <div className="min-h-[52px] mb-4" aria-live="polite" aria-atomic="true">
                  <div
                    className={`bg-red-500/15 text-red-200 px-4 py-3 rounded-lg text-sm border border-red-500/20 text-center transition-all duration-300 ${error ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                    role={error ? 'alert' : undefined}
                  >
                    {error || ' '}
                  </div>
                </div>

                {step === 0 && (
                  <div className="text-center space-y-8 animate-fade-up relative z-10 py-10 my-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-lime-accent/20 to-transparent rounded-full flex items-center justify-center mx-auto text-4xl border border-lime-accent/20 shadow-[0_0_30px_rgba(132,204,22,0.1)]">✨</div>
                    <div>
                      <h3 className="text-3xl font-display font-bold text-white mb-2">Ready to plan?</h3>
                      <p className="text-slate-400 max-w-xs mx-auto">Tell us how many days off you have, and we'll do the rest.</p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="w-full py-5 bg-white/5 border border-white/10 hover:border-lime-accent/50 text-white text-lg font-bold rounded-xl transition-all hover:bg-white/10 hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
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

          <footer className="w-full bg-black border-t border-lime-accent/20 pt-16 pb-12 relative z-[60] overflow-hidden font-mono text-sm leading-relaxed selection:bg-lime-accent selection:text-black">
            {/* CRT Overlay Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none z-10 opacity-20"></div>
            <div className="absolute inset-0 bg-lime-accent/5 animate-pulse pointer-events-none"></div>

            {/* Scrolling Marquee */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-lime-accent/10 border-b border-lime-accent/20 flex items-center overflow-hidden">
              <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap text-[10px] text-lime-accent/60 font-bold tracking-widest uppercase px-4 flex gap-8">
                <span>// SYSTEM_ALERT: TIME_IS_NON_REFUNDABLE</span>
                <span>// OPTIMIZE_SCHEDULE_IMMEDIATELY</span>
                <span>// DETECTING_WEEKEND_OPPORTUNITIES</span>
                <span>// PTO_BALANCE_CRITICAL</span>
                <span>// INITIATE_VACATION_PROTOCOL</span>
                <span>// SYSTEM_ALERT: TIME_IS_NON_REFUNDABLE</span>
                <span>// OPTIMIZE_SCHEDULE_IMMEDIATELY</span>
                <span>// DETECTING_WEEKEND_OPPORTUNITIES</span>
                <span>// PTO_BALANCE_CRITICAL</span>
                <span>// INITIATE_VACATION_PROTOCOL</span>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-20 pt-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8 md:mb-16">

                {/* Left: Terminal Header */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="inline-block border border-lime-accent/50 text-lime-accent px-2 py-1 text-[10px] mb-6 uppercase tracking-widest shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                      VACYMAX_OS v3.0
                    </div>
                    <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 tracking-tighter uppercase relative">
                      Rest<span className="text-lime-accent">.Is.Resistance</span>
                      <span className="absolute -right-4 -top-4 w-2 h-2 bg-lime-accent animate-ping"></span>
                    </h2>
                    <div className="max-w-md border-l-4 border-lime-accent/20 pl-6 py-2">
                      <p className="text-slate-400 mb-4 font-sans">
                        "The calendar is a construct. Break it."
                      </p>
                      <div className="flex gap-2 text-[10px] uppercase tracking-wider text-lime-accent/50">
                        <span>[Encryption: Verified]</span>
                        <span>[Tracker: Blocked]</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Command Modules */}
                <div className="lg:col-span-6 grid grid-cols-1 gap-8">

                  {/* Module A: Directives (Links) */}
                  <div className="bg-white/5 border border-white/10 p-6 rounded-sm relative group hover:border-lime-accent/50 transition-colors">
                    <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-lime-accent opacity-50"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-lime-accent opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-lime-accent opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-lime-accent opacity-50"></div>

                    <h4 className="text-lime-accent text-xs mb-6 uppercase tracking-[0.2em] border-b border-dashed border-lime-accent/30 pb-2">Primary_Directives</h4>
                    <ul className="space-y-3">
                      <li>
                        <button onClick={(e) => handleFooterLink(e, 'about')} className="flex items-center gap-3 w-full text-left group/link hover:bg-lime-accent/10 p-2 -mx-2 transition-colors">
                          <span className="text-slate-500 group-hover/link:text-lime-accent text-[10px] transition-colors">01</span>
                          <span className="text-slate-300 font-bold group-hover/link:text-white transition-colors">IDENTITY_MANIFESTO</span>
                          <span className="ml-auto opacity-0 group-hover/link:opacity-100 text-lime-accent text-[10px] tracking-widest">[LOAD]</span>
                        </button>
                      </li>
                      <li>
                        <button onClick={(e) => handleFooterLink(e, 'privacy')} className="flex items-center gap-3 w-full text-left group/link hover:bg-lime-accent/10 p-2 -mx-2 transition-colors">
                          <span className="text-slate-500 group-hover/link:text-lime-accent text-[10px] transition-colors">02</span>
                          <span className="text-slate-300 font-bold group-hover/link:text-white transition-colors">PRIVACY_SHIELD</span>
                          <span className="ml-auto opacity-0 group-hover/link:opacity-100 text-lime-accent text-[10px] tracking-widest">[ENGAGE]</span>
                        </button>
                      </li>
                      <li>
                        <button onClick={(e) => handleFooterLink(e, 'terms')} className="flex items-center gap-3 w-full text-left group/link hover:bg-lime-accent/10 p-2 -mx-2 transition-colors">
                          <span className="text-slate-500 group-hover/link:text-lime-accent text-[10px] transition-colors">03</span>
                          <span className="text-slate-300 font-bold group-hover/link:text-white transition-colors">OPERATIONAL_TERMS</span>
                          <span className="ml-auto opacity-0 group-hover/link:opacity-100 text-lime-accent text-[10px] tracking-widest">[READ]</span>
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>

              {/* Footer Status Bar */}
              <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-[10px] uppercase tracking-widest text-slate-600">
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-lime-accent/50">Core</span>
                    <span className="text-white">Online</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lime-accent/50">Ping</span>
                    <span className="text-white">12ms</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-lime-accent/50">Build</span>
                    <span className="text-white">2025.1.4</span>
                  </div>
                </div>
                <div className="text-right">
                  <p>VacyMax Inc. © 2025</p>
                  <p className="text-red-500/50 mt-1">Authorized Personnel Only</p>
                </div>
              </div>
            </div>
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
                <button onClick={() => setShowSuccessMessage(false)} className="ml-auto p-2 text-slate-400">
                  ✕
                </button>
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
