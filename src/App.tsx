import React, { useState, useCallback, useEffect } from 'react';
import { Compass as Compress, Loader2, Shield, Crown, LogIn, CheckCircle, X, Sparkles, RefreshCw, Globe, Mail, HardDrive, Printer, Lightbulb, BarChart3, Target, Ruler, Package, Heart, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 mesh-background neural-pattern relative overflow-hidden">
      {/* Header */}
      <header className="ultra-glass sticky top-0 z-20 border-b border-gray-200 shadow-ultra data-stream tech-grid-overlay">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mr-3 sm:mr-4 shadow-ultra group-hover:scale-105 transition-transform duration-300 icon-glow quantum-glow energy-pulse">
                <Compress className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black hologram-text cyber-text">
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
                      className="flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-warning-400 to-warning-500 text-white rounded-xl sm:rounded-2xl hover:from-warning-500 hover:to-warning-600 transition-all duration-300 transform hover:scale-105 shadow-ultra font-semibold gentle-bounce text-sm sm:text-base geometric-accent hover-glow click-ripple"
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
                  className="flex items-center px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl sm:rounded-2xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 transform hover:scale-105 shadow-ultra font-semibold gentle-bounce text-sm sm:text-base geometric-accent hover-glow click-ripple"
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
          <div className="holographic-card rounded-2xl p-6 border border-success-200 shadow-ultra hover-lift geometric-accent">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-success-400 to-success-500 rounded-2xl flex items-center justify-center mr-4 shadow-medium">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-warning-500" />
                  Welcome to Premium!
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
                  <div className="holographic-card rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 hover-lift tech-grid-overlay">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
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
                <div className="holographic-card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 hover-lift tech-grid-overlay">
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
                      className="px-3 sm:px-4 py-2 tech-button rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 click-ripple"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Web
                    </button>
                    <button
                      onClick={() => handleSmartSettings('email')}
                      className="px-3 sm:px-4 py-2 tech-button rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 click-ripple"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </button>
                    <button
                      onClick={() => handleSmartSettings('storage')}
                      className="px-3 sm:px-4 py-2 tech-button rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 click-ripple"
                    >
                      <HardDrive className="w-4 h-4 mr-1" />
                      Storage
                    </button>
                    <button
                      onClick={() => handleSmartSettings('print')}
                      className="px-3 sm:px-4 py-2 tech-button rounded-lg sm:rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 click-ripple"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Print
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
                      ? 'bg-gradient-to-r from-success-500 to-brand-500 hover:from-success-600 hover:to-brand-600 hover:scale-105 shadow-ultra gentle-bounce geometric-accent hover-glow click-ripple cyber-text'
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
                    <Sparkles className="w-4 h-4 mr-1 inline" />
                    All images processed!
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


        </div>
      </main>

      {/* How To Use SlimSnap Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="space-y-6 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black hologram-text cyber-text mb-4 sm:mb-6">
              How to Use SlimSnap
            </h2>
            <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
              Compress your images in just 3 simple steps. No downloads, no sign-ups required – 
              just drag, drop, and download your optimized images.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <div className="relative">
              <div className="holographic-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-ultra border border-gray-200 hover:shadow-large transition-all duration-300 h-full hover-lift geometric-accent">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mr-4 shadow-ultra quantum-glow energy-pulse">
                    <span className="text-white font-black text-lg sm:text-2xl">1</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Upload Images</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Click the upload area or drag and drop your images. Supports JPEG, PNG, WebP, and more.
                  </p>
                  
                  <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl p-4 border border-brand-200">
                    <div className="flex items-center mb-2">
                                             <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center mr-2">
                         <Lightbulb className="w-3 h-3 text-white" />
                       </div>
                      <span className="font-semibold text-brand-800 text-sm">Pro Tip</span>
                    </div>
                    <p className="text-brand-700 text-sm">
                      Select multiple images at once to batch process them efficiently.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-brand-300 to-transparent transform -translate-y-1/2"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="holographic-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-ultra border border-gray-200 hover:shadow-large transition-all duration-300 h-full hover-lift geometric-accent">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mr-4 shadow-ultra quantum-glow energy-pulse">
                    <span className="text-white font-black text-lg sm:text-2xl">2</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Choose Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Adjust compression quality, resize dimensions, or use smart presets for web, email, or print.
                  </p>
                  
                  <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-4 border border-success-200">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center mr-2">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-semibold text-success-800 text-sm">Smart Presets</span>
                    </div>
                    <p className="text-success-700 text-sm">
                      Try our Web, Email, Storage, or Print presets for optimal results.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-success-300 to-transparent transform -translate-y-1/2"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="holographic-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-ultra border border-gray-200 hover:shadow-large transition-all duration-300 h-full hover-lift geometric-accent">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-ultra quantum-glow energy-pulse">
                    <span className="text-white font-black text-lg sm:text-2xl">3</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Download Results</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Click "Process Images" and download your optimized files individually or as a ZIP archive.
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-semibold text-purple-800 text-sm">Instant Results</span>
                    </div>
                    <p className="text-purple-700 text-sm">
                      See compression stats and file size savings before downloading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="holographic-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-ultra border border-gray-200 hover-lift tech-grid-overlay">
            <div className="text-center mb-6">
                             <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 flex items-center justify-center">
                 <Sparkles className="w-5 h-5 mr-2" />
                 Advanced Features
               </h3>
              <p className="text-gray-600">
                Unlock even more power with these additional capabilities
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                 <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                   <BarChart3 className="w-5 h-5 text-white" />
                 </div>
                <h4 className="font-semibold text-gray-800 mb-1">Batch Processing</h4>
                <p className="text-gray-600 text-xs">Process multiple images at once</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                 <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                   <Target className="w-5 h-5 text-white" />
                 </div>
                <h4 className="font-semibold text-gray-800 mb-1">Quality Control</h4>
                <p className="text-gray-600 text-xs">Fine-tune compression levels</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                 <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                   <Ruler className="w-5 h-5 text-white" />
                 </div>
                <h4 className="font-semibold text-gray-800 mb-1">Smart Resize</h4>
                <p className="text-gray-600 text-xs">Automatically resize for different uses</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                   <Package className="w-5 h-5 text-white" />
                 </div>
                <h4 className="font-semibold text-gray-800 mb-1">ZIP Download</h4>
                <p className="text-gray-600 text-xs">Download all images in one archive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use SlimSnap Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <div className="space-y-6 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black hologram-text cyber-text mb-4 sm:mb-6">
              Why Choose SlimSnap?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
              Experience the future of image optimization with our privacy-first, 
              client-side processing technology that never compromises your data security.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="holographic-card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-brand-50 via-white to-brand-50 border border-brand-200 shadow-ultra hover:shadow-medium transition-all duration-300 transform hover:scale-105 hover-lift geometric-accent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-ultra quantum-glow energy-pulse">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">100% Private</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Your images never leave your device. Everything processes locally in your browser.
              </p>
            </div>

            <div className="holographic-card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-success-50 via-white to-success-50 border border-success-200 shadow-ultra hover:shadow-medium transition-all duration-300 transform hover:scale-105 hover-lift geometric-accent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mb-4 shadow-ultra quantum-glow energy-pulse">
                <Compress className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Advanced compression algorithms deliver professional results in seconds.
              </p>
            </div>

            <div className="holographic-card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-purple-50 via-white to-purple-50 border border-purple-200 shadow-ultra hover:shadow-medium transition-all duration-300 transform hover:scale-105 hover-lift geometric-accent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-ultra quantum-glow energy-pulse">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Zero Tracking</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                No analytics, cookies, or data collection. Your privacy is guaranteed.
              </p>
            </div>

            <div className="holographic-card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-accent-50 via-white to-accent-50 border border-accent-200 shadow-ultra hover:shadow-medium transition-all duration-300 transform hover:scale-105 hover-lift geometric-accent">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mb-4 shadow-ultra quantum-glow energy-pulse">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Pro Quality</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Maintain visual quality while achieving optimal file size reduction.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="holographic-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-ultra border border-gray-200 tech-grid-overlay hover-lift">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 hologram-text cyber-text">
                Frequently Asked Questions
              </h3>
              <p className="text-gray-600">
                Everything you need to know about SlimSnap's image optimization
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              <details className="group ultra-glass rounded-xl sm:rounded-2xl border border-gray-200 shadow-ultra overflow-hidden hover-lift">
                <summary className="cursor-pointer p-4 sm:p-6 hover:bg-brand-50 transition-all duration-300 font-semibold text-gray-800 flex items-center justify-between">
                  <span className="text-sm sm:text-base flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    How does client-side processing work?
                  </span>
                  <span className="text-brand-500 group-open:rotate-180 transition-transform duration-300 text-lg">▼</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100">
                  SlimSnap uses cutting-edge web technologies to process images directly in your browser. 
                  This means your files never travel over the internet – everything happens locally 
                  on your device, ensuring complete privacy and lightning-fast processing.
                </div>
              </details>
              
              <details className="group ultra-glass rounded-xl sm:rounded-2xl border border-gray-200 shadow-ultra overflow-hidden hover-lift">
                <summary className="cursor-pointer p-4 sm:p-6 hover:bg-brand-50 transition-all duration-300 font-semibold text-gray-800 flex items-center justify-between">
                  <span className="text-sm sm:text-base">📁 What image formats are supported?</span>
                  <span className="text-brand-500 group-open:rotate-180 transition-transform duration-300 text-lg">▼</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100">
                  SlimSnap supports all popular image formats including JPEG, PNG, WebP, GIF, and more. 
                  You can upload multiple images simultaneously and process them with smart, 
                  customizable compression settings optimized for web, email, storage, or print.
                </div>
              </details>
              
              <details className="group ultra-glass rounded-xl sm:rounded-2xl border border-gray-200 shadow-ultra overflow-hidden hover-lift">
                <summary className="cursor-pointer p-4 sm:p-6 hover:bg-brand-50 transition-all duration-300 font-semibold text-gray-800 flex items-center justify-between">
                  <span className="text-sm sm:text-base flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Are there any usage limits?
                  </span>
                  <span className="text-brand-500 group-open:rotate-180 transition-transform duration-300 text-lg">▼</span>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100">
                  Free users can process multiple images per session with reasonable limits to ensure 
                  optimal browser performance. Premium users enjoy unlimited uploads, full quality control, 
                  advanced batch processing, and priority support for professional workflows.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ultra-glass border-t border-gray-200 mt-16 shadow-ultra tech-grid-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center text-gray-600 neo-glass rounded-full px-6 py-3 shadow-ultra hover-glow">
              <Shield className="w-5 h-5 mr-3 text-success-500" />
              <span className="font-medium">Privacy First - No data stored, everything runs locally</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <a 
                href="/privacy" 
                className="text-gray-500 hover:text-brand-600 transition-colors duration-200 font-medium"
              >
                Privacy Policy
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="/terms" 
                className="text-gray-500 hover:text-brand-600 transition-colors duration-200 font-medium"
              >
                Terms of Service
              </a>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p className="flex items-center justify-center">
                Built with <Heart className="w-4 h-4 mx-1 text-red-500" /> for modern image optimization
              </p>
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