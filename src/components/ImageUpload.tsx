import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Camera } from 'lucide-react';
import { ImageFile } from '../types';
import { UsageTrackingHook } from '../hooks/useUsageTracking';

interface ImageUploadProps {
  images: ImageFile[];
  onImagesAdd: (files: ImageFile[]) => void;
  onImageRemove: (id: string) => void;
  onUpgradeNeeded: (reason: string) => void;
  usageTracking: UsageTrackingHook;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesAdd,
  onImageRemove,
  onUpgradeNeeded,
  usageTracking
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (validFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, or WebP).');
      return;
    }

    // The actual upload limit checking is now handled in the parent component (App.tsx)
    // via the handleImagesAdd function, which uses secure usage tracking
    const imageFiles: ImageFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size
    }));

    // This will now trigger the secure usage tracking in App.tsx
    onImagesAdd(imageFiles);
  }, [onImagesAdd]);

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



  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        className={`card-hover border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center transition-all duration-500 relative overflow-hidden ${
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
        
        <div className="space-y-4 sm:space-y-6 relative z-10">
          <div className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center transition-all duration-500 shadow-brand icon-glow ${
            isDragging ? 'animate-bounce scale-110' : 'loading-float'
          }`}>
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 text-shadow">
              Drop images here or click to upload
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 flex items-center justify-center text-sm sm:text-lg">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-500" />
              Supports JPG, PNG, and WebP files
            </p>
            
            <label className="inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl sm:rounded-2xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-brand font-bold text-base sm:text-lg gentle-bounce">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-6">
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
                className="card card-hover rounded-xl sm:rounded-2xl overflow-hidden shadow-medium animate-slide-up relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Delete Button - Outside the image container for better accessibility */}
                <button
                  onClick={handleDeleteClick}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white transition-all duration-200 hover:scale-110"
                  title="Remove image"
                  type="button"
                >
                  ×
                </button>

                <div className="relative group">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-24 sm:h-32 object-cover"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-2 sm:p-4 bg-white">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-brand-500" />
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