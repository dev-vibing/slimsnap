import React from 'react';
import { Settings, Zap, AlertTriangle, Sliders, Target, Lightbulb } from 'lucide-react';
import { CompressionSettings, FREEMIUM_LIMITS } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CompressionSettingsProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  onUpgradeNeeded: (reason: string) => void;
}

export const CompressionSettingsPanel: React.FC<CompressionSettingsProps> = ({
  settings,
  onSettingsChange,
  onUpgradeNeeded
}) => {
  const { isPremium } = useAuth();

  const handleQualityChange = (quality: number) => {
    if (!isPremium) {
      if (quality < FREEMIUM_LIMITS.minQuality || quality > FREEMIUM_LIMITS.maxQuality) {
        onUpgradeNeeded(
          `Free users can only use quality between ${FREEMIUM_LIMITS.minQuality}% and ${FREEMIUM_LIMITS.maxQuality}%. Upgrade to Premium for full quality control (10-100%).`
        );
        return;
      }
    }
    onSettingsChange({ ...settings, quality });
  };

  const handleMaxWidthChange = (maxWidth: number) => {
    if (!isPremium && maxWidth > FREEMIUM_LIMITS.maxResolution) {
      onUpgradeNeeded(
        `Free users are limited to ${FREEMIUM_LIMITS.maxResolution}px maximum resolution. Upgrade to Premium for unlimited resolution.`
      );
      return;
    }
    onSettingsChange({ ...settings, maxWidth });
  };

  const handleMaxHeightChange = (maxHeight: number) => {
    if (!isPremium && maxHeight > FREEMIUM_LIMITS.maxResolution) {
      onUpgradeNeeded(
        `Free users are limited to ${FREEMIUM_LIMITS.maxResolution}px maximum resolution. Upgrade to Premium for unlimited resolution.`
      );
      return;
    }
    onSettingsChange({ ...settings, maxHeight });
  };

  const minQuality = isPremium ? 10 : FREEMIUM_LIMITS.minQuality;
  const maxQuality = isPremium ? 100 : FREEMIUM_LIMITS.maxQuality;

  return (
    <div className="holographic-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-ultra tech-grid-overlay hover-lift">
      <div className="flex items-center mb-6 sm:mb-8 group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-ultra group-hover:scale-105 transition-all duration-300 icon-glow quantum-glow energy-pulse">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 cyber-text hologram-text">Compression Settings</h2>
          <p className="text-gray-600 text-xs sm:text-sm items-center mt-1 hidden sm:flex">
            <Target className="w-4 h-4 mr-2 text-brand-500" />
            Fine-tune your image optimization
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Quality Slider */}
        <div className="neo-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-brand-100 hover-lift geometric-accent">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <label className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-warning-500" />
              Quality
            </label>
            <div className="flex items-center tech-button rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-ultra border border-brand-200 hover-glow">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-warning-500 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-lg font-bold text-gray-800">
                {settings.quality}%
              </span>
            </div>
          </div>
          
          <div className="relative mb-3 sm:mb-4">
            <input
              type="range"
              min={minQuality}
              max={maxQuality}
              value={Math.max(minQuality, Math.min(maxQuality, settings.quality))}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-3">
            <span>Lower ({minQuality}%)</span>
            <span>Higher ({maxQuality}%)</span>
          </div>
          
          {!isPremium && (
            <div className="inline-flex items-center bg-warning-50 border border-warning-200 rounded-full px-3 py-2">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-warning-600" />
              <span className="text-warning-700 text-xs sm:text-sm font-medium">
                Free users: {FREEMIUM_LIMITS.minQuality}%-{FREEMIUM_LIMITS.maxQuality}% only
              </span>
            </div>
          )}
        </div>

        {/* Max Dimensions */}
        <div className="neo-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-accent-100 hover-lift geometric-accent">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-500" />
            Resolution Limits
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Max Width (px)
              </label>
              <input
                type="number"
                min="1"
                max={isPremium ? 10000 : FREEMIUM_LIMITS.maxResolution}
                value={settings.maxWidth || ''}
                onChange={(e) => handleMaxWidthChange(Number(e.target.value) || 0)}
                placeholder="Original"
                className="input-modern w-full text-sm sm:text-base"
              />
              {!isPremium && (
                <p className="text-xs sm:text-sm text-warning-600 mt-2 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Max: {FREEMIUM_LIMITS.maxResolution}px (free)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Max Height (px)
              </label>
              <input
                type="number"
                min="1"
                max={isPremium ? 10000 : FREEMIUM_LIMITS.maxResolution}
                value={settings.maxHeight || ''}
                onChange={(e) => handleMaxHeightChange(Number(e.target.value) || 0)}
                placeholder="Original"
                className="input-modern w-full text-sm sm:text-base"
              />
              {!isPremium && (
                <p className="text-xs sm:text-sm text-warning-600 mt-2 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Max: {FREEMIUM_LIMITS.maxResolution}px (free)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="holographic-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-success-200 relative overflow-hidden hover-lift tech-grid-overlay">
          <div className="relative z-10">
            <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              <span className="text-brand-600 font-semibold flex items-center">
                <Lightbulb className="w-4 h-4 mr-1" />
                Pro Tip:
              </span> Leave dimensions empty to keep original size. 
              Lower quality reduces file size but may affect image clarity.
            </p>
            {!isPremium && (
              <div className="ultra-glass rounded-xl p-3 sm:p-4 border border-warning-200 hover-glow">
                <p className="text-warning-700 font-medium text-xs sm:text-base">
                  <span className="text-gray-800 font-semibold flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Free Limits:
                  </span> Max resolution {FREEMIUM_LIMITS.maxResolution}x{FREEMIUM_LIMITS.maxResolution}px • Quality {FREEMIUM_LIMITS.minQuality}-{FREEMIUM_LIMITS.maxQuality}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};