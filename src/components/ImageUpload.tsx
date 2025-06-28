import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle, Plus, Image as ImageIcon } from 'lucide-react';
import { ImageFile, FREEMIUM_LIMITS } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ImageUploadProps {
  images: ImageFile[];
  onImagesAdd: (files: ImageFile[]) => void;
  onImageRemove: (id: string) => void;
  onUpgradeNeeded: (reason: string) => void;
  uploadCount: number;
  remainingUploads: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesAdd,
  onImageRemove,
  onUpgradeNeeded,
  uploadCount,
  remainingUploads
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { isPremium } = useAuth();

  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    // Allow users to add images for preview - compression limits are checked later
    const imageFiles: ImageFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size
    }));

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
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-brand-400 bg-brand-50 scale-[1.02]'
            : 'border-neutral-300 hover:border-brand-300 hover:bg-brand-50/30'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center gradient-brand">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              Add Your Photos
            </h3>
            <p className="text-neutral-600 mb-4">
              Drag and drop or click to choose
            </p>
            
            {!isPremium && remainingUploads <= 2 && (
              <div className="inline-flex items-center px-3 py-2 bg-orange-100 border border-orange-200 rounded-xl text-orange-700 text-sm mb-4">
                <AlertCircle className="w-4 h-4 mr-2" />
                {remainingUploads} compression{remainingUploads !== 1 ? 's' : ''} left this session
              </div>
            )}
            
            <label className="inline-flex items-center px-6 py-3 rounded-xl font-medium cursor-pointer transition-transform gradient-brand text-white hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Choose Photos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            <p className="text-xs text-neutral-500 mt-3">
              Supports JPG, PNG & WebP files
            </p>
          </div>
        </div>
      </div>

      {/* Images Preview */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-neutral-700">
              {images.length} photo{images.length !== 1 ? 's' : ''} ready
            </h4>
            {!isPremium && (
              <div className="text-xs text-neutral-500">
                Session compressions: {uploadCount}/{FREEMIUM_LIMITS.maxImages}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {image.processed && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onImageRemove(image.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-neutral-900/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="p-2">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>{(image.originalSize / 1024).toFixed(0)}KB</span>
                    {image.processed && (
                      <span className="text-success-600 font-medium">Done!</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};