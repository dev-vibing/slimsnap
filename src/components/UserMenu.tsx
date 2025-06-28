import React, { useState } from 'react';
import { User, Crown, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isPremium, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      console.log('UserMenu: Sign out button clicked');
      setIsOpen(false); // Close dropdown immediately
      
      const { error } = await signOut();
      
      // Only show error if there's actually a real error (not session missing)
      if (error && error.message && 
          !error.message.includes('Auth session missing') &&
          !error.message.includes('session_not_found')) {
        console.error('UserMenu: Sign out failed:', error);
        alert('Sign out failed. Please try again.');
      } else {
        console.log('UserMenu: Sign out successful');
        // The auth context will automatically update the UI
      }
    } catch (error: any) {
      // Don't show error for session missing cases
      if (error?.message?.includes('Auth session missing') || 
          error?.message?.includes('session_not_found')) {
        console.log('UserMenu: Session already cleared');
      } else {
        console.error('UserMenu: Sign out exception:', error);
        alert('Sign out failed. Please try again.');
      }
    }
  };

  // Get email from user object as fallback if profile email is empty
  const displayEmail = user.email || profile?.email || 'No email';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {displayEmail}
          </p>
          <div className="flex items-center">
            {isPremium && <Crown className="w-3 h-3 text-yellow-500 mr-1" />}
            <p className="text-xs text-gray-600">
              {isPremium ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayEmail}
              </p>
              <div className="flex items-center mt-1">
                {isPremium && <Crown className="w-3 h-3 text-yellow-500 mr-1" />}
                <p className="text-xs text-gray-600">
                  {isPremium ? 'Premium Account' : 'Free Account'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};