import React from 'react';
import { FileText, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
              <FileText className="w-6 h-6 text-brand-500 mr-2" />
              <span className="font-bold text-gray-800">Terms of Service</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-large border border-gray-200 animate-slide-up">
          
          {/* Page Title */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black gradient-text mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 text-lg">
              Simple, fair terms for using SlimSnap's image optimization service.
            </p>
            <div className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-r from-brand-50 via-white to-brand-50 rounded-2xl p-6 border border-brand-200 mb-8 sm:mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-success-500 mr-2" />
              Quick Summary
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                  You Can:
                </h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Use SlimSnap free of charge</li>
                  <li>• Process unlimited images (with fair use)</li>
                  <li>• Use it for personal and commercial projects</li>
                  <li>• Upgrade to Premium for extra features</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 text-warning-500 mr-2" />
                  Please Don't:
                </h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  <li>• Abuse the service or overload our servers</li>
                  <li>• Process illegal or harmful content</li>
                  <li>• Attempt to reverse engineer the service</li>
                  <li>• Violate other users' experience</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="prose prose-gray max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-brand-500 to-brand-600 rounded-full mr-3"></span>
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using SlimSnap ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <div className="bg-brand-50 rounded-xl p-4 border border-brand-200 mt-4">
                <p className="text-brand-800 text-sm">
                  <strong>Note:</strong> These terms apply to all users, including free and premium subscribers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-success-500 to-success-600 rounded-full mr-3"></span>
                2. Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SlimSnap provides client-side image compression and optimization services. Our service:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Processes images entirely within your web browser
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Does not store, transmit, or access your image files
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Offers both free and premium tiers with different features
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Provides tools for compression, resizing, and format conversion
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></span>
                3. Acceptable Use
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use SlimSnap responsibly and in accordance with all applicable laws. You may not:
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    Prohibited Activities
                  </h3>
                  <ul className="space-y-2 text-red-700 text-sm">
                    <li>• Process illegal, harmful, or copyrighted content</li>
                    <li>• Attempt to overwhelm or abuse our servers</li>
                    <li>• Use automated scripts to bulk process images</li>
                    <li>• Interfere with other users' experience</li>
                    <li>• Reverse engineer or copy our technology</li>
                    <li>• Violate any applicable laws or regulations</li>
                  </ul>
                </div>
                
                <div className="bg-success-50 rounded-xl p-6 border border-success-200">
                  <h3 className="font-bold text-success-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                    Encouraged Use
                  </h3>
                  <ul className="space-y-2 text-success-700 text-sm">
                    <li>• Personal photo optimization</li>
                    <li>• Website and blog image compression</li>
                    <li>• Social media content preparation</li>
                    <li>• Email attachment size reduction</li>
                    <li>• Professional design workflows</li>
                    <li>• Educational and research purposes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-accent-500 to-accent-600 rounded-full mr-3"></span>
                4. Free Service & Premium Features
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SlimSnap offers both free and premium service tiers:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Free Tier</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Available to all users with reasonable usage limits to ensure service quality.
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Session-based processing limits</li>
                    <li>• Standard compression settings</li>
                    <li>• Community support</li>
                  </ul>
                </div>
                
                <div className="bg-warning-50 rounded-xl p-4 border border-warning-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Premium Tier</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Paid subscription with enhanced features and unlimited usage.
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Unlimited image processing</li>
                    <li>• Advanced compression controls</li>
                    <li>• Ad-free experience</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-warning-500 to-warning-600 rounded-full mr-3"></span>
                5. Disclaimers & Limitations
              </h2>
              <div className="bg-warning-50 rounded-xl p-6 border border-warning-200">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="w-6 h-6 text-warning-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-warning-800 mb-2">Important Disclaimers</h3>
                    <p className="text-warning-800 text-sm leading-relaxed">
                      SlimSnap is provided "as is" without warranties of any kind. We make no guarantees about:
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-warning-700 text-sm ml-9">
                  <li>• Service availability or uptime</li>
                  <li>• Compression quality or results</li>
                  <li>• Compatibility with all devices or browsers</li>
                  <li>• Data loss or corruption (though we process locally)</li>
                  <li>• Fitness for specific purposes</li>
                </ul>
                
                <p className="text-warning-800 text-sm mt-4 font-semibold">
                  Always keep backups of your original images. We are not liable for any damages, losses, 
                  or issues arising from your use of SlimSnap.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></span>
                6. Account & Subscription Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you create an account or subscribe to premium features:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Account Security:</strong>
                    <span className="text-gray-600 ml-2">You're responsible for keeping your account secure</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Subscription Billing:</strong>
                    <span className="text-gray-600 ml-2">Premium subscriptions are billed monthly or annually</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Cancellation:</strong>
                    <span className="text-gray-600 ml-2">You may cancel your subscription at any time</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-800">Refunds:</strong>
                    <span className="text-gray-600 ml-2">Refunds available within 30 days of purchase</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></span>
                7. Service Modifications & Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to:
              </p>
              
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Modify, suspend, or discontinue SlimSnap at any time
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Update these terms with reasonable notice
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Terminate accounts that violate these terms
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Implement usage limits to maintain service quality
                </li>
              </ul>
              
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 mt-4">
                <p className="text-red-800 text-sm">
                  <strong>Note:</strong> We'll provide reasonable notice for major changes and will work to 
                  minimize disruption to our users.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-success-500 to-success-600 rounded-full mr-3"></span>
                8. Contact & Support
              </h2>
              <div className="bg-success-50 rounded-xl p-6 border border-success-200">
                <p className="text-success-800 leading-relaxed mb-4">
                  Questions about these terms or need support? We're here to help:
                </p>
                <div className="space-y-2 text-success-700">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                    <span className="font-semibold">General Support:</span>
                    <span className="ml-2">support@slimsnap.app</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                    <span className="font-semibold">Legal Questions:</span>
                    <span className="ml-2">legal@slimsnap.app</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
                    <span className="font-semibold">Business Inquiries:</span>
                    <span className="ml-2">business@slimsnap.app</span>
                  </div>
                </div>
                <p className="text-success-800 text-sm mt-4">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                These terms may be updated from time to time. Continued use of SlimSnap constitutes acceptance of any changes.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                SlimSnap - Simple, Fair, Transparent
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 