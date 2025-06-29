import { useState, useEffect, useCallback } from 'react';
import { SessionUsage, FREE_USAGE_LIMITS } from '../types';

const STORAGE_KEY = 'slimsnap_usage_tracking';

// Helper function to get start of today
const getStartOfDay = (): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

// Helper function to get start of tomorrow for reset
const getStartOfTomorrow = (): number => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

// Initialize usage data
const initializeUsage = (): SessionUsage => {
  const now = Date.now();
  const tomorrowStart = getStartOfTomorrow();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: SessionUsage = JSON.parse(stored);
      
      // Check if we need to reset daily limits
      if (now >= data.dailyResetTime) {
        // New day - reset daily counters but keep session if it's the same browser session
        const newData: SessionUsage = {
          imagesProcessed: 0,
          sessionStart: data.sessionStart, // Keep original session start
          dailyResetTime: tomorrowStart,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return newData;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error loading usage data:', error);
  }

  // Create new usage data
  const newData: SessionUsage = {
    imagesProcessed: 0,
    sessionStart: now,
    dailyResetTime: tomorrowStart,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

export interface UsageTrackingHook {
  usage: SessionUsage;
  canUploadImages: (count: number, currentImagesInUI: number) => { allowed: boolean; reason: string };
  canProcessImages: (count: number) => { allowed: boolean; reason: string };
  trackImageProcessing: (count: number) => void;
  getRemainingProcessing: () => number;
}

export const useUsageTracking = (isPremium: boolean = false): UsageTrackingHook => {
  const [usage, setUsage] = useState<SessionUsage>(() => initializeUsage());

  // Save usage data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }, [usage]);

  // Check if user can upload more images (only concurrent limit, not usage limit)
  const canUploadImages = useCallback((count: number, currentImagesInUI: number): { allowed: boolean; reason: string } => {
    if (isPremium) {
      return { allowed: true, reason: '' };
    }

    const maxConcurrent = FREE_USAGE_LIMITS.maxConcurrentUploads;
    
    if (currentImagesInUI + count > maxConcurrent) {
      return {
        allowed: false,
        reason: `To prevent browser crashes, you can only have ${maxConcurrent} images loaded at once. Please process or remove some images first, or upgrade to Premium for better performance.`
      };
    }

    return { allowed: true, reason: '' };
  }, [isPremium]);

  // Check if user can process more images (this is where the real limits apply)
  const canProcessImages = useCallback((count: number): { allowed: boolean; reason: string } => {
    if (isPremium) {
      return { allowed: true, reason: '' };
    }

    const sessionLimit = FREE_USAGE_LIMITS.maxProcessingPerSession;
    const dailyLimit = FREE_USAGE_LIMITS.maxDailyProcessing;

    if (usage.imagesProcessed + count > sessionLimit) {
      return {
        allowed: false,
        reason: `Free users can only compress ${sessionLimit} images per session. You've compressed ${usage.imagesProcessed} images so far. Refresh the page to start a new session, or upgrade to Premium for unlimited processing.`
      };
    }

    if (usage.imagesProcessed + count > dailyLimit) {
      return {
        allowed: false,
        reason: `Free users can only compress ${dailyLimit} images per day. You've compressed ${usage.imagesProcessed} images today. Try again tomorrow or upgrade to Premium.`
      };
    }

    return { allowed: true, reason: '' };
  }, [isPremium, usage.imagesProcessed]);

  // Track image processing (called when images are successfully processed)
  const trackImageProcessing = useCallback((count: number) => {
    const newUsage = {
      ...usage,
      imagesProcessed: usage.imagesProcessed + count
    };
    
    // Save immediately to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
    } catch (error) {
      console.error('Error saving usage data to localStorage:', error);
    }
    
    setUsage(newUsage);
  }, [usage]);

  // Get remaining processing for current session/day
  const getRemainingProcessing = useCallback((): number => {
    if (isPremium) return Infinity;
    
    const sessionRemaining = FREE_USAGE_LIMITS.maxProcessingPerSession - usage.imagesProcessed;
    const dailyRemaining = FREE_USAGE_LIMITS.maxDailyProcessing - usage.imagesProcessed;
    
    return Math.max(0, Math.min(sessionRemaining, dailyRemaining));
  }, [isPremium, usage.imagesProcessed]);

  return {
    usage,
    canUploadImages,
    canProcessImages,
    trackImageProcessing,
    getRemainingProcessing,
  };
}; 