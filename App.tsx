import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { OptimizationStrategy, TimeframeType, UserPreferences, OptimizationResult } from './types';
import { Step1PTO, Step2Timeframe, Step3Strategy, Step4Location } from './components/StepWizard';
import { generateVacationPlan } from './services/vacationService';
import { SEOHead } from './components/SEOHead';
import { useSwipe } from './hooks/useMobileUX';
import { PainHero, BurnCalculator, SolutionGrid, BattleTestedMarquee } from './components/LandingVisuals';
import { TrustSection } from './components/TrustSection';
import { supabaseHelpers } from './services/supabase';
import { CelebrationOverlay, ProgressMilestone } from './components/Celebrations';
// Eagerly load the results view to remove chunk-fetch failures when users finish the wizard.
import { ResultsView } from './components/ResultsView';
import { StrategyDemosPage } from './components/StrategyDemos';

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

type ViewState = 'landing' | 'how-it-works' | 'results' | 'about' | 'algorithm' | 'privacy' | 'terms' | 'region-us' | 'region-uk' | 'region-ca' | 'region-au' | 'strategy-demos';

// --- Solver Terminal ---
const SolverTerminal = ({ timeframe }: { timeframe: TimeframeType }) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const sequence = [
      'Checking your calendar... 📅',
      'Loading dreamy destinations... ✈️',
      'Adding long weekends... 🥂',
      'Extending your breaks... 💆‍♀️',
      'Aligning your stars... ✨',
      'Manifesting abundance... 🌟',
      'Your perfect plan is ready! 💖'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < sequence.length) {
        setLines((prev) => [...prev, sequence[stepIndex]]);
        stepIndex += 1;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-sm rounded-3xl zoom-in-95">
      <div className="text-center mb-8 animate-pulse">
        <span className="text-6xl">✨</span>
      </div>
      <div className="w-full max-w-sm space-y-4">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-3 animate-fade-up">
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs text-rose-accent">✓</div>
            <span className="text-dark-text font-medium">{line}</span>
          </div>
        ))}
      </div>
      <p className="mt-12 text-rose-accent/70 text-sm font-medium tracking-wide animate-pulse">
        Designing your dream year...
      </p>
    </div>
  );
};

