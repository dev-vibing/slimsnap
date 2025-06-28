import React from 'react';
import { X, Crown, Check, Zap, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onSignInNeeded?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  reason,
  onSignInNeeded
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    if (!user) {
      if (onSignInNeeded) {
        onSignInNeeded();
        onClose();
      } else {
        alert('Please sign in first to upgrade to Premium');
      }
      return;
    }

    // Lemon Squeezy hosted checkout URL with custom data
    const checkoutUrl = new URL('https://slimsnap.lemonsqueezy.com/buy/e962aeeb-a5b0-48a4-9f07-f329e23bda81');
    
    // Add custom data to pass user information
    checkoutUrl.searchParams.append('checkout[custom][user_id]', user.id);
    checkoutUrl.searchParams.append('checkout[custom][email]', user.email || '');
    
    // Add redirect URL for after successful payment
    checkoutUrl.searchParams.append('checkout[success_url]', 
      `${window.location.origin}?upgrade_success=true`
    );

    // Open checkout in same window
    window.location.href = checkoutUrl.toString();
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass max-w-lg w-full p-8 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-14 h-14 gradient-warning rounded-3xl flex items-center justify-center shadow-lg animate-glow">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-neutral-800">
                Upgrade to Premium
              </h2>
              <p className="text-accent-600 font-medium">
                Unlock unlimited possibilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <div className="p-4 bg-warning-50/50 border border-warning-200/50 rounded-2xl mb-6">
            <p className="text-warning-800 font-medium">{reason}</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-200/50 rounded-3xl">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">Premium Features</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Unlimited image uploads',
                'Full quality range (10-100%)',
                'No resolution limits',
                'ZIP batch downloads',
                'Ad-free experience',
                'Priority support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-5 h-5 gradient-success rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 gradient-warning text-white font-semibold py-3 px-6 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-200 transform flex items-center justify-center"
          >
            <Zap className="w-5 h-5 mr-2" />
            {user ? 'Upgrade Now' : 'Sign In First'}
          </button>
        </div>
      </div>
    </div>
  );
};