import React from 'react';
import { X, Crown, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onSignInNeeded: () => void;
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
      onClose();
      onSignInNeeded();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Upgrade to Premium
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{reason}</p>
          
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Premium Features:</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                Unlimited image uploads
              </li>
              <li className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                Full quality range (10-100%)
              </li>
              <li className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                No resolution limits
              </li>
              <li className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                ZIP batch downloads
              </li>
              <li className="flex items-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                Ad-free experience
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
          >
            {user ? 'Upgrade Now' : 'Sign In First'}
          </button>
        </div>
      </div>
    </div>
  );
};