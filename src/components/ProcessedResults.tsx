import React from 'react';
import { Download, Archive, Trash2, CheckCircle, Lock } from 'lucide-react';
import JSZip from 'jszip';
import { ImageFile, FREEMIUM_LIMITS } from '../types';
import { formatFileSize, calculateSavings } from '../utils/imageProcessor';
import { useAuth } from '../contexts/AuthContext';

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
      onUpgradeNeeded(
        'ZIP batch downloads are a Premium feature. Upgrade to download all your compressed images at once.'
      );
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
    link.download = 'slimsnap_compressed_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (processedImages.length === 0) return null;

  const totalOriginalSize = processedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = processedImages.reduce((sum, img) => sum + (img.processed?.size || 0), 0);
  const totalSavings = calculateSavings(totalOriginalSize, totalCompressedSize);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processed Images ({processedImages.length})
            </h2>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Total savings: {formatFileSize(totalOriginalSize - totalCompressedSize)} ({totalSavings}%)
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadAllAsZip}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                isPremium
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isPremium}
            >
              {isPremium ? (
                <Archive className="w-4 h-4 mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Download ZIP {!isPremium && '(Premium)'}
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4">
          {processedImages.map((image) => {
            const savings = calculateSavings(image.originalSize, image.processed!.size);
            
            return (
              <div
                key={image.id}
                className="flex items-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <img
                  src={image.preview}
                  alt="Processed"
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.file.name}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-gray-600">
                    <span>{formatFileSize(image.originalSize)}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-green-600">
                      {formatFileSize(image.processed!.size)}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      -{savings}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => downloadImage(image)}
                  className="ml-4 flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};