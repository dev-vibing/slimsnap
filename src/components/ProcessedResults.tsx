import React from 'react';
import { Download, Archive, CheckCircle, Lock, Zap } from 'lucide-react';
import JSZip from 'jszip';
import { ImageFile } from '../types';
import { formatFileSize, calculateSavings } from '../utils/imageProcessor';
import { useAuth } from '../hooks/useAuth';

interface ProcessedResultsProps {
  images: ImageFile[];
  onClearAll: () => void;
  onUpgradeNeeded: (reason: string) => void;
}

export const ProcessedResults: React.FC<ProcessedResultsProps> = ({
  images,
  onClearAll,
  onUpgradeNeeded
}) => {
  const { isPremium } = useAuth();
  const processedImages = images.filter(img => img.processed);

  const downloadImage = (image: ImageFile) => {
    if (!image.processed) return;
    
    const link = document.createElement('a');
    link.href = image.processed.url;
    link.download = `compressed_${image.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (!isPremium) {
      onUpgradeNeeded('Download all images as a ZIP file with Premium!');
      return;
    }

    const zip = new JSZip();
    
    for (const image of processedImages) {
      if (image.processed) {
        zip.file(`compressed_${image.file.name}`, image.processed.blob);
      }
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'compressed_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (processedImages.length === 0) return null;

  const totalOriginalSize = processedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = processedImages.reduce((sum, img) => sum + (img.processed?.size || 0), 0);
  const totalSavings = calculateSavings(totalOriginalSize, totalCompressedSize);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-success-50 to-green-50 rounded-xl border border-success-200">
        <div className="flex items-center">
          <div className="w-10 h-10 gradient-success rounded-xl flex items-center justify-center mr-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-success-800">Great job! 🎉</h3>
            <p className="text-success-700 text-sm">
              Saved {formatFileSize(totalOriginalSize - totalCompressedSize)} ({totalSavings}% smaller)
            </p>
          </div>
        </div>
      </div>

      {/* Download All Button */}
      {processedImages.length > 1 && (
        <button
          onClick={downloadAllAsZip}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
            isPremium
              ? 'gradient-brand text-white hover:scale-105'
              : 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
          }`}
          disabled={!isPremium}
        >
          {isPremium ? (
            <Archive className="w-5 h-5 mr-2" />
          ) : (
            <Lock className="w-5 h-5 mr-2" />
          )}
          Download All as ZIP {!isPremium && '(Premium)'}
        </button>
      )}

      {/* Individual Images */}
      <div className="space-y-3">
        {processedImages.map((image) => {
          const savings = calculateSavings(image.originalSize, image.processed!.size);
          
          return (
            <div
              key={image.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={image.preview}
                    alt="Compressed"
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-800 truncate text-sm">
                    {image.file.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-neutral-600">
                    <span>{formatFileSize(image.originalSize)}</span>
                    <span>→</span>
                    <span className="font-medium text-success-600">
                      {formatFileSize(image.processed!.size)}
                    </span>
                    <span className="px-2 py-1 bg-success-100 text-success-800 rounded-full font-medium">
                      -{savings}%
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => downloadImage(image)}
                  className="px-4 py-2 gradient-brand text-white rounded-xl font-medium text-sm hover:scale-105 transition-transform flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};