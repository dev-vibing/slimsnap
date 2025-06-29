import React, { useState, useCallback, useEffect } from 'react';
import { Compass as Compress, Loader2, Shield, Crown, LogIn, CheckCircle, X, Sparkles } from 'lucide-react';
import { ImageFile, CompressionSettings, FREEMIUM_LIMITS, FREE_USAGE_LIMITS } from './types';
import { ImageUpload } from './components/ImageUpload';
import { CompressionSettingsPanel } from './components/CompressionSettings';
import { ProcessedResults } from './components/ProcessedResults';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { UserMenu } from './components/UserMenu';
import { AdPlaceholder } from './components/AdPlaceholder';
import { processImagesBatch, checkFreemiumLimits, getRecommendedSettings } from './utils/imageProcessor';
import { useAuth } from './contexts/AuthContext';
import { useUsageTracking } from './hooks/useUsageTracking';
import { supabase } from './lib/supabase';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
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
  const usageTracking = useUsageTracking(isPremium);

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

  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    // Check concurrent upload limits (to prevent browser crashes)
    const uploadCheck = usageTracking.canUploadImages(newImages.length, images.length);
    
    if (!uploadCheck.allowed) {
      handleUpgradeNeeded(uploadCheck.reason);
      return;
    }
    
    // Add images to UI state (no usage tracking for uploads)
    setImages(prev => [...prev, ...newImages]);
  }, [usageTracking, handleUpgradeNeeded, images.length]);

  const handleSmartSettings = useCallback((useCase: 'web' | 'email' | 'storage' | 'print' = 'web') => {
    if (images.length === 0) return;
    
    // Use the first image as a reference for recommendations
    const referenceFile = images[0].file;
    const recommended = getRecommendedSettings(referenceFile, useCase);
    
    setSettings(prevSettings => ({
      ...prevSettings,
      ...recommended
    }));
  }, [images]);

  const handleProcessImages = async () => {
    if (images.length === 0) return;
    
    // Count unprocessed images
    const unprocessedImages = images.filter(img => !img.processed);
    const unprocessedCount = unprocessedImages.length;
    
    if (unprocessedCount === 0) return;
    
    // Check secure processing limits
    const processingCheck = usageTracking.canProcessImages(unprocessedCount);
    if (!processingCheck.allowed) {
      handleUpgradeNeeded(processingCheck.reason);
      return;
    }
    
    // Check freemium quality/resolution limits
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
    setProcessingProgress({ current: 0, total: images.length });
    
    try {
      // Use the new batch processing function with progress tracking
      const processedImages = await processImagesBatch(
        images,
        settings,
        isPremium,
        (current, total) => {
          setProcessingProgress({ current, total });
        }
      );
      
      setImages(processedImages);
      
      // Track the successful processing in session usage
      usageTracking.trackImageProcessing(unprocessedCount);
      
    } catch (error) {
      console.error('Error processing images:', error);
      // Show error message to user
      alert('Error processing images. Please try again or check your settings.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress({ current: 0, total: 0 });
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
      {/* Header */}
      <header className="glass-white sticky top-0 z-20 border-b border-gray-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mr-3 sm:mr-4 shadow-brand group-hover:scale-105 transition-transform duration-300 icon-glow">
                <Compress className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black gradient-text text-shadow">
                  SlimSnap
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm font-medium flex items-center mt-1 hidden sm:flex">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-brand-500" />
                  Professional Image Optimization
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  {!isPremium && (
                    <button
                      onClick={() => handleUpgradeNeeded('Unlock all premium features with unlimited uploads, full quality control, and ad-free experience.')}
                      className="flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-warning-400 to-warning-500 text-white rounded-xl sm:rounded-2xl hover:from-warning-500 hover:to-warning-600 transition-all duration-300 transform hover:scale-105 shadow-medium font-semibold gentle-bounce text-sm sm:text-base"
                    >
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Upgrade to Pro</span>
                      <span className="sm:hidden">Pro</span>
                    </button>
                  )}
                  <UserMenu />
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl sm:rounded-2xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 transform hover:scale-105 shadow-brand font-semibold gentle-bounce text-sm sm:text-base"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
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
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-12">
          {/* Upload Section */}
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <ImageUpload
              images={images}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
              onUpgradeNeeded={handleUpgradeNeeded}
              usageTracking={usageTracking}
            />
          </section>

          {/* Settings and Process Section */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                {/* Compression Usage Status - Only show for free users */}
                {!isPremium && (
                  <div className="card rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white font-bold text-xs sm:text-sm">🔄</span>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-800">Compressions Used</div>
                          <div className="text-xs text-gray-600 hidden sm:block">Session limit</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-bold text-gray-800">
                          {usageTracking.usage.imagesProcessed} / {FREE_USAGE_LIMITS.maxProcessingPerSession}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium">
                          {usageTracking.getRemainingProcessing()} remaining
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Smart Settings Presets */}
                <div className="card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
                    Smart Settings
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    Choose a preset optimized for your specific use case:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleSmartSettings('web')}
                      className="px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700"
                    >
                      🌐 Web
                    </button>
                    <button
                      onClick={() => handleSmartSettings('email')}
                      className="px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700"
                    >
                      📧 Email
                    </button>
                    <button
                      onClick={() => handleSmartSettings('storage')}
                      className="px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700"
                    >
                      💾 Storage
                    </button>
                    <button
                      onClick={() => handleSmartSettings('print')}
                      className="px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>

                <CompressionSettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  onUpgradeNeeded={handleUpgradeNeeded}
                />
              </div>
              <div className="xl:mt-0 mt-6">
                <button
                  onClick={handleProcessImages}
                  disabled={!canProcess}
                  className={`w-full flex items-center justify-center px-4 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl text-white font-bold text-base sm:text-lg transition-all duration-300 transform ${
                    canProcess
                      ? 'bg-gradient-to-r from-success-500 to-brand-500 hover:from-success-600 hover:to-brand-600 hover:scale-105 shadow-large gentle-bounce'
                      : 'bg-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
                      <span className="text-sm sm:text-base">
                        {processingProgress.total > 0 
                          ? `Processing ${processingProgress.current}/${processingProgress.total}...`
                          : 'Processing Images...'
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <Compress className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">
                        Process Images ({unprocessedCount})
                      </span>
                    </>
                  )}
                </button>
                
                {/* Progress Bar */}
                {isProcessing && processingProgress.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round((processingProgress.current / processingProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-success-500 to-brand-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ 
                          width: `${(processingProgress.current / processingProgress.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {unprocessedCount === 0 && images.length > 0 && !isProcessing && (
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