const LoadingFallback = () => (
  <div className="w-full min-h-screen flex items-center justify-center bg-light-100">
    <div className="w-12 h-12 border-4 border-rose-accent border-t-transparent rounded-full animate-spin"></div>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Behavioral UX states
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);

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

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [view, step]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

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
    const nextStep = step + 1;
    setStep(nextStep);

    // Show milestone celebration for steps 1-4
    if (nextStep <= 4) {
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 2000);
    }

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
  }, [isWizardTopInView, step]);

  const handleBack = useCallback(() => setStep((prev) => prev - 1), []);

  // Mobile Swipe Handlers
  const swipeHandlers = useSwipe({
    onSwipeRight: () => {
      if (step > 0 && step < 5) handleBack();
    },
    threshold: 60
  });

  const handleGenerate = useCallback(async () => {
    setStep(5);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Longer wait for effect
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

      // Show celebration before showing results
      setShowCelebration(true);

      setTimeout(() => {
        setStep(6);
        setView('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
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
    <div className="min-h-[100dvh] flex flex-col text-dark-text pb-12 overflow-x-hidden bg-light-100">
      <SEOHead view={view} prefs={prefs} result={result || undefined} country={prefs.country} />

      {/* Behavioral UX Enhancements */}
      <CelebrationOverlay
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
        title="You're a Genius! 🎉"
        subtitle="Your dream year is manifested"
      />
      <ProgressMilestone
        step={step}
        totalSteps={4}
        show={showMilestone}
      />

      {/* Navigation */}
      <nav className="w-full py-3 md:py-6 px-4 md:px-12 flex justify-between items-center z-[60] fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-rose-100 transition-all duration-300 safe-pt shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={handleReset}>
          <div className="w-8 h-8 bg-gradient-to-br from-rose-accent to-peach-accent rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
            <span className="text-white text-lg">🌸</span>
          </div>
          <span className="font-display font-bold text-lg md:text-xl bg-gradient-to-r from-rose-accent to-peach-accent bg-clip-text text-transparent">VacationMax</span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={() => setView('how-it-works')}
            className="text-xs md:text-sm font-medium text-slate-500 hover:text-rose-accent transition-colors hidden md:block"
          >
            How it Works
          </button>
          <button
            onClick={() => setView('strategy-demos')}
            className="text-xs md:text-sm font-medium text-slate-500 hover:text-lavender-accent transition-colors hidden md:block"
          >
            Strategy Demos
          </button>

          {/* Create User/Restart logic links for Desktop */}
          {step > 0 && (
            <button
              onClick={handleReset}
              className="text-xs md:text-sm font-medium text-slate-500 hover:text-rose-accent transition-colors hidden md:block"
            >
              Restart
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-rose-accent transition-colors relative z-50 rounded-lg active:bg-rose-50"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <button
            onClick={scrollToWizard}
            className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold bg-gradient-to-r from-rose-accent to-peach-accent hover:shadow-lg hover:shadow-rose-accent/30 text-white rounded-full transition-all active:scale-95 transform hover:-translate-y-0.5"
          >
            {step > 0 && view === 'landing' ? 'Resume ✨' : 'Plan 💖'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[59] bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-fade-in text-center">
          <button
            onClick={() => { setView('how-it-works'); setIsMobileMenuOpen(false); }}
            className="text-2xl font-display font-bold text-gray-800 hover:text-rose-accent transition-colors py-2 border-b border-gray-100"
          >
            How it Works
          </button>
          <button
            onClick={() => { setView('strategy-demos'); setIsMobileMenuOpen(false); }}
            className="text-2xl font-display font-bold text-gray-800 hover:text-rose-accent transition-colors py-2 border-b border-gray-100"
          >
            Strategy Demos
          </button>
          {step > 0 && (
            <button
              onClick={() => { handleReset(); setIsMobileMenuOpen(false); }}
              className="text-2xl font-display font-bold text-rose-500 hover:text-rose-600 transition-colors py-2 border-b border-gray-100"
            >
              Restart Plan
            </button>
          )}
          <div className="mt-auto pb-12 flex justify-center gap-6 text-2xl text-rose-300">
            <span>✨</span>
            <span>💖</span>
            <span>🌸</span>
          </div>
        </div>
      )}

      {view === 'how-it-works' && (
        <Suspense fallback={<LoadingFallback />}>
          <HowItWorks onBack={() => setView('landing')} onLaunch={scrollToWizard} />
        </Suspense>
      )}

      {view === 'strategy-demos' && (
        <StrategyDemosPage
          onBack={() => setView('landing')}
          onSelectStrategy={(strategy) => {
            updatePrefs('strategy', strategy);
            setView('landing');
            setTimeout(() => {
              setStep(3);
              scrollWizardIntoView();
            }, 100);
          }}
        />
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

      {/* --- LANDING PAGE --- */}
      {view === 'landing' && (
        <>
          <PainHero onCta={scrollToWizard} />
          <BurnCalculator />
          <SolutionGrid />
          <TrustSection />

          {/* THE WIZARD */}
          <div id="wizard-section" ref={wizardRef} className="w-full bg-gradient-to-br from-light-100 via-light-200 to-light-300 py-24 px-4 scroll-mt-24 relative z-[55]">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-rose-accent via-lavender-accent to-peach-accent bg-clip-text text-transparent mb-3">Let's Plan Your Perfect Year ✨</h2>
                <p className="text-gray-600 text-lg">Build your optimized schedule in 60 seconds.</p>
              </div>

              {/* FIX: Removed 'overflow-hidden' and 'backdrop-blur' to fix mobile sticky buttons */}
              {/* FIX: Added z-[60] to ensure it sits ABOVE the bg-noise layer */}
              <div {...swipeHandlers} className="relative z-[60] glass-panel rounded-[2rem] p-6 md:p-12 min-h-[600px] flex flex-col shadow-2xl touch-pan-y">
                <div className="min-h-[52px] mb-4" aria-live="polite" aria-atomic="true">
                  <div
                    className={`bg-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-sm border border-rose-200 text-center transition-all duration-300 ${error ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                    role={error ? 'alert' : undefined}
                  >
                    {error || ' '}
                  </div>
                </div>

                {step === 0 && (
                  <div className="text-center space-y-8 animate-fade-up relative z-10 py-10 my-auto">
                    <div className="w-28 h-28 bg-gradient-to-br from-rose-100 to-lavender-100 rounded-full flex items-center justify-center mx-auto text-5xl border-4 border-white shadow-xl">✨</div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-rose-accent to-lavender-accent bg-clip-text text-transparent mb-3">Ready to plan?</h3>
                      <p className="text-gray-600 max-w-md mx-auto text-lg">Tell us how many days off you have, and we'll create the perfect schedule for you! 💖</p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="w-full max-w-md mx-auto py-5 bg-gradient-to-r from-rose-accent to-lavender-accent text-white text-lg font-bold rounded-2xl transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 group shadow-lg"
                    >
                      Let's Get Started ✨
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


        </>
      )}

      {view === 'results' && result && (
        <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 relative z-[60] bg-gradient-to-br from-light-100 via-light-200 to-light-300 slide-in-from-bottom">
          {showSuccessMessage && (
            <div className="max-w-6xl mx-auto mb-6 animate-fade-up">
              <div className="bg-gradient-to-r from-rose-50 to-lavender-50 border-2 border-rose-accent/30 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-accent to-lavender-accent flex items-center justify-center text-white font-bold text-xl shadow-md">✓</div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Payment Successful! 🎉</h3>
                  <p className="text-rose-accent text-sm font-medium">Your schedule is unlocked and ready!</p>
                </div>
                <button onClick={() => setShowSuccessMessage(false)} className="ml-auto p-2 text-gray-400 hover:text-rose-accent transition-colors">
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

      {/* GLOBAL FOOTER */}
      <footer className="w-full bg-gradient-to-br from-rose-50 to-lavender-50 border-t border-rose-accent/20 pt-16 pb-12 relative z-[60] overflow-hidden text-sm leading-relaxed selection:bg-rose-accent selection:text-white">
        {/* Soft decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 to-lavender-100/20 pointer-events-none"></div>

        {/* Scrolling Marquee */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-rose-100/50 to-lavender-100/50 border-b border-rose-accent/20 flex items-center overflow-hidden">
          <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap text-xs text-rose-accent/70 font-medium tracking-wide px-4 flex gap-8">
            <span>✨ Your time is precious</span>
            <span>💖 Plan smarter, not harder</span>
            <span>🌸 Maximize your wellbeing</span>
            <span>✨ Create perfect moments</span>
            <span>💫 Balance work and life</span>
            <span>✨ Your time is precious</span>
            <span>💖 Plan smarter, not harder</span>
            <span>🌸 Maximize your wellbeing</span>
            <span>✨ Create perfect moments</span>
            <span>💫 Balance work and life</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 pt-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8 md:mb-16">

            {/* Left: Brand Identity */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="inline-block border border-rose-accent/30 text-rose-accent bg-rose-50 px-3 py-1 rounded-full text-[10px] mb-6 font-bold tracking-widest shadow-sm">
                  THE #1 PLANNER FOR HER 🌸
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-6 tracking-tight">
                  Rest is <span className="bg-gradient-to-r from-rose-accent to-lavender-accent bg-clip-text text-transparent italic">productive.</span>
                </h2>
                <div className="max-w-md border-l-4 border-rose-200 pl-6 py-2">
                  <p className="text-gray-600 mb-4 font-sans text-lg italic">
                    "Because you can't pour from an empty cup. Let's fill yours up." 🥂
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Links */}
            <div className="lg:col-span-6 grid grid-cols-1 gap-6">

              {/* Glass Card */}
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-lg relative overflow-hidden group hover:bg-white/60 transition-all duration-500">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

                <h4 className="text-gray-800 font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-accent"></span>
                  Explore More
                </h4>
                <ul className="space-y-4">
                  <li>
                    <button onClick={(e) => handleFooterLink(e, 'about')} className="flex items-center gap-3 w-full text-left group/link p-2 -mx-2 hover:bg-white/50 rounded-xl transition-all">
                      <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-accent flex items-center justify-center text-xs group-hover/link:bg-rose-accent group-hover/link:text-white transition-all">01</span>
                      <span className="text-gray-600 font-medium group-hover/link:text-rose-accent transition-colors">Our Manifesto</span>
                      <span className="ml-auto text-rose-200 group-hover/link:text-rose-accent">→</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={(e) => handleFooterLink(e, 'strategy-demos')} className="flex items-center gap-3 w-full text-left group/link p-2 -mx-2 hover:bg-white/50 rounded-xl transition-all">
                      <span className="w-8 h-8 rounded-full bg-lavender-50 text-lavender-accent flex items-center justify-center text-xs group-hover/link:bg-lavender-accent group-hover/link:text-white transition-all">02</span>
                      <span className="text-gray-600 font-medium group-hover/link:text-lavender-accent transition-colors">Strategy Demos</span>
                      <span className="ml-auto text-lavender-200 group-hover/link:text-lavender-accent">→</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={(e) => handleFooterLink(e, 'privacy')} className="flex items-center gap-3 w-full text-left group/link p-2 -mx-2 hover:bg-white/50 rounded-xl transition-all">
                      <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-accent flex items-center justify-center text-xs group-hover/link:bg-rose-accent group-hover/link:text-white transition-all">03</span>
                      <span className="text-gray-600 font-medium group-hover/link:text-rose-accent transition-colors">Your Privacy</span>
                      <span className="ml-auto text-rose-200 group-hover/link:text-rose-accent">→</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={(e) => handleFooterLink(e, 'terms')} className="flex items-center gap-3 w-full text-left group/link p-2 -mx-2 hover:bg-white/50 rounded-xl transition-all">
                      <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-accent flex items-center justify-center text-xs group-hover/link:bg-rose-accent group-hover/link:text-white transition-all">04</span>
                      <span className="text-gray-600 font-medium group-hover/link:text-rose-accent transition-colors">Terms of Service</span>
                      <span className="ml-auto text-rose-200 group-hover/link:text-rose-accent">→</span>
                    </button>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Footer Status Bar */}
          <div className="border-t border-rose-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✨ Made with love for your downtime</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2">
                <span>VacationMax © 2025</span>
                <span className="text-rose-300">|</span>
                <span className="text-rose-accent">Authorized Personnel Only 💖</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
