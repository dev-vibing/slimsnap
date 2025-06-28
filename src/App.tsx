import React, { useState, useCallback, useEffect } from 'react';
import { Compass as Compress, Loader2, Shield, Crown, LogIn, CheckCircle, X, Sparkles } from 'lucide-react';
import { ImageFile, CompressionSettings, FREEMIUM_LIMITS } from './types';
import { ImageUpload } from './components/ImageUpload';
import { CompressionSettingsPanel } from './components/CompressionSettings';
import { ProcessedResults } from './components/ProcessedResults';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { UserMenu } from './components/UserMenu';
import { AdPlaceholder } from './components/AdPlaceholder';
import { AuthCallback } from './components/AuthCallback';
import { processImage, checkFreemiumLimits } from './utils/imageProcessor';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 80,
    maxWidth: 0,
    maxHeight: 0
  });

  const { user, isPremium, loading } = useAuth();

  // Handle upgrade success callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade_success') === 'true') {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      setShowUpgradeSuccess(true);
      
      // Refresh the session to get updated profile data
      const refreshSession = async () => {
        await supabase.auth.refreshSession();
        // The useAuth hook will automatically update when the session changes
      };
      
      refreshSession();
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, []);

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
  }, []);

  const unprocessedCount = images.filter(img => !img.processed).length;
  const canProcess = unprocessedCount > 0 && !isProcessing;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center">
        <div className="glass-white rounded-3xl p-12 shadow-large animate-slide-up">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-brand-500" />
              <div className="absolute inset-0 w-16 h-16 rounded-full animate-pulse-soft bg-brand-100"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading SlimSnap</h2>
              <p className="text-gray-600">Preparing your image processing experience...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 mesh-background">
      {/* Auth Callback Handler */}
      <AuthCallback />
      
      {/* Header */}
      <header className="glass-white sticky top-0 z-20 border-b border-gray-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-3xl flex items-center justify-center mr-4 shadow-brand group-hover:scale-105 transition-transform duration-300 icon-glow">
                <Compress className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black gradient-text text-shadow">
                  SlimSnap
                </h1>
                <p className="text-gray-600 text-sm font-medium flex items-center mt-1">
                  <Sparkles className="w-4 h-4 mr-2 text-brand-500" />
                  Professional Image Optimization
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {!isPremium && (
                    <button
                      onClick={() => handleUpgradeNeeded('Unlock all premium features with unlimited uploads, full quality control, and ad-free experience.')}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-warning-400 to-warning-500 text-white rounded-2xl hover:from-warning-500 hover:to-warning-600 transition-all duration-300 transform hover:scale-105 shadow-medium font-semibold gentle-bounce"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade to Pro
                    </button>
                  )}
                  <UserMenu />
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 transform hover:scale-105 shadow-brand font-semibold gentle-bounce"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Upgrade Success Message */}
      {showUpgradeSuccess && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 animate-slide-up">
          <div className="glass-white rounded-2xl p-6 border border-success-200 shadow-medium">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-success-400 to-success-500 rounded-2xl flex items-center justify-center mr-4 shadow-medium">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  🎉 Welcome to Premium!
                </h3>
                <p className="text-gray-600">
                  Your account has been upgraded successfully. Enjoy unlimited uploads, full quality control, and an ad-free experience.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeSuccess(false)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Upload Section */}
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <ImageUpload
              images={images}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
              onUpgradeNeeded={handleUpgradeNeeded}
            />
          </section>

          {/* Settings and Process Section */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
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
                  className={`w-full flex items-center justify-center px-8 py-6 rounded-3xl text-white font-bold text-lg transition-all duration-300 transform ${
                    canProcess
                      ? 'bg-gradient-to-r from-success-500 to-brand-500 hover:from-success-600 hover:to-brand-600 hover:scale-105 shadow-large gentle-bounce'
                      : 'bg-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Processing Images...
                    </>
                  ) : (
                    <>
                      <Compress className="w-6 h-6 mr-3" />
                      Process Images ({unprocessedCount})
                    </>
                  )}
                </button>
                {unprocessedCount === 0 && images.length > 0 && (
                  <p className="text-center text-sm text-brand-600 mt-3 font-semibold">
                    ✨ All images processed!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <ProcessedResults
              images={images}
              onClearAll={handleClearAll}
              onUpgradeNeeded={handleUpgradeNeeded}
            />
          </div>

          {/* Subtle Footer Ad - Only for free users, very discreet */}
          {!isPremium && (
            <div className="flex justify-center mt-16 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 opacity-60 hover:opacity-80 transition-opacity duration-300">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Advertisement</p>
                  <AdPlaceholder id="ad-footer" width={728} height={90} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-white border-t border-gray-200 mt-16 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center text-gray-600 glass rounded-full px-6 py-3 shadow-soft">
              <Shield className="w-5 h-5 mr-3 text-success-500" />
              <span className="font-medium">🔒 Privacy First - No data stored, everything runs locally</span>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p>Built with ❤️ for modern image optimization</p>
            </div>
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
        onSignInNeeded={() => setShowAuthModal(true)}
      />
    </div>
  );
}

export default App;