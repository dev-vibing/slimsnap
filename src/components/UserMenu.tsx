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
        className="flex items-center space-x-3 px-4 py-3 glass rounded-2xl hover:shadow-brand transition-all duration-300 transform hover:scale-105 group border border-gray-200"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center shadow-brand group-hover:shadow-brand icon-glow">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
            {displayEmail}
          </p>
          <div className="flex items-center">
            {isPremium && <Crown className="w-3 h-3 text-warning-500 mr-1" />}
            <p className="text-xs text-gray-600 font-medium">
              {isPremium ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-72 card rounded-2xl border border-gray-200 z-20 overflow-hidden animate-slide-up shadow-large">
            <div className="p-6 bg-gradient-to-r from-brand-50 to-accent-50 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center shadow-brand icon-glow">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {displayEmail}
                  </p>
                  <div className="flex items-center mt-2">
                    {isPremium ? (
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 text-warning-500 mr-2" />
                        <span className="badge-success">Premium Account</span>
                      </div>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full border border-gray-300">
                        Free Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-6 py-4 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group font-medium"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mr-4 group-hover:shadow-medium transition-all duration-300">
                <LogOut className="w-4 h-4 text-white" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};