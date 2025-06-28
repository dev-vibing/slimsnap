import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is an email verification callback
        const urlParams = new URLSearchParams(window.location.search);
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type');

        if (tokenHash && type === 'email') {
          // This is an email verification callback
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email'
          });

          if (error) {
            console.error('Email verification error:', error);
            setStatus('error');
            setMessage('Email verification failed. Please try again.');
          } else {
            console.log('Email verified successfully');
            setStatus('success');
            setMessage('Email verified successfully! You can now use your account.');
            
            // Clean up URL and redirect after a delay
            setTimeout(() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.reload();
            }, 2000);
          }
        } else {
          // Not an email verification callback, just check session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setStatus('success');
            setMessage('You are signed in!');
          } else {
            setStatus('error');
            setMessage('No active session found.');
          }
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    // Only run if we're on a callback URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('token_hash') || urlParams.get('type')) {
      handleAuthCallback();
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <p className="text-gray-800 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <p className="text-gray-800 font-medium">{message}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}; 