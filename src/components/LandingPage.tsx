import { Download, Link as LinkIcon, Shield, Zap, Check, X, Crown, Sparkles } from 'lucide-react';
import { Converter } from './Converter';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Convertisseur Gratuit
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Téléchargez vos vidéos YouTube, Instagram, TikTok en MP3 ou MP4 HD
            </p>
          </div>
          <Converter />
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for artists, creators, and music professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <LinkIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Link Pages</h3>
              <p className="text-gray-600 leading-relaxed">
                Create beautiful landing pages with all your streaming links, social media, and downloadable content in one place.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Downloads</h3>
              <p className="text-gray-600 leading-relaxed">
                Share audio files with download tracking, quota management, and automatic watermarking for free users.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Sign in with Google or email magic link. Create your page in minutes. No technical skills required.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & GDPR</h3>
              <p className="text-gray-600 leading-relaxed">
                Enterprise-grade security with GDPR compliance. Your data is encrypted and protected at all times.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-pink-50 to-white rounded-2xl border border-pink-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                Start free and upgrade when you're ready. Monthly subscriptions with no long-term commitment.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-cyan-50 to-white rounded-2xl border border-cyan-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Public Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Your pages are publicly accessible. Visitors can view and listen without creating an account.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-5xl font-bold text-gray-900">0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited public pages</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited links</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Downloads blocked/limited</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Files are watermarked</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Ads enabled</span>
                </li>
              </ul>

              <button
                onClick={onGetStarted}
                className="w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-xl p-8 relative transform md:scale-105 hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-xl rounded-tr-xl font-bold text-sm">
                POPULAR
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-5xl font-bold text-white">4</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <p className="text-blue-100">For active creators</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">3 downloads per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">No ads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Invisible metadata watermark</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Monthly reset</span>
                </li>
              </ul>

              <button
                onClick={onGetStarted}
                className="w-full py-3 px-6 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Free Trial
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Creator</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-5xl font-bold text-gray-900">7</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For professionals</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">20 downloads per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">No ads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Clean files without watermark</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>

              <button
                onClick={onGetStarted}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                Upgrade Now
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              All plans include automatic monthly renewals. Cancel anytime, no questions asked.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
