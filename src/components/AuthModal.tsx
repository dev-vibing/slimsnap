import React, { useState } from 'react';
import { X, Mail, Key, User, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

    if (view === 'sign-up') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(null);
        return;
      }
      
      // First, try to sign in with the credentials to check if user exists
      const { error: signInError } = await signInWithEmail(email, password);
      
      if (!signInError) {
        // User exists and credentials are correct - just show error, don't sign them in
        setError('An account with this email already exists. Please use the Sign In tab instead.');
        setLoading(null);
        return;
      }
      
      // If sign in failed due to invalid credentials, check if it's because of wrong password
      if (signInError.message.toLowerCase().includes('invalid login credentials') || 
          signInError.message.toLowerCase().includes('invalid email or password')) {
        // User might exist but with different password
        setError('An account with this email already exists. Please sign in instead or use a different email.');
        setLoading(null);
        return;
      }
      
      // If we get here, the user doesn't exist, so proceed with signup
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
        onClose();
      }
    }

    setLoading(null);
  };

  const handleGoogleAuth = async () => {
    setLoading('google');
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="p-8">
            <div className="flex border-b mb-6">
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

            <div className="mb-6">
              <button
                onClick={handleGoogleAuth}
                disabled={!!loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <>
                    <Chrome className="w-5 h-5 mr-3 text-red-500" />
                    Continue with Google
                  </>
                )}
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">OR</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-shake">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {successMessage}
              </div>
            )}

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
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={!!loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading === 'email' ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      view === 'sign-up' ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </div>
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
    className={`w-1/2 pb-3 text-center font-semibold transition-colors ${
      isActive ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {title}
  </button>
);

const Input: React.FC<{ id: string, type: string, placeholder: string, Icon: React.ElementType, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
  ({ id, type, placeholder, Icon, value, onChange }) => (
  <div className="relative">
    <Icon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-shadow"
      required
      minLength={type === 'password' ? 6 : undefined}
    />
  </div>
);