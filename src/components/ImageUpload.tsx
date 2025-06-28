import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertTriangle, Camera } from 'lucide-react';
import { ImageFile, FREEMIUM_LIMITS } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        className={`card-hover border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 relative overflow-hidden ${
          isDragging
            ? 'border-brand-400 bg-brand-50 scale-105 shadow-brand'
            : 'border-gray-300 hover:border-brand-300 hover:bg-brand-25'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-brand-500 to-accent-500"></div>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className={`mx-auto w-20 h-20 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center transition-all duration-500 shadow-brand icon-glow ${
            isDragging ? 'animate-bounce scale-110' : 'loading-float'
          }`}>
            <Upload className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3 text-shadow">
              Drop images here or click to upload
            </h3>
            <p className="text-gray-600 mb-4 flex items-center justify-center text-lg">
              <Camera className="w-5 h-5 mr-2 text-brand-500" />
              Supports JPG, PNG, and WebP files
            </p>
            
            {!isPremium && (
              <div className="inline-flex items-center bg-warning-50 border border-warning-200 rounded-full px-4 py-2 mb-6">
                <AlertTriangle className="w-4 h-4 mr-2 text-warning-600" />
                <span className="text-warning-700 text-sm font-medium">
                  Free: {remainingSlots} of {FREEMIUM_LIMITS.maxImages} slots remaining
                </span>
              </div>
            )}
            
            <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-brand font-bold text-lg gentle-bounce">
              <Upload className="w-6 h-6 mr-3" />
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

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {images.map((image, index) => {
            const handleDeleteClick = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Delete clicked for image:', image.id);
              onImageRemove(image.id);
            };

            return (
              <div
                key={image.id}
                className="card card-hover rounded-2xl overflow-hidden shadow-medium animate-slide-up relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Delete Button - Outside the image container for better accessibility */}
                <button
                  onClick={handleDeleteClick}
                  className="absolute -top-2 -right-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white transition-all duration-200 hover:scale-110"
                  title="Remove image"
                  type="button"
                >
                  ×
                </button>

                <div className="relative group">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4 bg-white">
                  <div className="flex items-center text-sm text-gray-600">
                    <ImageIcon className="w-4 h-4 mr-2 text-brand-500" />
                    <span className="font-medium">
                      {(image.originalSize / 1024).toFixed(1)}KB
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};