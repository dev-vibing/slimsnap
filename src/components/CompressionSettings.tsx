import React from 'react';
import { Settings, Zap, AlertCircle } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Compression Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Quality Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Quality
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
              <Zap className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {settings.quality}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min={minQuality}
            max={maxQuality}
            value={Math.max(minQuality, Math.min(maxQuality, settings.quality))}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Lower quality ({minQuality}%)</span>
            <span>Higher quality ({maxQuality}%)</span>
          </div>
          {!isPremium && (
            <div className="flex items-center text-xs text-orange-600 mt-2">
              <AlertCircle className="w-3 h-3 mr-1" />
              Free users: {FREEMIUM_LIMITS.minQuality}%-{FREEMIUM_LIMITS.maxQuality}% only
            </div>
          )}
        </div>

        {/* Max Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Width (px)
            </label>
            <input
              type="number"
              min="1"
              max={isPremium ? 10000 : FREEMIUM_LIMITS.maxResolution}
              value={settings.maxWidth || ''}
              onChange={(e) => handleMaxWidthChange(Number(e.target.value) || 0)}
              placeholder="Original"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {!isPremium && (
              <p className="text-xs text-orange-600 mt-1">
                Max: {FREEMIUM_LIMITS.maxResolution}px (free)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Height (px)
            </label>
            <input
              type="number"
              min="1"
              max={isPremium ? 10000 : FREEMIUM_LIMITS.maxResolution}
              value={settings.maxHeight || ''}
              onChange={(e) => handleMaxHeightChange(Number(e.target.value) || 0)}
              placeholder="Original"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {!isPremium && (
              <p className="text-xs text-orange-600 mt-1">
                Max: {FREEMIUM_LIMITS.maxResolution}px (free)
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Leave dimensions empty to keep original size. 
            Lower quality reduces file size but may affect image clarity.
            {!isPremium && (
              <span className="block mt-2 text-orange-700">
                <strong>Free users:</strong> Limited to {FREEMIUM_LIMITS.maxResolution}x{FREEMIUM_LIMITS.maxResolution} resolution and {FREEMIUM_LIMITS.minQuality}-{FREEMIUM_LIMITS.maxQuality}% quality.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};