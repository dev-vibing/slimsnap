import React from 'react';
import { Shield, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 mesh-background">
      {/* Header */}
      <header className="glass-white sticky top-0 z-20 border-b border-gray-200 shadow-soft">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center text-brand-600 hover:text-brand-700 transition-colors duration-200 font-semibold group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to SlimSnap
            </Link>
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-success-500 mr-2" />
              <span className="font-bold text-gray-800">Privacy Policy</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-large border border-gray-200 animate-slide-up">
          
          {/* Page Title */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Your privacy is our top priority. Here's how SlimSnap protects your data.
            </p>
            <div className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Privacy Highlights */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="text-center p-4 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl border border-brand-200">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">100% Local Processing</h3>
              <p className="text-sm text-gray-600">Your images never leave your device</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-2xl border border-success-200">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">No Data Storage</h3>
              <p className="text-sm text-gray-600">We don't store or collect your files</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Minimal Cookies</h3>
              <p className="text-sm text-gray-600">Only essential cookies for functionality</p>
            </div>
          </div>

          {/* Policy Content */}
          <div className="prose prose-gray max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-brand-500 to-brand-600 rounded-full mr-3"></span>
                How SlimSnap Works
              </h2>
              <div className="bg-brand-50 rounded-xl p-6 border border-brand-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>SlimSnap operates entirely within your web browser.</strong> When you select images for compression, 
                  they are processed using advanced client-side technologies including Web Workers and Canvas API. 
                  This means:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    Your images are never uploaded to our servers
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    All processing happens locally on your device
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                    No third parties have access to your files
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-success-500 to-success-600 rounded-full mr-3"></span>
                Data Collection & Storage
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SlimSnap is designed with privacy at its core. Here's what we do and don't collect:
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                                     <h3 className="font-bold text-red-800 mb-3 flex items-center">
                     <X className="w-5 h-5 text-red-500 mr-2" />
                     We DO NOT Collect:
                   </h3>
                  <ul className="space-y-2 text-red-700 text-sm">
                    <li>• Your uploaded images or files</li>
                    <li>• Personal information or metadata</li>
                    <li>• Usage analytics or tracking data</li>
                    <li>• Browsing history or behavior</li>
                    <li>• IP addresses or location data</li>
                  </ul>
                </div>
                
                <div className="bg-success-50 rounded-xl p-6 border border-success-200">
                                     <h3 className="font-bold text-success-800 mb-3 flex items-center">
                     <CheckCircle className="w-5 h-5 text-success-500 mr-2" />
                     We MAY Collect (Optional):
                   </h3>
                  <ul className="space-y-2 text-success-700 text-sm">
                    <li>• Account information (if you sign up)</li>
                    <li>• Premium subscription status</li>
                    <li>• Basic error logs for debugging</li>
                    <li>• Anonymous usage statistics (if consented)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></span>
                Cookies & Local Storage
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SlimSnap uses minimal cookies and local storage to provide core functionality:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Essential Cookies</h4>
                  <p className="text-gray-600 text-sm">Required for authentication and app functionality. Cannot be disabled.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Local Storage</h4>
                  <p className="text-gray-600 text-sm">Stores your compression settings and preferences locally in your browser.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Advertisement Cookies (If Applicable)</h4>
                  <p className="text-gray-600 text-sm">Only used if you're on the free tier and ads are displayed. You can upgrade to Premium to remove all ads.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-accent-500 to-accent-600 rounded-full mr-3"></span>
                Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SlimSnap may integrate with the following third-party services:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Supabase:</strong>
                    <span className="text-gray-600 ml-2">For user authentication and premium account management</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Payment Processor:</strong>
                    <span className="text-gray-600 ml-2">For secure premium subscription payments (data handled by payment provider)</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Content Delivery Network:</strong>
                    <span className="text-gray-600 ml-2">For faster app loading (no personal data transmitted)</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-warning-500 to-warning-600 rounded-full mr-3"></span>
                Your Rights & Contact
              </h2>
              <div className="bg-warning-50 rounded-xl p-6 border border-warning-200">
                <p className="text-warning-800 leading-relaxed mb-4">
                  Since we don't collect or store your personal data or images, there's minimal data to manage. 
                  However, if you have an account with us, you have the right to:
                </p>
                <ul className="space-y-2 text-warning-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-warning-600 mr-2 mt-0.5 flex-shrink-0" />
                    Access your account information
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-warning-600 mr-2 mt-0.5 flex-shrink-0" />
                    Delete your account and associated data
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-warning-600 mr-2 mt-0.5 flex-shrink-0" />
                    Request information about data processing
                  </li>
                </ul>
                <p className="text-warning-800 mt-4">
                  For any privacy-related questions or requests, please contact us at{' '}
                  <strong className="font-semibold">privacy@slimsnap.app</strong>
                </p>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                This privacy policy may be updated from time to time. We'll notify users of any significant changes.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                SlimSnap - Privacy-First Image Optimization
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 