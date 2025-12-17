import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, OptimizationResult } from '../types';

const STORAGE_KEYS = {
  WIZARD_PROGRESS: 'dmh-wizard-progress',
  SAVED_PLANS: 'dmh-saved-plans',
  UNLOCKED_SESSIONS: 'dmh-unlocked',
} as const;

// --- Wizard Progress Auto-Save ---
interface WizardProgress {
  step: number;
  prefs: UserPreferences;
  savedAt: number;
}

export function useWizardProgress() {
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [restoredProgress, setRestoredProgress] = useState<WizardProgress | null>(null);

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

      setHasRestoredProgress(true);
      return progress;
    } catch (e) {
      console.warn('Failed to load wizard progress:', e);
      return null;
    }
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WIZARD_PROGRESS);
      setHasRestoredProgress(false);
      setRestoredProgress(null);
    } catch (e) {
      console.warn('Failed to clear wizard progress:', e);
    }
  }, []);

  useEffect(() => {
    const progress = loadProgress();
    if (progress) {
      setRestoredProgress(progress);
    }
  }, [loadProgress]);

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasRestoredProgress,
    setHasRestoredProgress,
    restoredProgress,
  };
}

// --- Saved Plans History ---
export interface SavedPlanMetadata {
  planName?: string;
  totalDaysOff?: number;
  totalPtoUsed?: number;
  totalValueRecovered?: number;
  tripCount?: number;
  summary?: string;
}

export interface SavedPlan {
  id: string;
  name: string;
  prefs: UserPreferences;
  result?: OptimizationResult;
  savedAt: number;
  isUnlocked: boolean;
  metadata: SavedPlanMetadata;
}

const MAX_SAVED_PLANS = 5;

export function useSavedPlans() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  const buildMetadata = useCallback((result?: OptimizationResult): SavedPlanMetadata => ({
    planName: result?.planName,
    totalDaysOff: result?.totalDaysOff,
    totalPtoUsed: result?.totalPtoUsed,
    totalValueRecovered: result?.totalValueRecovered,
    tripCount: result?.vacationBlocks?.length ?? 0,
    summary: result?.summary,
  }), []);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_PLANS);
      if (saved) {
        const parsed: SavedPlan[] = JSON.parse(saved);
        setSavedPlans(parsed.map(plan => ({
          ...plan,
          isUnlocked: plan.isUnlocked ?? false,
          metadata: plan.metadata ?? buildMetadata(plan.result),
        })));
      }
    } catch (e) {
      console.warn('Failed to load saved plans:', e);
    }
  }, [buildMetadata]);

  const savePlan = useCallback((prefs: UserPreferences, result?: OptimizationResult, options?: { customName?: string; isUnlocked?: boolean; metadata?: SavedPlanMetadata }) => {
    const metadata = options?.metadata ?? buildMetadata(result);
    const isUnlocked = options?.isUnlocked ?? false;
    const newPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      name: options?.customName || `${metadata.planName || 'Saved plan'} - ${new Date().toLocaleDateString()}`,
      prefs,
      result: isUnlocked ? result : undefined,
      savedAt: Date.now(),
      isUnlocked,
      metadata,
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
  }, [buildMetadata]);

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

// --- Unlocked Sessions (remember payment) ---
export function useUnlockedSession() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    // Check browser environment inline to avoid TDZ issues
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    try {
      return localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSIONS) === 'true';
    } catch {
      return false;
    }
  });

  const markUnlocked = useCallback(() => {
    setIsUnlocked(true);
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_SESSIONS, 'true');
    } catch (e) {
      // Ignore
    }
  }, []);

  const resetUnlock = useCallback(() => {
    setIsUnlocked(false);
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_SESSIONS);
    } catch (e) {
      // Ignore
    }
  }, []);

  return { isUnlocked, markUnlocked, resetUnlock };
}
