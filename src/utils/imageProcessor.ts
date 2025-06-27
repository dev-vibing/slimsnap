import { ImageFile, CompressionSettings, FREEMIUM_LIMITS } from '../types';

export const processImage = async (
  imageFile: ImageFile,
  settings: CompressionSettings,
  isPremium: boolean = false
): Promise<{ blob: Blob; url: string; size: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate new dimensions with freemium limits
      let { width, height } = img;
      
      // Apply freemium resolution limits
      if (!isPremium) {
        const maxRes = FREEMIUM_LIMITS.maxResolution;
        if (width > maxRes || height > maxRes) {
          if (width > height) {
            height = (height * maxRes) / width;
            width = maxRes;
          } else {
            width = (width * maxRes) / height;
            height = maxRes;
          }
        }
      }
      
      if (settings.maxWidth && width > settings.maxWidth) {
        height = (height * settings.maxWidth) / width;
        width = settings.maxWidth;
      }
      
      if (settings.maxHeight && height > settings.maxHeight) {
        width = (width * settings.maxHeight) / height;
        height = settings.maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({
              blob,
              url,
              size: blob.size
            });
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        imageFile.file.type,
        settings.quality / 100
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageFile.preview;
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateSavings = (original: number, compressed: number): number => {
  return Math.round(((original - compressed) / original) * 100);
};

export const checkFreemiumLimits = (
  imageCount: number,
  quality: number,
  maxWidth: number,
  maxHeight: number,
  isPremium: boolean
): { allowed: boolean; reason: string } => {
  if (isPremium) {
    return { allowed: true, reason: '' };
  }

  if (imageCount > FREEMIUM_LIMITS.maxImages) {
    return {
      allowed: false,
      reason: `Free users can only upload ${FREEMIUM_LIMITS.maxImages} images at once. Upgrade to Premium for unlimited uploads.`
    };
  }

  if (quality < FREEMIUM_LIMITS.minQuality || quality > FREEMIUM_LIMITS.maxQuality) {
    return {
      allowed: false,
      reason: `Free users can only use quality between ${FREEMIUM_LIMITS.minQuality}% and ${FREEMIUM_LIMITS.maxQuality}%. Upgrade to Premium for full quality control.`
    };
  }

  const maxRes = FREEMIUM_LIMITS.maxResolution;
  if (maxWidth > maxRes || maxHeight > maxRes) {
    return {
      allowed: false,
      reason: `Free users are limited to ${maxRes}x${maxRes} resolution. Upgrade to Premium for unlimited resolution.`
    };
  }

  return { allowed: true, reason: '' };
};