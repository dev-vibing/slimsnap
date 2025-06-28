import React, { useState } from 'react';
import { User, Crown, LogOut, ChevronDown, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserMenuProps {
  onSignInClick?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onSignInClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isPremium, signOut } = useAuth();

  // If no user, show sign-in button
  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="flex items-center px-4 py-2 btn-primary text-sm"
      >
        <LogIn className="w-4 h-4 mr-1" />
        Sign In
      </button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-neutral-100/80 transition-all duration-200 transform hover:scale-105"
      >
        <div className="relative">
          <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 gradient-warning rounded-full flex items-center justify-center shadow-md">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-neutral-800 truncate max-w-32">
            {user.email}
          </p>
          <div className="flex items-center">
            {isPremium ? (
              <>
                <Sparkles className="w-3 h-3 text-accent-500 mr-1" />
                <p className="text-xs font-medium text-accent-600">Premium</p>
              </>
            ) : (
              <p className="text-xs text-neutral-500">Free Plan</p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-64 card-glass border border-neutral-200/50 shadow-xl z-20 animate-slide-up">
            <div className="p-4 border-b border-neutral-100/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 gradient-warning rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {user.email}
                  </p>
                  {isPremium ? (
                    <div className="flex items-center mt-1">
                      <Sparkles className="w-3 h-3 text-accent-500 mr-1" />
                      <span className="text-xs font-medium text-accent-600">Premium Account</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-500">Free Account</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100/80 rounded-xl transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};