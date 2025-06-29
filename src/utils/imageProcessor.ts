import imageCompression from 'browser-image-compression';
import { ImageFile, CompressionSettings, FREEMIUM_LIMITS } from '../types';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

/**
 * Advanced image compression using browser-image-compression library
 * Much more reliable than canvas-based compression
 */
export const processImage = async (
  imageFile: ImageFile,
  settings: CompressionSettings,
  isPremium: boolean = false
): Promise<{ blob: Blob; url: string; size: number }> => {
  try {
    // Determine the target file type (convert PNG to JPEG for better compression)
    const originalType = imageFile.file.type;
    let targetType = originalType;
    
    // Convert PNG to JPEG for better compression (unless user needs transparency)
    if (originalType === 'image/png' && settings.quality < 95) {
      targetType = 'image/jpeg';
    }

    // Calculate maximum dimensions based on freemium limits
    let maxDimension = Infinity;
    
    if (!isPremium) {
      maxDimension = Math.min(maxDimension, FREEMIUM_LIMITS.maxResolution);
    }
    
    if (settings.maxWidth && settings.maxWidth > 0) {
      maxDimension = Math.min(maxDimension, settings.maxWidth);
    }
    
    if (settings.maxHeight && settings.maxHeight > 0) {
      maxDimension = Math.min(maxDimension, settings.maxHeight);
    }

    // Prepare compression options
    const compressionOptions: CompressionOptions = {
      maxWidthOrHeight: maxDimension === Infinity ? undefined : maxDimension,
      useWebWorker: true,
      fileType: targetType,
      initialQuality: settings.quality / 100,
    };

    // Calculate target size based on quality setting
    // Lower quality = smaller target size
    const originalSizeMB = imageFile.file.size / (1024 * 1024);
    let targetSizeMB: number;

    if (settings.quality <= 30) {
      targetSizeMB = originalSizeMB * 0.1; // Very aggressive compression
    } else if (settings.quality <= 50) {
      targetSizeMB = originalSizeMB * 0.2; // Aggressive compression
    } else if (settings.quality <= 70) {
      targetSizeMB = originalSizeMB * 0.4; // Moderate compression
    } else if (settings.quality <= 85) {
      targetSizeMB = originalSizeMB * 0.6; // Light compression
    } else {
      targetSizeMB = originalSizeMB * 0.8; // Minimal compression
    }

    // Ensure minimum target size for very small images
    targetSizeMB = Math.max(targetSizeMB, 0.01); // At least 10KB
    compressionOptions.maxSizeMB = targetSizeMB;

    console.log('Compression options:', {
      originalSize: formatFileSize(imageFile.file.size),
      targetSize: formatFileSize(targetSizeMB * 1024 * 1024),
      quality: settings.quality,
      maxDimension,
      originalType,
      targetType
    });

    // Perform the compression
    const compressedFile = await imageCompression(imageFile.file, compressionOptions);
    
    // Create object URL for the compressed image
    const url = URL.createObjectURL(compressedFile);
    
    console.log('Compression result:', {
      originalSize: formatFileSize(imageFile.file.size),
      compressedSize: formatFileSize(compressedFile.size),
      savings: calculateSavings(imageFile.file.size, compressedFile.size)
    });

    return {
      blob: compressedFile,
      url,
      size: compressedFile.size
    };

  } catch (error) {
    console.error('Image compression failed:', error);
    
    // Fallback to canvas-based compression if the library fails
    return await fallbackCanvasCompression(imageFile, settings, isPremium);
  }
};

/**
 * Fallback canvas-based compression (improved version)
 * Only used if the main library fails
 */
const fallbackCanvasCompression = async (
  imageFile: ImageFile,
  settings: CompressionSettings,
  isPremium: boolean
): Promise<{ blob: Blob; url: string; size: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate new dimensions
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
        
        // Apply user-defined limits
        if (settings.maxWidth && width > settings.maxWidth) {
          height = (height * settings.maxWidth) / width;
          width = settings.maxWidth;
        }
        
        if (settings.maxHeight && height > settings.maxHeight) {
          width = (width * settings.maxHeight) / height;
          height = settings.maxHeight;
        }

        // Set canvas dimensions
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        // Improve canvas rendering quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image with anti-aliasing
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Determine output format and quality
        let outputType = imageFile.file.type;
        let quality = settings.quality / 100;

        // Convert PNG to JPEG for better compression if quality is low
        if (outputType === 'image/png' && settings.quality < 95) {
          outputType = 'image/jpeg';
          // Fill background with white for JPEG conversion
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 255) { // If pixel is transparent
              data[i] = 255;     // Red
              data[i + 1] = 255; // Green
              data[i + 2] = 255; // Blue
              data[i + 3] = 255; // Alpha
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }

        // Create blob with quality setting
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
              reject(new Error('Failed to create compressed blob'));
            }
          },
          outputType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = imageFile.preview;
  });
};

/**
 * Batch process multiple images with progress tracking
 */
export const processImagesBatch = async (
  images: ImageFile[],
  settings: CompressionSettings,
  isPremium: boolean,
  onProgress?: (processed: number, total: number) => void
): Promise<ImageFile[]> => {
  const results: ImageFile[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      if (!image.processed) {
        const processed = await processImage(image, settings, isPremium);
        results.push({ ...image, processed });
      } else {
        results.push(image);
      }
    } catch (error) {
      console.error(`Failed to process image ${image.id}:`, error);
      // Keep original image if processing fails
      results.push(image);
    }
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, images.length);
    }
  }
  
  return results;
};

/**
 * Get recommended compression settings based on image characteristics
 */
export const getRecommendedSettings = (
  file: File,
  useCase: 'web' | 'email' | 'storage' | 'print' = 'web'
): Partial<CompressionSettings> => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  switch (useCase) {
    case 'web':
      if (fileSizeMB > 5) {
        return { quality: 75, maxWidth: 1920, maxHeight: 1080 };
      } else if (fileSizeMB > 2) {
        return { quality: 80, maxWidth: 1920, maxHeight: 1080 };
      } else {
        return { quality: 85 };
      }
    
    case 'email':
      return { quality: 70, maxWidth: 800, maxHeight: 600 };
    
    case 'storage':
      return { quality: 60, maxWidth: 1280, maxHeight: 720 };
    
    case 'print':
      return { quality: 95, maxWidth: 3000, maxHeight: 2000 };
    
    default:
      return { quality: 80 };
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateSavings = (original: number, compressed: number): number => {
  if (original === 0) return 0;
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