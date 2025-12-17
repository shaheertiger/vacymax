import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, OptimizationResult } from '../types';

const STORAGE_KEYS = {
  WIZARD_PROGRESS: 'dmh-wizard-progress',
  SAVED_PLANS: 'dmh-saved-plans',
  DARK_MODE: 'dmh-dark-mode',
  UNLOCKED_SESSIONS: 'dmh-unlocked',
} as const;

// --- Wizard Progress Auto-Save ---
interface WizardProgress {
  step: number;
  prefs: UserPreferences;
  savedAt: number;
}

export function useWizardProgress(initialPrefs: UserPreferences) {
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  const saveProgress = useCallback((step: number, prefs: UserPreferences) => {
    if (step > 0 && step < 5) {
      const progress: WizardProgress = {
        step,
        prefs,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEYS.WIZARD_PROGRESS, JSON.stringify(progress));
      } catch (e) {
        console.warn('Failed to save wizard progress:', e);
      }
    }
  }, []);

  const loadProgress = useCallback((): WizardProgress | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WIZARD_PROGRESS);
      if (!saved) return null;

      const progress: WizardProgress = JSON.parse(saved);
      // Only restore if saved within last 24 hours
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - progress.savedAt > oneDay) {
        localStorage.removeItem(STORAGE_KEYS.WIZARD_PROGRESS);
        return null;
      }
      return progress;
    } catch (e) {
      console.warn('Failed to load wizard progress:', e);
      return null;
    }
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WIZARD_PROGRESS);
    } catch (e) {
      console.warn('Failed to clear wizard progress:', e);
    }
  }, []);

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasRestoredProgress,
    setHasRestoredProgress,
  };
}

// --- Saved Plans History ---
export interface SavedPlan {
  id: string;
  name: string;
  prefs: UserPreferences;
  result: OptimizationResult;
  savedAt: number;
}

const MAX_SAVED_PLANS = 5;

export function useSavedPlans() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_PLANS);
      if (saved) {
        setSavedPlans(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved plans:', e);
    }
  }, []);

  const savePlan = useCallback((prefs: UserPreferences, result: OptimizationResult, customName?: string) => {
    const newPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      name: customName || `${result.planName} - ${new Date().toLocaleDateString()}`,
      prefs,
      result,
      savedAt: Date.now(),
    };

    setSavedPlans(prev => {
      const updated = [newPlan, ...prev].slice(0, MAX_SAVED_PLANS);
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save plan:', e);
      }
      return updated;
    });

    return newPlan.id;
  }, []);

  const deletePlan = useCallback((planId: string) => {
    setSavedPlans(prev => {
      const updated = prev.filter(p => p.id !== planId);
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to delete plan:', e);
      }
      return updated;
    });
  }, []);

  const clearAllPlans = useCallback(() => {
    setSavedPlans([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_PLANS);
    } catch (e) {
      console.warn('Failed to clear plans:', e);
    }
  }, []);

  return {
    savedPlans,
    savePlan,
    deletePlan,
    clearAllPlans,
  };
}

// --- Dark Mode ---
export function useDarkMode() {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  const [isDark, setIsDark] = useState(() => {
    if (!isBrowser) return false;

    // Check localStorage first
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      // Ignore
    }
    // Fall back to system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (!isBrowser) return;

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark));
    } catch (e) {
      // Ignore
    }
  }, [isDark, isBrowser]);

  // Listen for system preference changes
  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a preference
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
        if (saved === null) {
          setIsDark(e.matches);
        }
      } catch {
        // Ignore localStorage errors
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isBrowser]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  return { isDark, toggleDarkMode };
}

// --- Unlocked Sessions (remember payment) ---
export function useUnlockedSession() {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!isBrowser) return false;
    try {
      return localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSIONS) === 'true';
    } catch {
      return false;
    }
  });

  const markUnlocked = useCallback(() => {
    setIsUnlocked(true);
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_SESSIONS, 'true');
    } catch (e) {
      // Ignore
    }
  }, [isBrowser]);

  return { isUnlocked, markUnlocked };
}
