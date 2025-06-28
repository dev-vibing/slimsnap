import React, { useState, useEffect } from 'react';
import { X, Mail, Key, User, Loader2, Chrome, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'sign-in' | 'sign-up';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState<null | 'email' | 'google'>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn('Auth timeout reached, clearing loading state');
        setLoading(null);
        setError('Request timed out. Please try again.');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  if (!isOpen) return null;
  
  const resetState = () => {
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLoading(null);
    setSuccessMessage('');
  };

  const handleSwitchView = (newView: AuthView) => {
    resetState();
    setView(newView);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    setError('');
    setSuccessMessage('');

    try {
      if (view === 'sign-up') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(null);
          return;
        }
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage('Success! Please check your email for a confirmation link.');
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          // Clear loading state before closing
          setLoading(null);
          resetState();
          onClose();
          return; // Exit early to avoid setting loading to null again
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }

    setLoading(null);
  };

  const handleGoogleAuth = async () => {
    setLoading('google');
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setLoading(null);
      } else {
        // Google OAuth redirects, so we don't need to close manually
        // The page will redirect and the modal will unmount
        console.log('Google auth initiated successfully');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="card-glass max-w-md w-full transform transition-all duration-300 scale-100 shadow-2xl">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-brand rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                Welcome to SlimSnap
              </h2>
              <p className="text-neutral-600">
                {view === 'sign-in' ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex border border-neutral-200 rounded-2xl p-1 mb-8">
              <TabButton
                title="Sign In"
                isActive={view === 'sign-in'}
                onClick={() => handleSwitchView('sign-in')}
              />
              <TabButton
                title="Sign Up"
                isActive={view === 'sign-up'}
                onClick={() => handleSwitchView('sign-up')}
              />
            </div>

            {/* Google Auth */}
            <div className="mb-6">
              <button
                onClick={handleGoogleAuth}
                disabled={!!loading}
                className="w-full flex items-center justify-center px-6 py-4 border border-neutral-200 rounded-2xl hover:bg-neutral-50 transition-all duration-200 disabled:opacity-50 font-medium text-neutral-700 hover:scale-105 transform"
              >
                {loading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Chrome className="w-5 h-5 mr-3 text-red-500" />
                    Continue with Google
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500 font-medium">OR</span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm animate-slide-up">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-2xl text-success-700 text-sm animate-slide-up">
                {successMessage}
              </div>
            )}

            {/* Email Form */}
            {!successMessage && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  Icon={Mail}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  Icon={Key}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                {view === 'sign-up' && (
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    Icon={Key}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                )}
                <button
                  type="submit"
                  disabled={!!loading}
                  className="w-full btn-primary flex items-center justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading === 'email' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      {view === 'sign-up' ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-center font-semibold transition-all duration-200 rounded-xl ${
      isActive 
        ? 'text-white gradient-brand shadow-md' 
        : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
    }`}
  >
    {title}
  </button>
);

const Input: React.FC<{ 
  id: string; 
  type: string; 
  placeholder: string; 
  Icon: React.ElementType; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}> = ({ id, type, placeholder, Icon, value, onChange }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
      <Icon className="w-5 h-5" />
    </div>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 placeholder-neutral-400"
      required
    />
  </div>
);