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

export const FREEMIUM_LIMITS: FreemiumLimits = {
  maxImages: 3,
  minQuality: 50,
  maxQuality: 80,
  maxResolution: 1280,
};