import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { ImageFile, FREEMIUM_LIMITS } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ImageUploadProps {
  images: ImageFile[];
  onImagesAdd: (files: ImageFile[]) => void;
  onImageRemove: (id: string) => void;
  onUpgradeNeeded: (reason: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesAdd,
  onImageRemove,
  onUpgradeNeeded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { isPremium } = useAuth();

  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    // Check freemium limits
    const totalImages = images.length + validFiles.length;
    if (!isPremium && totalImages > FREEMIUM_LIMITS.maxImages) {
      onUpgradeNeeded(
        `Free users can only upload ${FREEMIUM_LIMITS.maxImages} images at once. You're trying to upload ${totalImages} images total.`
      );
      return;
    }

    const imageFiles: ImageFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size
    }));

    onImagesAdd(imageFiles);
  }, [images.length, isPremium, onImagesAdd, onUpgradeNeeded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const remainingSlots = isPremium ? Infinity : FREEMIUM_LIMITS.maxImages - images.length;

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop images here or click to upload
            </h3>
            <p className="text-gray-600 mb-2">
              Supports JPG, PNG, and WebP files
            </p>
            {!isPremium && (
              <div className="flex items-center justify-center text-sm text-orange-600 mb-4">
                <AlertCircle className="w-4 h-4 mr-1" />
                Free: {remainingSlots} of {FREEMIUM_LIMITS.maxImages} slots remaining
              </div>
            )}
            <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer transform hover:scale-105">
              <Upload className="w-5 h-5 mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={image.preview}
                alt="Preview"
                className="w-full h-24 object-cover"
              />
              <button
                onClick={() => onImageRemove(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-2">
                <div className="flex items-center text-xs text-gray-600">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  {(image.originalSize / 1024).toFixed(1)}KB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};