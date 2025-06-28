import React from 'react';
import { Zap, Crown, Check } from 'lucide-react';
import { CompressionSettings, FREEMIUM_LIMITS } from '../types';
import { useAuth } from '../hooks/useAuth';

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

  const presets = [
    {
      id: 'small',
      name: 'Smaller Size',
      description: 'Best for sharing',
      quality: 60,
      maxWidth: 1280,
      maxHeight: 1280,
      savings: 'Up to 70% smaller',
      free: true,
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Good quality & size',
      quality: 80,
      maxWidth: 0,
      maxHeight: 0,
      savings: 'Up to 50% smaller',
      free: true,
    },
    {
      id: 'quality',
      name: 'Best Quality',
      description: 'Minimal compression',
      quality: 95,
      maxWidth: 0,
      maxHeight: 0,
      savings: 'Up to 20% smaller',
      free: false,
    },
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    if (!preset.free && !isPremium) {
      onUpgradeNeeded('Unlock premium compression settings for the best quality!');
      return;
    }

    onSettingsChange({
      quality: preset.quality,
      maxWidth: preset.maxWidth,
      maxHeight: preset.maxHeight,
    });
  };

  const getCurrentPreset = () => {
    return presets.find(preset => 
      preset.quality === settings.quality &&
      preset.maxWidth === settings.maxWidth &&
      preset.maxHeight === settings.maxHeight
    ) || presets[1]; // Default to balanced
  };

  const currentPreset = getCurrentPreset();

  return (
    <div className="space-y-6">
      {/* Preset Options */}
      <div>
        <h3 className="font-medium text-neutral-700 mb-4">Choose compression level:</h3>
        <div className="grid gap-3">
          {presets.map((preset) => {
            const isSelected = currentPreset.id === preset.id;
            const isDisabled = !preset.free && !isPremium;
            
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                disabled={isDisabled}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50'
                    : isDisabled
                    ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
                    : 'border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-neutral-800">{preset.name}</h4>
                      {!preset.free && (
                        <Crown className="w-4 h-4 ml-2 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{preset.description}</p>
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-1 text-success-500" />
                      <span className="text-sm font-medium text-success-600">{preset.savings}</span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-6 h-6 gradient-brand rounded-full flex items-center justify-center ml-3">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                {isDisabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                    <div className="text-center">
                      <Crown className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-neutral-700">Premium Only</p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-start">
          <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-neutral-800 mb-2">💡 Quick Tips</h4>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>• "Smaller Size" is perfect for social media and emails</li>
              <li>• "Balanced" works great for most websites</li>
              {isPremium ? (
                <li>• "Best Quality" preserves maximum detail for printing</li>
              ) : (
                <li>• Upgrade to Premium for the highest quality options</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};