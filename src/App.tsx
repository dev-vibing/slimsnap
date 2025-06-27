import React, { useState, useCallback } from 'react';
import { Compass as Compress, Loader2, Shield, Crown, LogIn } from 'lucide-react';
import { ImageFile, CompressionSettings, FREEMIUM_LIMITS } from './types';
import { ImageUpload } from './components/ImageUpload';
import { CompressionSettingsPanel } from './components/CompressionSettings';
import { ProcessedResults } from './components/ProcessedResults';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { UserMenu } from './components/UserMenu';
import { AdPlaceholder } from './components/AdPlaceholder';
import { processImage, checkFreemiumLimits } from './utils/imageProcessor';
import { useAuth } from './hooks/useAuth';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 80,
    maxWidth: 0,
    maxHeight: 0
  });

  const { user, isPremium, loading } = useAuth();

  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up object URLs
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
        if (removed.processed) {
          URL.revokeObjectURL(removed.processed.url);
        }
      }
      return updated;
    });
  }, []);

  const handleUpgradeNeeded = useCallback((reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  }, []);

  const handleProcessImages = async () => {
    if (images.length === 0) return;
    
    // Check freemium limits
    const limitsCheck = checkFreemiumLimits(
      images.length,
      settings.quality,
      settings.maxWidth,
      settings.maxHeight,
      isPremium
    );

    if (!limitsCheck.allowed) {
      handleUpgradeNeeded(limitsCheck.reason);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const processedImages = await Promise.all(
        images.map(async (image) => {
          if (image.processed) return image; // Skip already processed
          
          const processed = await processImage(image, settings, isPremium);
          return { ...image, processed };
        })
      );
      
      setImages(processedImages);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = useCallback(() => {
    // Clean up object URLs
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.processed) {
        URL.revokeObjectURL(img.processed.url);
      }
    });
    setImages([]);
  }, [images]);

  const unprocessedCount = images.filter(img => !img.processed).length;
  const canProcess = unprocessedCount > 0 && !isProcessing;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar Ad for Large Screens */}
      <div className="hidden xl:block fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        <AdPlaceholder id="ad-sidebar" width={160} height={600} />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Compress className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  SlimSnap
                </h1>
                <p className="text-gray-600 text-sm">
                  Fast Image Compressor & Resizer
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {!isPremium && (
                    <button
                      onClick={() => handleUpgradeNeeded('Unlock all premium features with unlimited uploads, full quality control, and ad-free experience.')}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Go Premium
                    </button>
                  )}
                  <UserMenu />
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <ImageUpload
              images={images}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
              onUpgradeNeeded={handleUpgradeNeeded}
            />
          </section>

          {/* Ad Rectangle */}
          {!isPremium && (
            <div className="flex justify-center">
              <AdPlaceholder id="ad-rectangle" width={300} height={250} />
            </div>
          )}

          {/* Settings and Process Section */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CompressionSettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  onUpgradeNeeded={handleUpgradeNeeded}
                />
              </div>
              <div className="flex flex-col justify-center">
                <button
                  onClick={handleProcessImages}
                  disabled={!canProcess}
                  className={`w-full flex items-center justify-center px-6 py-4 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                    canProcess
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Compress className="w-5 h-5 mr-3" />
                      Compress & Resize ({unprocessedCount})
                    </>
                  )}
                </button>
                {unprocessedCount === 0 && images.length > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    All images processed!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results Section */}
          <ProcessedResults
            images={images}
            onClearAll={handleClearAll}
            onUpgradeNeeded={handleUpgradeNeeded}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              No images are stored. Everything runs in your browser.
            </div>
            
            {/* Footer Ad */}
            {!isPremium && (
              <div className="flex justify-center">
                <AdPlaceholder id="ad-footer" width={728} height={90} />
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />
    </div>
  );
}

export default App;