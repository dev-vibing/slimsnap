export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  processed?: {
    blob: Blob;
    url: string;
    size: number;
  };
}

export interface CompressionSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

export interface FreemiumLimits {
  maxImages: number;
  minQuality: number;
  maxQuality: number;
  maxResolution: number;
}

// New: Session-based usage tracking
export interface SessionUsage {
  imagesProcessed: number;  // Only count actual compressions
  sessionStart: number; // timestamp
  dailyResetTime: number; // timestamp for daily reset
}

export interface UsageLimits {
  maxConcurrentUploads: number; // Max images in UI at once (to prevent browser crashes)
  maxProcessingPerSession: number;
  maxDailyProcessing: number;
}

export const FREEMIUM_LIMITS: FreemiumLimits = {
  maxImages: 3,
  minQuality: 50,
  maxQuality: 80,
  maxResolution: 1280,
};

// Secure usage limits for free users
export const FREE_USAGE_LIMITS: UsageLimits = {
  maxConcurrentUploads: 3, // Max images that can be loaded in UI at once for free users
  maxProcessingPerSession: 3, // Total compressions allowed per session
  maxDailyProcessing: 10, // Total compressions per day
};