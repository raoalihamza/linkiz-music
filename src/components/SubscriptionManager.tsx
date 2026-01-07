import { useState } from 'react';
import { Crown, Check, X, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanType = 'free' | 'starter' | 'creator';

export function SubscriptionManager({ isOpen, onClose }: SubscriptionManagerProps) {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleChangePlan = async (planType: PlanType) => {
    if (!user || profile?.plan_type === planType) return;

    setLoading(true);
    setMessage(null);

    try {
      const downloadLimits = {
        free: 0,
        starter: 3,
        creator: 20
      };

      const { error } = await supabase
        .from('user_profiles')
        .update({
          plan_type: planType,
          download_limit: downloadLimits[planType],
          downloads_used: 0
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Plan changé avec succès vers ${planType.charAt(0).toUpperCase() + planType.slice(1)}!`
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error changing plan:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors du changement de plan. Veuillez réessayer.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Gérer Votre Plan</h2>
          <p className="text-xl text-gray-600 mb-4">
            Changez de formule instantanément
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Mode Test: Changement gratuit sans paiement</span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">0</span>
                <span className="text-gray-600">/month</span>
              </div>
              {profile?.plan_type === 'free' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Current Plan
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited public pages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited links</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500">Downloads blocked</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500">Files watermarked</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500">Ads enabled</span>
              </li>
            </ul>

            <button
              disabled={profile?.plan_type === 'free'}
              onClick={() => handleChangePlan('free')}
              className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              {profile?.plan_type === 'free' ? 'Plan Actuel' : 'Passer à Free'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white relative transform scale-105 shadow-xl">
            <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 rounded-bl-xl rounded-tr-xl font-bold text-xs">
              POPULAR
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-4xl font-bold">4</span>
                <span className="text-blue-100">/month</span>
              </div>
              {profile?.plan_type === 'starter' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-medium">
                  Current Plan
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">3 downloads/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">No ads</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Metadata watermark only</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">Monthly reset</span>
              </li>
            </ul>

            <button
              disabled={profile?.plan_type === 'starter' || loading}
              onClick={() => handleChangePlan('starter')}
              className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Changement...' : profile?.plan_type === 'starter' ? 'Plan Actuel' : 'Passer à Starter'}
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-purple-300 p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Creator</h3>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">7</span>
                <span className="text-gray-600">/month</span>
              </div>
              {profile?.plan_type === 'creator' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Current Plan
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Everything in Starter</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">20 downloads/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">No ads</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Clean files (no watermark)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Priority support</span>
              </li>
            </ul>

            <button
              disabled={profile?.plan_type === 'creator' || loading}
              onClick={() => handleChangePlan('creator')}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Changement...' : profile?.plan_type === 'creator' ? 'Plan Actuel' : 'Passer à Creator'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Mode Test Activé
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Changez de plan instantanément sans paiement</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Testez toutes les fonctionnalités de chaque plan</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Les quotas de téléchargement sont réinitialisés à chaque changement</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Passez de Free à Creator ou inversement en un clic</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span className="text-orange-800 font-medium">En production, intégrer Stripe pour les paiements réels</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
