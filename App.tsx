import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { OptimizationStrategy, TimeframeType, UserPreferences, OptimizationResult } from './types';
import { Step1PTO, Step2Timeframe, Step3Strategy, Step4Location } from './components/StepWizard';
import { generateVacationPlan } from './services/vacationService';
import { SEOHead } from './components/SEOHead';
import { useSwipe, useHaptics } from './hooks/useMobileUX';
import { useWizardProgress, useSavedPlans, useDarkMode } from './hooks/useLocalStorage';
import { usePWAInstall, useIOSInstallPrompt, useOnlineStatus } from './hooks/usePWA';
import { PainHero, BurnCalculator, SolutionGrid, BattleTestedMarquee } from './components/LandingVisuals';
import { TrustSection } from './components/TrustSection';
import { supabaseHelpers } from './services/supabase';
// import { CelebrationOverlay, ProgressMilestone } from './components/Celebrations'; // Removed
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
      'Aligning your schedule with your soul... ✨',
      'Deleting toxic meetings... 🗑️',
      'Prioritizing ME time... 💅',
      'Maximizing long weekends... 🥂',
      'Calculating optimal rest days... 🛌',
      'Manifesting freedom... 🕊️',
      'Your Freedom Era is ready! 💖'
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
    <div className="w-full h-full min-h-[50vh] md:min-h-[400px] flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-sm rounded-3xl zoom-in-95">
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
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [isWizardVisible, setIsWizardVisible] = useState(false);

  const stepLabels = ['PTO days', 'Timeframe', 'Style', 'Location'];
  const clampedStep = Math.min(Math.max(step, 1), 4);
  const stepProgress = step === 0 ? 0 : (clampedStep / 4) * 100;
  const stepStatusLabel = step === 0 ? 'Ready when you are' : stepLabels[clampedStep - 1];
  const mobileStepSummary = step === 0 ? 'Start your plan in one tap' : `${stepStatusLabel} • ${clampedStep}/4`;
  const mobileProgressWidth = Math.max(stepProgress, step === 0 ? 12 : 20);

  // Behavioral UX states
  const [direction, setDirection] = useState<'next' | 'back'>('next');

  // localStorage hooks
  const { saveProgress, loadProgress, clearProgress } = useWizardProgress(initialPrefs);
  const { savedPlans, savePlan } = useSavedPlans();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { trigger: triggerHaptic } = useHaptics();

  // PWA hooks
  const { isInstallable, promptInstall } = usePWAInstall();
  const { showIOSPrompt, dismissIOSPrompt } = useIOSInstallPrompt();
  const isOnline = useOnlineStatus();
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Show install banner after user has engaged (scrolled or completed step 1)
  useEffect(() => {
    if (isInstallable && step >= 1) {
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, step]);

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
    setDirection('next');
    setStep(nextStep);

    // Scroll to wizard top on mobile to keep focus
    if (window.innerWidth < 768) {
      setTimeout(() => {
        scrollWizardIntoView();
      }, 100);
    }
  }, [step, scrollWizardIntoView]);

  const handleBack = useCallback(() => {
    setDirection('back');
    setStep((prev) => prev - 1);
  }, []);

  // Mobile Swipe Handlers
  const swipeHandlers = useSwipe({
    onSwipeRight: () => {
      if (step > 0 && step < 5) handleBack();
    },
    threshold: 60
  });

  const handleMobileCta = useCallback(() => {
    triggerHaptic('medium');
    if (view !== 'landing') {
      setView('landing');
    }
    setStep((prev) => (prev === 0 ? 1 : prev));
    setTimeout(() => {
      scrollWizardIntoView();
    }, 80);
  }, [scrollWizardIntoView, triggerHaptic, view]);

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
    setShowResumeBanner(false);
    setView('landing');
    clearProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [clearProgress]);

  // Track session on app load
  useEffect(() => {
    supabaseHelpers.trackSession({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    }).catch(err => console.error('Failed to track session:', err));
  }, []);

  // Check for saved wizard progress on mount
  useEffect(() => {
    const savedProgress = loadProgress();
    if (savedProgress && savedProgress.step > 0) {
      setShowResumeBanner(true);
    }
  }, [loadProgress]);

  // Auto-save wizard progress when step or prefs change
  useEffect(() => {
    if (step > 0 && step < 5 && view === 'landing') {
      saveProgress(step, prefs);
    }
  }, [step, prefs, view, saveProgress]);

  // Mobile CTA visibility based on wizard position
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const node = wizardRef.current;

    // Reset state when leaving the landing view
    if (!node || view !== 'landing') {
      setIsWizardVisible(false);
      setShowMobileCta(false);
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const isInView = entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight * 0.6;
          setIsWizardVisible(isInView);
          setShowMobileCta(!isInView && window.innerWidth < 768);
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );

      observer.observe(node);

      return () => observer.disconnect();
    }

    const handleVisibility = () => {
      if (window.innerWidth >= 768) {
        setShowMobileCta(false);
        return;
      }

      const inView = isWizardTopInView();
      setIsWizardVisible(inView);
      setShowMobileCta(!inView);
    };

    handleVisibility();
    window.addEventListener('scroll', handleVisibility, { passive: true });
    window.addEventListener('resize', handleVisibility);

    return () => {
      window.removeEventListener('scroll', handleVisibility);
      window.removeEventListener('resize', handleVisibility);
    };
  }, [isWizardTopInView, view]);

  // Resume saved progress
  const handleResumeProgress = useCallback(() => {
    const savedProgress = loadProgress();
    if (savedProgress) {
      setPrefs(savedProgress.prefs);
      setStep(savedProgress.step);
      setShowResumeBanner(false);
      setTimeout(() => {
        const element = document.getElementById('wizard-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [loadProgress]);

  // Dismiss resume banner
  const handleDismissResume = useCallback(() => {
    setShowResumeBanner(false);
    clearProgress();
  }, [clearProgress]);

  // Handle payment success from Stripe redirect (Payment Link or Checkout Session)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    // Accept payment=success OR session_id (Payment Links may only send session_id)
    if (paymentStatus === 'success' || sessionId) {
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
    <div className="min-h-[100dvh] flex flex-col text-dark-text dark:text-gray-100 pb-12 overflow-x-hidden bg-light-100 dark:bg-dark-100 relative transition-colors duration-300">
      {/* Desktop-only magic effects - Disabled per user feedback */}

      <SEOHead view={view} prefs={prefs} result={result || undefined} country={prefs.country} />

      {/* Navigation */}
      <nav className="w-full py-3 md:py-6 px-4 md:px-12 flex justify-between items-center z-[60] fixed top-0 left-0 right-0 bg-white/80 dark:bg-dark-100/90 backdrop-blur-md border-b border-rose-100 dark:border-dark-border transition-all duration-300 safe-pt shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={handleReset}>
          <div className="w-8 h-8 bg-gradient-to-br from-rose-accent to-peach-accent rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
            <span className="text-white text-lg">🌸</span>
          </div>
          <span className="font-display font-bold text-lg md:text-xl bg-gradient-to-r from-rose-accent to-peach-accent bg-clip-text text-transparent">DoubleMyHolidays</span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={() => setView('how-it-works')}
            className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-accent transition-colors hidden md:block"
          >
            How it Works
          </button>
          <button
            onClick={() => setView('strategy-demos')}
            className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-lavender-accent transition-colors hidden md:block"
          >
            Vacation Styles
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-dark-surface transition-colors hidden md:flex items-center justify-center"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Create User/Restart logic links for Desktop */}
          {step > 0 && (
            <button
              onClick={handleReset}
              className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-accent transition-colors hidden md:block"
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
            onClick={() => {
              if (view !== 'landing') {
                setView('landing');
                setStep(1);
                setTimeout(() => {
                  const el = document.getElementById('wizard-section');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              } else {
                scrollToWizard();
              }
            }}
            className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold bg-gradient-to-r from-rose-accent to-peach-accent hover:shadow-lg hover:shadow-rose-accent/30 text-white rounded-full transition-all active:scale-95 transform hover:-translate-y-0.5"
          >
            {step > 0 ? 'Resume ✨' : 'Plan 💖'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[59] bg-white/95 dark:bg-dark-100/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-fade-in text-center">
          <button
            onClick={() => { setView('how-it-works'); setIsMobileMenuOpen(false); }}
            className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100 hover:text-rose-accent transition-colors py-2 border-b border-gray-100 dark:border-dark-border"
          >
            How it Works
          </button>
          <button
            onClick={() => { setView('strategy-demos'); setIsMobileMenuOpen(false); }}
            className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100 hover:text-rose-accent transition-colors py-2 border-b border-gray-100 dark:border-dark-border"
          >
            Vacation Styles
          </button>
          {/* Dark Mode Toggle - Mobile */}
          <button
            onClick={() => { toggleDarkMode(); }}
            className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100 hover:text-rose-accent transition-colors py-2 border-b border-gray-100 dark:border-dark-border flex items-center justify-center gap-3"
          >
            {isDark ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark Mode
              </>
            )}
          </button>
          {step > 0 && (
            <button
              onClick={() => { handleReset(); setIsMobileMenuOpen(false); }}
              className="text-2xl font-display font-bold text-rose-500 hover:text-rose-600 transition-colors py-2 border-b border-gray-100 dark:border-dark-border"
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

      {/* Resume Progress Banner */}
      {showResumeBanner && view === 'landing' && step === 0 && (
        <div className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-lg z-[58] animate-fade-up">
          <div className="bg-gradient-to-r from-lavender-50 to-rose-50 dark:from-dark-surface dark:to-dark-200 border border-lavender-200 dark:border-dark-border rounded-2xl p-4 shadow-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-lavender-100 dark:bg-lavender-accent/20 flex items-center justify-center text-lavender-accent flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Welcome back!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Continue where you left off</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleDismissResume}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleResumeProgress}
                className="px-4 py-1.5 text-xs font-bold bg-lavender-accent text-white rounded-lg hover:bg-lavender-accent/90 transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[58] animate-fade-up">
          <div className="bg-gradient-to-r from-rose-500 to-peach-accent dark:from-rose-600 dark:to-peach-accent rounded-2xl p-4 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              📱
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Install the App</p>
              <p className="text-xs text-white/80 truncate">Access your plans anytime, even offline</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => {
                  promptInstall();
                  setShowInstallBanner(false);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-white text-rose-accent rounded-lg hover:bg-white/90 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions */}
      {showIOSPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[58] animate-fade-up">
          <div className="bg-white dark:bg-dark-surface border border-rose-100 dark:border-dark-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-accent/20 flex items-center justify-center text-2xl flex-shrink-0">
                📲
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">Add to Home Screen</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Tap <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-dark-200 px-1.5 py-0.5 rounded">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316" />
                    </svg>
                    Share
                  </span> then "Add to Home Screen" for quick access
                </p>
                <button
                  onClick={dismissIOSPrompt}
                  className="text-xs font-medium text-rose-accent hover:text-rose-600 transition-colors"
                >
                  Got it
                </button>
              </div>
              <button
                onClick={dismissIOSPrompt}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-[58] animate-fade-up">
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2 shadow-lg flex items-center gap-3">
            <span className="text-amber-500">⚠️</span>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">You're offline - saved plans still available</span>
          </div>
        </div>
      )}

      {/* --- LANDING PAGE --- */}
      {view === 'landing' && (
        <>
          <PainHero onCta={scrollToWizard} />
          <BurnCalculator />
          <SolutionGrid />
          <TrustSection />

            {showMobileCta && !isMobileMenuOpen && (
              <div className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-3 md:hidden pointer-events-none">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/95 dark:bg-dark-100/95 border border-rose-100 dark:border-dark-border shadow-2xl rounded-[22px] p-3 flex items-center gap-3 safe-pb pointer-events-auto transition-transform duration-300 will-change-transform">
                    <div className="flex-1 text-left space-y-1" aria-live="polite" aria-atomic="true">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-accent">
                        <span className={`w-1.5 h-1.5 rounded-full ${isWizardVisible ? 'bg-lavender-accent' : 'bg-rose-accent animate-pulse'}`} />
                        {isWizardVisible ? 'Wizard ready' : 'Quick jump'}
                        {step > 0 && <span className="text-gray-400">•</span>}
                        {step > 0 && <span className="text-gray-500 dark:text-gray-400">{`Step ${clampedStep}/4`}</span>}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{mobileStepSummary}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-rose-50 dark:bg-dark-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-accent to-peach-accent rounded-full transition-all duration-500"
                            style={{ width: `${mobileProgressWidth}%` }}
                          />
                        </div>
                        <button
                          onClick={handleMobileCta}
                          className="px-3 py-2 bg-gradient-to-r from-rose-accent to-peach-accent text-white font-bold rounded-xl shadow-md shadow-rose-accent/20 active:scale-95 transition-transform text-xs whitespace-nowrap"
                        >
                          {step === 0 ? 'Start' : 'Resume'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Saved Plans Section */}
          {savedPlans.length > 0 && (
            <div className="w-full bg-gradient-to-br from-lavender-50 to-rose-50 dark:from-dark-200 dark:to-dark-100 py-16 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 dark:text-gray-100">Your Saved Plans</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pick up where you left off</p>
                  </div>
                  <span className="text-xs font-bold text-lavender-accent bg-lavender-100 dark:bg-lavender-accent/20 px-3 py-1 rounded-full">
                    {savedPlans.length} saved
                  </span>
                </div>
                <div className="grid gap-4">
                  {savedPlans.slice(0, 3).map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setPrefs(plan.prefs);
                        setResult(plan.result);
                        setView('results');
                        setIsLocked(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full bg-white dark:bg-dark-surface border border-lavender-100 dark:border-dark-border rounded-2xl p-5 text-left hover:shadow-lg hover:border-lavender-200 dark:hover:border-lavender-accent/30 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-lavender-accent bg-lavender-50 dark:bg-lavender-accent/20 px-2 py-0.5 rounded">
                              {plan.result.planName}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(plan.savedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-lavender-accent transition-colors">
                            {plan.result.totalDaysOff} days off with {plan.result.totalPtoUsed} PTO
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {plan.prefs.country}{plan.prefs.region ? `, ${plan.prefs.region}` : ''} • {plan.result.vacationBlocks.length} trips
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Value</p>
                            <p className="font-bold text-rose-accent">${plan.result.totalValueRecovered.toLocaleString()}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-lavender-accent group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* THE WIZARD */}
          <div id="wizard-section" ref={wizardRef} className="w-full bg-gradient-to-br from-light-100 via-light-200 to-light-300 py-14 md:py-24 px-4 scroll-mt-24 relative z-[55]">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-rose-accent via-lavender-accent to-peach-accent bg-clip-text text-transparent mb-3">Let's Plan Your Perfect Year ✨</h2>
                <p className="text-gray-600 text-base sm:text-lg">Build your optimized schedule in 60 seconds.</p>
              </div>

              {/* FIX: Removed 'overflow-hidden' and 'backdrop-blur' to fix mobile sticky buttons */}
              {/* FIX: Added z-[60] to ensure it sits ABOVE the bg-noise layer */}
              <div {...swipeHandlers} className="relative z-[60] glass-panel rounded-[2rem] p-6 md:p-12 min-h-[600px] flex flex-col shadow-2xl touch-pan-y">
                <div className="md:hidden sticky -top-4 -mx-4 px-4 pb-2 z-[62]">
                  <div className="bg-white/95 dark:bg-dark-100/95 border border-rose-100 dark:border-dark-border rounded-2xl shadow-md p-3 flex items-center gap-3">
                    <div className="flex-1 space-y-1" aria-live="polite" aria-atomic="true">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-rose-accent">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-accent animate-pulse" />
                          {step === 0 ? 'Wizard' : `Step ${clampedStep} of 4`}
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">{stepStatusLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-rose-50 dark:bg-dark-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-accent to-peach-accent rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(mobileProgressWidth, step === 0 ? 8 : 16)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={scrollWizardIntoView}
                      className="p-2 text-xs font-semibold bg-rose-50 dark:bg-dark-200 text-rose-accent rounded-xl border border-rose-100 dark:border-dark-border active:scale-95 transition"
                      aria-label="Back to wizard"
                    >
                      ↑
                    </button>
                  </div>
                </div>

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

                {step === 1 && <Step1PTO prefs={prefs} updatePrefs={updatePrefs} onNext={handleNext} direction={direction} />}
                {step === 2 && <Step2Timeframe prefs={prefs} updatePrefs={updatePrefs} onNext={handleNext} onBack={handleBack} direction={direction} />}
                {step === 3 && <Step3Strategy prefs={prefs} updatePrefs={updatePrefs} onNext={handleNext} onBack={handleBack} direction={direction} />}
                {step === 4 && <Step4Location prefs={prefs} updatePrefs={updatePrefs} onNext={handleGenerate} onBack={handleBack} direction={direction} />}
                {step === 5 && <SolverTerminal timeframe={prefs.timeframe} />}
              </div>
            </div>
          </div>


        </>
      )}

      {view === 'results' && result && (
        <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 relative z-40 bg-gradient-to-br from-light-100 via-light-200 to-light-300 slide-in-from-bottom">
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
              onSavePlan={() => savePlan(prefs, result)}
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
                      <span className="text-gray-600 font-medium group-hover/link:text-lavender-accent transition-colors">Vacation Styles</span>
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
                <span>DoubleMyHolidays © 2025</span>
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
