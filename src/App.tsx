import React, { useState, useCallback, useEffect } from 'react';
import { Zap, Loader2, Crown, LogIn, CheckCircle, X, Sparkles, ArrowRight, Upload, Download } from 'lucide-react';
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
import { supabase } from './lib/supabase';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadCount, setUploadCount] = useState(0); // Track actual uploads per session
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 80,
    maxWidth: 0,
    maxHeight: 0
  });

  const { user, isPremium, loading } = useAuth();

  // Initialize upload count from session storage and reset on user change
  useEffect(() => {
    const sessionKey = user ? `uploadCount_${user.id}` : 'uploadCount_anonymous';
    const stored = sessionStorage.getItem(sessionKey);
    setUploadCount(stored ? parseInt(stored, 10) : 0);
  }, [user]);

  // Handle upgrade success callback and session restoration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade_success') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setShowUpgradeSuccess(true);
      
      const refreshSession = async () => {
        await supabase.auth.refreshSession();
        
        // If session refresh doesn't restore user and we have backup, try to restore
        setTimeout(() => {
          if (!user) {
            restoreSessionFromBackup();
          }
        }, 1000);
      };
      
      refreshSession();
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, [user]);

  // Session backup restoration utility
  const restoreSessionFromBackup = useCallback(async () => {
    try {
      const backupData = localStorage.getItem('slimsnap_session_backup');
      if (backupData) {
        const sessionData = JSON.parse(backupData);
        const timeDiff = Date.now() - sessionData.timestamp;
        
        // Only restore if backup is less than 1 hour old
        if (timeDiff < 3600000) {
          console.log('Attempting to restore session from backup');
          // Force a session refresh
          await supabase.auth.refreshSession();
          
          // Clean up backup after attempting restore
          localStorage.removeItem('slimsnap_session_backup');
        } else {
          // Remove stale backup
          localStorage.removeItem('slimsnap_session_backup');
        }
      }
    } catch (error) {
      console.error('Error restoring session from backup:', error);
      localStorage.removeItem('slimsnap_session_backup');
    }
  }, []);

  // Check for session backup on mount
  useEffect(() => {
    if (!user && !loading) {
      restoreSessionFromBackup();
    }
  }, [user, loading, restoreSessionFromBackup]);

  const updateUploadCount = useCallback((newCount: number) => {
    setUploadCount(newCount);
    const sessionKey = user ? `uploadCount_${user.id}` : 'uploadCount_anonymous';
    sessionStorage.setItem(sessionKey, newCount.toString());
  }, [user]);

  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    // Allow users to add images for preview, but check processing limit later
    // Just add images to the current session for preview
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
        if (removed.processed) {
          URL.revokeObjectURL(removed.processed.url);
        }
      }
      return updated;
    });
    // NOTE: We deliberately do NOT decrease uploadCount here to prevent the exploit
  }, []);

  const handleUpgradeNeeded = useCallback((reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  }, []);

  const handleDirectUpgrade = useCallback(() => {
    if (!user) {
      // If not signed in, show the modal first
      setUpgradeReason('Get unlimited compressions and better quality!');
      setShowUpgradeModal(true);
      return;
    }

    // Store user session info in localStorage before redirect to preserve it
    const sessionData = {
      userId: user.id,
      email: user.email,
      timestamp: Date.now()
    };
    localStorage.setItem('slimsnap_session_backup', JSON.stringify(sessionData));

    // Lemon Squeezy hosted checkout URL with custom data
    const checkoutUrl = new URL('https://slimsnap.lemonsqueezy.com/buy/e962aeeb-a5b0-48a4-9f07-f329e23bda81');
    
    // Add custom data to pass user information
    checkoutUrl.searchParams.append('checkout[custom][user_id]', user.id);
    checkoutUrl.searchParams.append('checkout[custom][email]', user.email || '');
    
    // Add redirect URL for after successful payment
    checkoutUrl.searchParams.append('checkout[success_url]', 
      `${window.location.origin}?upgrade_success=true&preserve_session=true`
    );

    // Use window.open with specific features to maintain session better
    const paymentWindow = window.open(
      checkoutUrl.toString(),
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // If popup is blocked, fallback to same window redirect
    if (!paymentWindow) {
      console.log('Popup blocked, redirecting in same window');
      window.location.href = checkoutUrl.toString();
    } else {
      // Monitor the payment window
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          // Refresh session when payment window closes
          console.log('Payment window closed, refreshing session');
          supabase.auth.refreshSession();
        }
      }, 1000);
    }
  }, [user]);

  const handleProcessImages = async () => {
    if (images.length === 0) return;
    
    // Count how many new images will be processed (not already processed)
    const unprocessedImages = images.filter(img => !img.processed);
    const newProcessCount = unprocessedImages.length;
    
    // Check if processing these images would exceed the upload limit
    const newUploadCount = uploadCount + newProcessCount;
    if (!isPremium && newUploadCount > FREEMIUM_LIMITS.maxImages) {
      setUpgradeReason(
        `Processing ${newProcessCount} more image${newProcessCount > 1 ? 's' : ''} would exceed your limit of ${FREEMIUM_LIMITS.maxImages} compressions. Upgrade to Premium for unlimited access!`
      );
      setShowUpgradeModal(true);
      return;
    }

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
          if (image.processed) return image;
          const processed = await processImage(image, settings, isPremium);
          return { ...image, processed };
        })
      );
      
      // Only update the upload count after successful processing
      if (newProcessCount > 0) {
        updateUploadCount(newUploadCount);
      }
      
      setImages(processedImages);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = useCallback(() => {
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.processed) {
        URL.revokeObjectURL(img.processed.url);
      }
    });
    setImages([]);
    // NOTE: We deliberately do NOT reset uploadCount here to prevent the exploit
  }, [images]);

  const handleResetSession = useCallback(() => {
    // Only allow session reset for premium users or in development
    if (isPremium || process.env.NODE_ENV === 'development') {
      updateUploadCount(0);
      handleClearAll();
    }
  }, [isPremium, updateUploadCount, handleClearAll]);

  const unprocessedCount = images.filter(img => !img.processed).length;
  const processedCount = images.filter(img => img.processed).length;
  const canProcess = unprocessedCount > 0 && !isProcessing;
  
  // Calculate remaining compressions based on session upload count
  const remainingCompressions = isPremium ? Infinity : Math.max(0, FREEMIUM_LIMITS.maxImages - uploadCount);

  // Show loading screen only for the first few seconds, then show the app interface
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50">
        {/* Header - always show for better UX */}
        <header className="glass border-b border-white/20 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center mr-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-800">SlimSnap</h1>
                  <p className="text-sm text-neutral-500">Make images smaller</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Always show Sign In button during loading */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDirectUpgrade}
                    className="hidden sm:flex items-center px-3 py-2 gradient-warning text-white rounded-xl font-medium text-sm hover:scale-105 transition-transform"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Premium
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center px-4 py-2 btn-primary text-sm"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading content */}
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 gradient-brand rounded-3xl animate-pulse flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className="text-lg font-medium text-neutral-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center mr-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-800">SlimSnap</h1>
                <p className="text-sm text-neutral-500">Make images smaller</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {(!user || !isPremium) && (
                <button
                  onClick={handleDirectUpgrade}
                  className="hidden sm:flex items-center px-4 py-2 gradient-warning text-white rounded-xl font-medium text-sm hover:scale-105 transition-transform"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Premium
                </button>
              )}
              <UserMenu onSignInClick={() => setShowAuthModal(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Compression Limit Warning */}
      {!isPremium && remainingCompressions <= 1 && (
        <div className="mx-4 mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="card p-4 border border-warning-200 bg-warning-50">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-warning-600 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-warning-800">
                    {remainingCompressions === 0 
                      ? 'Compression limit reached!'
                      : 'Last free compression remaining!'
                    }
                  </p>
                  <p className="text-sm text-warning-700">
                    Upgrade to Premium for unlimited compressions and better quality options.
                  </p>
                </div>
                <button
                  onClick={handleDirectUpgrade}
                  className="px-4 py-2 gradient-warning text-white rounded-xl font-medium text-sm hover:scale-105 transition-transform"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showUpgradeSuccess && (
        <div className="mx-4 mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="card p-4 border border-success-200 bg-success-50">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-success-800">Welcome to Premium! 🎉</p>
                  <p className="text-sm text-success-700">You now have unlimited access!</p>
                </div>
                <button
                  onClick={() => setShowUpgradeSuccess(false)}
                  className="p-1 text-success-600 hover:bg-success-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Step 1: Upload */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Choose Your Images</h2>
            </div>
            
            {/* Compression Counter */}
            {!isPremium && (
              <div className="text-sm text-neutral-600">
                <span className="font-medium">{remainingCompressions}</span> compressions left
              </div>
            )}
          </div>
          
          <ImageUpload
            images={images}
            onImagesAdd={handleImagesAdd}
            onImageRemove={handleImageRemove}
            onUpgradeNeeded={handleUpgradeNeeded}
            uploadCount={uploadCount}
            remainingUploads={remainingCompressions}
          />
        </section>

        {/* Step 2: Settings (Collapsible) */}
        {images.length > 0 && (
          <section className="card p-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-neutral-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h2 className="text-lg font-semibold text-neutral-800">Quality Settings</h2>
                <span className="ml-2 text-sm text-neutral-500">(Optional)</span>
              </div>
              <div className={`transform transition-transform ${showSettings ? 'rotate-90' : ''}`}>
                <ArrowRight className="w-5 h-5 text-neutral-400" />
              </div>
            </button>
            
            {showSettings && (
              <div className="animate-slide-up">
                <CompressionSettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  onUpgradeNeeded={handleUpgradeNeeded}
                />
              </div>
            )}
          </section>
        )}

        {/* Step 3: Process Button */}
        {images.length > 0 && (
          <section className="card p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 gradient-success rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Make Them Smaller</h2>
            </div>
            
            <button
              onClick={handleProcessImages}
              disabled={!canProcess}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                canProcess
                  ? 'gradient-brand text-white hover:shadow-lg hover:scale-105'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  Making smaller...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="w-6 h-6 mr-3" />
                  {unprocessedCount > 0 
                    ? `Compress ${unprocessedCount} image${unprocessedCount !== 1 ? 's' : ''}`
                    : 'Add images to compress'
                  }
                </div>
              )}
            </button>
          </section>
        )}

        {/* Step 4: Download Results */}
        {processedCount > 0 && (
          <section className="card p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 gradient-success rounded-xl flex items-center justify-center mr-3">
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Download Your Images</h2>
              <button
                onClick={handleClearAll}
                className="ml-auto text-sm text-neutral-500 hover:text-neutral-700"
              >
                Clear all
              </button>
            </div>
            
            <ProcessedResults
              images={images}
              onClearAll={handleClearAll}
              onUpgradeNeeded={handleUpgradeNeeded}
            />
          </section>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 gradient-brand rounded-3xl mx-auto mb-6 flex items-center justify-center animate-float">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Ready to compress images?</h2>
            <p className="text-neutral-600 text-lg mb-6">Upload your photos and make them smaller in seconds</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-neutral-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                Reduce file size
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                Keep quality
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                Super fast
              </div>
            </div>
            

          </div>
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)} 
        />
      )}
      
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeReason}
          onSignInNeeded={() => setShowAuthModal(true)}
        />
      )}
    </div>
  );
}

export default App;